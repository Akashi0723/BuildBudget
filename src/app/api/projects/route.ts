import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { listProjects, saveProject } from '@/lib/db';
import { calculateEstimate, projectInputSchema } from '@/lib/engine';
import { json, readJson, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return safeRoute(() => json({ projects: listProjects(requireUser(request).id) }));
}
export async function POST(request: Request) {
  return safeRoute(async () => {
    const user = requireUser(request);
    const { input } = await readJson(request, z.object({ input: projectInputSchema }).strict());
    return json({ project: saveProject(user.id, calculateEstimate(input)) }, 201);
  });
}
