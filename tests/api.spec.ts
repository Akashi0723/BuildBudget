import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

const input = {
  name: 'API integration house',
  type: 'new-house',
  province: 'Metro Manila',
  city: 'Quezon City',
  floors: [60, 40],
  finish: 'standard',
  budget: 4_000_000,
  contingency: 10,
  allowance: 100_000,
};

function account(label: string) {
  return {
    name: `${label} test owner`,
    email: `${label}-${randomUUID()}@example.test`,
    password: `test-password-${randomUUID()}`,
  };
}

test('guest estimates use validated formulas and reject malformed or foreign requests', async ({ request, baseURL }) => {
  const session = await request.get('/api/auth/session');
  expect(session.status()).toBe(200);
  expect(await session.json()).toEqual({ user: null });

  const response = await request.post('/api/estimates', { data: input });
  expect(response.status()).toBe(200);
  const { estimate } = await response.json();
  expect(estimate).toMatchObject({
    input,
    area: 100,
    rate: 33_000,
    base: 3_300_000,
    contingencyAmount: 340_000,
    total: 3_740_000,
    low: 3_179_000,
    high: 4_301_000,
    rateVersion: 'PH-DEMO-2026-10-09-v1',
    rateDate: '2026-10-09',
  });
  expect(estimate.categories.reduce((sum: number, category: { amount: number }) => sum + Math.round(category.amount * 100), 0)).toBe(374_000_000);
  expect(estimate.assumptions.join(' ')).toContain('Not approved');
  expect(estimate.exclusions.join(' ')).toContain('building-permit');
  expect(response.headers()['cache-control']).toBe('no-store');

  const sameOrigin = await request.post('/api/estimates', { data: input, headers: { Origin: baseURL! } });
  expect(sameOrigin.status()).toBe(200);
  const malformed = await request.post('/api/estimates', { data: Buffer.from('{"name":'), headers: { 'Content-Type': 'application/json' } });
  expect(malformed.status()).toBe(400);
  expect((await malformed.json()).error).toContain('invalid JSON');
  for (const invalid of [
    { ...input, floors: [0] },
    { ...input, floors: [20, 20, 20, 20] },
    { ...input, contingency: 21 },
    { ...input, allowance: -1 },
    { ...input, type: 'commercial' },
    { ...input, total: 1 },
  ]) {
    const result = await request.post('/api/estimates', { data: invalid });
    expect(result.status()).toBe(400);
    expect((await result.json()).error).toEqual(expect.any(String));
  }
  const wrongContentType = await request.post('/api/estimates', { data: JSON.stringify(input), headers: { 'Content-Type': 'text/plain' } });
  expect(wrongContentType.status()).toBe(415);
  const oversized = await request.post('/api/estimates', { data: { ...input, name: 'x'.repeat(17_000) } });
  expect(oversized.status()).toBe(413);
  const foreignOrigin = await request.post('/api/estimates', { data: input, headers: { Origin: 'https://foreign.example' } });
  expect(foreignOrigin.status()).toBe(403);
  const foreignSite = await request.post('/api/estimates', { data: input, headers: { 'Sec-Fetch-Site': 'cross-site' } });
  expect(foreignSite.status()).toBe(403);
});

