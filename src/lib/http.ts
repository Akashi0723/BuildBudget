import { NextResponse } from 'next/server';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

/** JSON-only mutations plus Origin/Fetch Metadata checks protect cookie-backed actions. */
export function checkMutationOrigin(request: Request): void {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site' || site === 'same-site') throw new ApiError(403, 'Please submit this request from BuildBudget.');
  const origin = request.headers.get('origin');
  if (origin) {
    let parsed: URL;
    try { parsed = new URL(origin); } catch { throw new ApiError(403, 'Invalid request origin.'); }
    const host = request.headers.get('host') || new URL(request.url).host;
    const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || new URL(request.url).protocol.slice(0, -1);
    if (!['http', 'https'].includes(protocol) || parsed.protocol !== `${protocol}:` || parsed.host !== host) throw new ApiError(403, 'Please submit this request from BuildBudget.');
  }
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  checkMutationOrigin(request);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ApiError(415, 'Submit the request as JSON.');
  const declaredSize = Number(request.headers.get('content-length') || 0);
  if (declaredSize > 16_384) throw new ApiError(413, 'This request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'Enter the required information.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16_384) { await reader.cancel(); throw new ApiError(413, 'This request is too large.'); }
    chunks.push(value);
  }
  const body = Buffer.concat(chunks);
  let parsed: unknown;
  try { parsed = JSON.parse(body.toString('utf8')); } catch { throw new ApiError(400, 'The request contains invalid JSON.'); }
  return schema.parse(parsed);
}

export async function safeRoute(action: () => Promise<Response> | Response): Promise<Response> {
  try { return await action(); } catch (error) {
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      const field = issue.path.join('.');
      return json({ error: `Please check ${field || 'the entered information'}: ${issue.message}` }, 400);
    }
    // No stack traces, database details, personal information, or submitted values leave the server.
    console.error('BuildBudget request failed:', error instanceof Error ? error.name : 'UnknownError');
    return json({ error: 'We could not complete that request. Please try again.' }, 500);
  }
}
