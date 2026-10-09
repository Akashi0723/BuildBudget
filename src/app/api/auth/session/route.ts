import { currentUser } from '@/lib/auth';
import { json, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return safeRoute(() => json({ user: currentUser(request) }));
}
