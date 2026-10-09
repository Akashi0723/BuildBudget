import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from './db';
import { ApiError } from './http';
import type { User } from './types';

const scryptAsync = promisify(scrypt);
export const SESSION_COOKIE = 'buildbudget_session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const emailSchema = z.string().trim().email().max(254).transform(email => email.toLowerCase());
export const registerSchema = z.object({ name: z.string().trim().min(1).max(80), email: emailSchema, password: z.string().min(10, 'Use at least 10 characters.').max(128) }).strict();
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).strict();

type UserRow = { id: string; name: string; email: string; password_hash: string };
function publicUser(row: UserRow): User { return { id: row.id, name: row.name, email: row.email }; }
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

async function passwordHash(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, 'hex');
  const actual = await scryptAsync(password, salt, 64) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function throttle(email: string): void {
  const key = tokenHash(`login:${email}`);
  const now = Date.now();
  const db = database();
  db.prepare('DELETE FROM login_attempts WHERE window_started < ?').run(now - 15 * 60 * 1000);
  const attempt = db.prepare('SELECT count, window_started FROM login_attempts WHERE key = ?').get(key) as { count: number; window_started: number } | undefined;
  if (attempt && attempt.count >= 5) throw new ApiError(429, 'Too many sign-in attempts. Please try again in 15 minutes.');
  db.prepare('INSERT INTO login_attempts (key, count, window_started) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1').run(key, now);
}

export async function register(input: z.infer<typeof registerSchema>): Promise<User> {
  const db = database();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(input.email)) throw new ApiError(409, 'An account already exists with this email. Sign in instead.');
  const hash = await passwordHash(input.password);
  const user: User = { id: randomUUID(), name: input.name, email: input.email };
  try {
    db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(user.id, user.name, user.email, hash, new Date().toISOString());
  } catch (error) {
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(input.email)) throw new ApiError(409, 'An account already exists with this email. Sign in instead.');
    throw error;
  }
  return user;
}

export async function login(input: z.infer<typeof loginSchema>): Promise<User> {
  throttle(input.email);
  const row = database().prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(input.email) as UserRow | undefined;
  // A fixed, valid scrypt hash keeps unknown-account requests on the same expensive path.
  const dummy = `scrypt:00000000000000000000000000000000:${'00'.repeat(64)}`;
  const valid = await verifyPassword(input.password, row?.password_hash || dummy);
  if (!row || !valid) throw new ApiError(401, 'The email or password is incorrect.');
  database().prepare('DELETE FROM login_attempts WHERE key = ?').run(tokenHash(`login:${input.email}`));
  return publicUser(row);
}

function sessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${SESSION_COOKIE}=`));
  const token = cookie?.slice(SESSION_COOKIE.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

export function currentUser(request: Request): User | null {
  const token = sessionToken(request);
  if (!token) return null;
  const row = database().prepare('SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').get(tokenHash(token), Date.now()) as UserRow | undefined;
  return row ? publicUser(row) : null;
}

export function requireUser(request: Request): User {
  const user = currentUser(request);
  if (!user) throw new ApiError(401, 'Sign in to access your saved projects.');
  return user;
}

function cookieOptions(request: Request) {
  return { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production' || new URL(request.url).protocol === 'https:', path: '/' };
}

export function setSession(response: NextResponse, request: Request, userId: string): NextResponse {
  const db = database();
  const old = sessionToken(request);
  if (old) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(old));
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(tokenHash(token), userId, Date.now() + SESSION_SECONDS * 1000);
  response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions(request), maxAge: SESSION_SECONDS });
  return response;
}

export function clearSession(response: NextResponse, request: Request): NextResponse {
  const token = sessionToken(request);
  if (token) database().prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token));
  response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions(request), maxAge: 0 });
  return response;
}
