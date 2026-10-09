import { clearSession } from '@/lib/auth';
import { checkMutationOrigin, json, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return safeRoute(() => {
    checkMutationOrigin(request);
    return clearSession(json({ success: true }), request);
  });
}
