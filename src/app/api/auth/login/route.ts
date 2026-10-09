import { login, loginSchema, setSession } from '@/lib/auth';
import { json, readJson, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return safeRoute(async () => {
    const user = await login(await readJson(request, loginSchema));
    return setSession(json({ user }), request, user.id);
  });
}
