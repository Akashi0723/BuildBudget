import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { deleteProject, getProject, renameProject } from '@/lib/db';
import { ApiError, checkMutationOrigin, json, readJson, safeRoute } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return safeRoute(async () => {
    const user = requireUser(request);
    const { id } = await context.params;
    const project = getProject(user.id, id);
    if (!project) throw new ApiError(404, 'This project could not be found.');
    return json({ project });
  });
}
export async function PATCH(request: Request, context: Context) {
  return safeRoute(async () => {
    const user = requireUser(request);
    const { id } = await context.params;
    const { name } = await readJson(request, z.object({ name: z.string().trim().min(1).max(100) }).strict());
    const project = renameProject(user.id, id, name);
    if (!project) throw new ApiError(404, 'This project could not be found.');
    return json({ project });
  });
}
export async function DELETE(request: Request, context: Context) {
  return safeRoute(async () => {
    checkMutationOrigin(request);
    const user = requireUser(request);
    const { id } = await context.params;
    if (!deleteProject(user.id, id)) throw new ApiError(404, 'This project could not be found.');
    return json({ success: true });
  });
}
