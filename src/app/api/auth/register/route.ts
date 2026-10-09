import { register, registerSchema, setSession } from '@/lib/auth';
import { json, readJson, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return safeRoute(async () => {
    const user = await register(await readJson(request, registerSchema));
    return setSession(json({ user }, 201), request, user.id);
  });
}
