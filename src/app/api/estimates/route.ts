import { calculateEstimate, projectInputSchema } from '@/lib/engine';
import { json, readJson, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  return safeRoute(async () => json({ estimate: calculateEstimate(await readJson(request, projectInputSchema)) }));
}
