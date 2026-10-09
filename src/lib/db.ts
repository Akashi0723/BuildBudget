import { mkdirSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Estimate, SavedProject } from './types';

const state = globalThis as typeof globalThis & { buildBudgetDatabase?: DatabaseSync };

export function database(): DatabaseSync {
  if (state.buildBudgetDatabase) return state.buildBudgetDatabase;
  // The database is runtime state, never an asset to copy into a server build.
  const directory = resolve(/* turbopackIgnore: true */ process.env.BUILDBUDGET_DATA_DIR || join(process.cwd(), '.data'));
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = join(directory, 'buildbudget.sqlite');
  const db = new DatabaseSync(filename);
  chmodSync(filename, 0o600);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL, estimate_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS project_owners ON projects(user_id, updated_at);
    CREATE TABLE IF NOT EXISTS login_attempts (
      key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_started INTEGER NOT NULL
    );
  `);
  state.buildBudgetDatabase = db;
  return db;
}

type ProjectRow = { id: string; name: string; estimate_json: string; created_at: string; updated_at: string };
function projectFromRow(row: ProjectRow): SavedProject {
  return { id: row.id, name: row.name, createdAt: row.created_at, updatedAt: row.updated_at, estimate: JSON.parse(row.estimate_json) as Estimate };
}

export function listProjects(userId: string): SavedProject[] {
  return (database().prepare('SELECT id, name, estimate_json, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as ProjectRow[]).map(projectFromRow);
}

export function getProject(userId: string, id: string): SavedProject | null {
  const row = database().prepare('SELECT id, name, estimate_json, created_at, updated_at FROM projects WHERE user_id = ? AND id = ?').get(userId, id) as ProjectRow | undefined;
  return row ? projectFromRow(row) : null;
}

export function saveProject(userId: string, estimate: Estimate): SavedProject {
  const id = randomUUID();
  const now = new Date().toISOString();
  database().prepare('INSERT INTO projects (id, user_id, name, estimate_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, userId, estimate.input.name, JSON.stringify(estimate), now, now);
  return { id, name: estimate.input.name, estimate, createdAt: now, updatedAt: now };
}

export function renameProject(userId: string, id: string, name: string): SavedProject | null {
  const project = getProject(userId, id);
  if (!project) return null;
  project.name = name;
  project.estimate.input.name = name;
  project.updatedAt = new Date().toISOString();
  database().prepare('UPDATE projects SET name = ?, estimate_json = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(name, JSON.stringify(project.estimate), project.updatedAt, id, userId);
  return project;
}

export function deleteProject(userId: string, id: string): boolean {
  return database().prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
}