test('authentication, saved project ownership, PDF, and logout work through HTTP', async ({ request, baseURL, playwright }) => {
  const owner = account('owner');
  expect((await request.get('/api/projects')).status()).toBe(401);
  expect((await request.post('/api/projects', { data: { input } })).status()).toBe(401);
  const weakPassword = await request.post('/api/auth/register', { data: { ...owner, password: 'short' } });
  expect(weakPassword.status()).toBe(400);

  const registration = await request.post('/api/auth/register', { data: { ...owner, email: owner.email.toUpperCase() } });
  expect(registration.status()).toBe(201);
  const { user } = await registration.json();
  expect(user).toEqual({ id: expect.any(String), name: owner.name, email: owner.email });
  expect(registration.headers()['set-cookie']).toContain('HttpOnly');
  expect(registration.headers()['set-cookie']).toContain('SameSite=lax');
  expect(registration.headers()['cache-control']).toBe('no-store');
  expect(await (await request.get('/api/auth/session')).json()).toEqual({ user });
  expect((await request.post('/api/auth/register', { data: owner })).status()).toBe(409);
  const existingCookies = (await request.storageState()).cookies;
  const sessionCookie = existingCookies.find(cookie => cookie.name === 'buildbudget_session');
  expect(sessionCookie).toBeDefined();

  const injectedTotal = await request.post('/api/projects', { data: { input, total: 1 } });
  expect(injectedTotal.status()).toBe(400);
  const saved = await request.post('/api/projects', { data: { input } });
  expect(saved.status()).toBe(201);
  const { project } = await saved.json();
  expect(project).toMatchObject({ name: input.name, estimate: { input, total: 3_740_000, rateVersion: 'PH-DEMO-2026-10-09-v1' } });
  expect(project.id).toEqual(expect.any(String));
  const projectPath = `/api/projects/${project.id}`;
  const loaded = await request.get(projectPath);
  expect(loaded.status()).toBe(200);
  expect(await loaded.json()).toEqual({ project });
  const projects = await (await request.get('/api/projects')).json();
  expect(projects.projects.map((item: { id: string }) => item.id)).toContain(project.id);

  const renamed = await request.patch(projectPath, { data: { name: 'Renamed integration house' } });
  expect(renamed.status()).toBe(200);
  expect((await renamed.json()).project).toMatchObject({ name: 'Renamed integration house', estimate: { input: { name: 'Renamed integration house' }, total: 3_740_000 } });
  const pdf = await request.get(`${projectPath}/report`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect(pdf.headers()['content-disposition']).toContain('attachment; filename="buildbudget-renamed-integration-house.pdf"');
  expect(pdf.headers()['cache-control']).toBe('no-store');
  const pdfBytes = await pdf.body();
  expect(pdfBytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdfBytes.length).toBeGreaterThan(3000);

  const otherContext = await playwright.request.newContext({ baseURL });
  try {
    const other = account('other');
    expect((await otherContext.post('/api/auth/register', { data: other })).status()).toBe(201);
    expect(await (await otherContext.get('/api/projects')).json()).toEqual({ projects: [] });
    expect((await otherContext.get(projectPath)).status()).toBe(404);
    expect((await otherContext.patch(projectPath, { data: { name: 'Unauthorized name' } })).status()).toBe(404);
    expect((await otherContext.delete(projectPath)).status()).toBe(404);
    expect((await otherContext.get(`${projectPath}/report`)).status()).toBe(404);
    const stillOwned = await request.get(projectPath);
    expect(stillOwned.status()).toBe(200);
    expect((await stillOwned.json()).project.name).toBe('Renamed integration house');
  } finally {
    await otherContext.dispose();
  }

  const foreignMutation = await request.patch(projectPath, { data: { name: 'Foreign origin' }, headers: { Origin: 'https://foreign.example' } });
  expect(foreignMutation.status()).toBe(403);
  expect((await request.post('/api/auth/logout')).status()).toBe(200);
  expect(await (await request.get('/api/auth/session')).json()).toEqual({ user: null });
  expect((await request.get(projectPath)).status()).toBe(401);
  expect((await request.get(`${projectPath}/report`)).status()).toBe(401);
  const revokedSession = await request.get('/api/auth/session', { headers: { Cookie: `${sessionCookie!.name}=${sessionCookie!.value}` } });
  expect(await revokedSession.json()).toEqual({ user: null });
  const wrongPassword = await request.post('/api/auth/login', { data: { email: owner.email, password: 'wrong-password' } });
  expect(wrongPassword.status()).toBe(401);
  const login = await request.post('/api/auth/login', { data: { email: owner.email, password: owner.password } });
  expect(login.status()).toBe(200);
  expect(await login.json()).toEqual({ user });
  expect((await request.get(projectPath)).status()).toBe(200);
  expect((await request.delete(projectPath)).status()).toBe(200);
  expect((await request.get(projectPath)).status()).toBe(404);
});

test('repeated wrong passwords are throttled and errors do not expose internals', async ({ request }) => {
  const owner = account('throttled');
  expect((await request.post('/api/auth/register', { data: owner })).status()).toBe(201);
  expect((await request.post('/api/auth/logout')).status()).toBe(200);
  for (let attempt = 0; attempt < 5; attempt++) {
    const wrongPassword = await request.post('/api/auth/login', { data: { email: owner.email, password: 'incorrect-password' } });
    expect(wrongPassword.status()).toBe(401);
    expect(await wrongPassword.json()).toEqual({ error: 'The email or password is incorrect.' });
  }
  const throttled = await request.post('/api/auth/login', { data: { email: owner.email, password: owner.password } });
  expect(throttled.status()).toBe(429);
  expect(await throttled.json()).toEqual({ error: 'Too many sign-in attempts. Please try again in 15 minutes.' });
  expect(await (await request.get('/api/auth/session')).json()).toEqual({ user: null });
});
