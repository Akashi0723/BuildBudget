import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const projectInput = {
  name: 'Browser validation project', type: 'new-house', province: 'Metro Manila', city: 'Quezon City',
  floors: [80], finish: 'standard', budget: 3000000, contingency: 10, allowance: 0,
};

async function navigate(page: Page, path: string, heading: string) {
  await page.goto(path);
  await expect(page.locator('.application')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
}

test('budget planner derives affordable options, enforces model limits, and passes the chosen input to the estimator', async ({ page }) => {
  await navigate(page, '/budget-planner', 'What can your budget build?');
  await page.getByRole('button', { name: 'Explore my options' }).click();
  await expect(page.locator('.planner-option')).toHaveCount(3);
  await expect(page.locator('.planner-area').nth(0)).toContainText('112.6');
  await expect(page.locator('.planner-area').nth(1)).toContainText('82.6');
  await expect(page.locator('.planner-area').nth(2)).toContainText('59');
  await page.locator('.planner-option').nth(1).getByRole('button', { name: 'Build on this option' }).click();
  await expect(page).toHaveURL(/\/projects\/new$/);
  await expect(page.getByLabel('Project name')).toHaveValue('Everyday comfort home');

  await navigate(page, '/budget-planner', 'What can your budget build?');
  await page.getByLabel('Total construction budget').fill('100000');
  await page.getByRole('button', { name: 'Explore my options' }).click();
  await expect(page.locator('.error-message[role="alert"]')).toContainText('starts at 10 m² per floor');
  await expect(page.locator('.planner-option')).toHaveCount(0);

  await page.getByLabel('Total construction budget').fill('1000000000');
  await page.getByRole('button', { name: 'Explore my options' }).click();
  await expect(page.locator('.planner-option')).toHaveCount(3);
  for (const area of await page.locator('.planner-area').all()) await expect(area).toContainText('500');
  await expect(page.getByText(/limited to 10–500 m² per floor/)).toBeVisible();

  await page.getByLabel('Project location').selectOption('Cebu');
  await expect(page.getByLabel('City / municipality')).toHaveValue('');
  await page.getByRole('button', { name: 'Explore my options' }).click();
  await expect(page.getByLabel('City / municipality')).toBeFocused();
  await page.getByLabel('City / municipality').fill('Cebu City');
  await page.getByLabel('Total construction budget').fill('3000000');
  await page.getByRole('button', { name: 'Explore my options' }).click();
  await expect(page.locator('.planner-area').first()).toContainText('118');
});

test('material tools calculate useful quantities and reject impossible openings', async ({ page }) => {
  await navigate(page, '/tools/materials', 'Material calculators');
  await page.getByRole('button', { name: 'Calculate quantities' }).click();
  await expect(page.locator('.material-main')).toHaveText('2.1 m³');
  await expect(page.locator('.material-result')).toContainText('17 bags');
  await expect(page.locator('.assumption-note')).toContainText('structural engineer');

  await page.getByRole('tab', { name: /Hollow blocks/ }).click();
  await page.getByRole('button', { name: 'Calculate quantities' }).click();
  await expect(page.locator('.material-main')).toHaveText('210 blocks');
  await page.getByLabel(/Doors & windows area/).fill('18');
  await page.getByRole('button', { name: 'Calculate quantities' }).click();
  await expect(page.locator('.error-message[role="alert"]')).toContainText('Openings must be smaller');
  await expect(page.locator('.material-main')).toHaveCount(0);

  await page.getByRole('tab', { name: /Tiles/ }).click();
  await page.getByRole('button', { name: 'Calculate quantities' }).click();
  await expect(page.locator('.material-main')).toHaveText('62 tiles');
  await page.getByRole('tab', { name: /Paint/ }).click();
  await page.getByRole('button', { name: 'Calculate quantities' }).click();
  await expect(page.locator('.material-main')).toHaveText('3.52 L');
  await page.getByRole('tab', { name: /Roofing/ }).click();
  await page.getByRole('button', { name: 'Calculate quantities' }).click();
  await expect(page.locator('.material-main')).toHaveText('120.16 m²');
  await page.getByRole('tab', { name: /Roofing/ }).focus();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: /Concrete/ })).toBeFocused();
  await expect(page.getByRole('tab', { name: /Concrete/ })).toHaveAttribute('aria-selected', 'true');
});

test('account and project workspace handle errors, focus, private storage, rename, duplicate, reports, and delete', async ({ page }) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `ui-${suffix}@example.com`;
  const name = `Validation home ${suffix}`;
  const renamed = `Renamed home ${suffix}`;
  await navigate(page, '/projects', 'My projects');
  await page.getByRole('button', { name: 'Sign in to view projects' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Email address')).toBeFocused();
  await dialog.getByLabel('Email address').fill(email);
  await dialog.getByLabel('Password').fill('Browser-test-unique-password');
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(dialog.getByRole('alert')).toContainText('email or password is incorrect');
  await dialog.getByRole('button', { name: 'Create account', exact: true }).click();
  await dialog.getByLabel('Full name').fill('Browser validation');
  await dialog.getByRole('button', { name: 'Create account', exact: true }).last().click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your first project starts here' })).toBeVisible();

  const savedResponse = await page.request.post('/api/projects', { data: { input: { ...projectInput, name } } });
  expect(savedResponse.status()).toBe(201);
  const { project } = await savedResponse.json();
  await page.reload();
  let card = page.locator('.project-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: `Rename ${name}`, exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Project name')).toBeFocused();
  await page.getByRole('dialog').getByLabel('Project name').fill(renamed);
  await expect(page.getByRole('dialog').getByLabel('Project name')).toBeFocused();
  await page.getByRole('button', { name: 'Save name', exact: true }).click();
  card = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: renamed, exact: true }) });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: `Duplicate ${renamed}`, exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await page.getByLabel('Search saved projects').fill('(copy)');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByLabel('Search saved projects').fill('');

  const downloadPromise = page.waitForEvent('download');
  await card.getByRole('link', { name: `Download report for ${renamed}`, exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  expect((await readFile(path!)).subarray(0, 5).toString()).toBe('%PDF-');
  await card.getByRole('button', { name: 'View estimate' }).click();
  await expect(page.getByRole('heading', { name: renamed, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Project saved', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Project saved', exact: true })).toBeDisabled();

  await navigate(page, '/projects', 'My projects');
  await page.route('**/api/projects', async route => {
    if (route.request().method() === 'GET') await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Storage temporarily unavailable. Please retry.' }) });
    else await route.continue();
  });
  await page.reload();
  await expect(page.locator('.error-message[role="alert"]')).toContainText('Storage temporarily unavailable');
  await page.unroute('**/api/projects');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  const copyName = `${renamed} (copy)`;
  const copy = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: copyName, exact: true }) });
  await copy.getByRole('button', { name: `Delete ${copyName}`, exact: true }).click();
  await page.getByRole('button', { name: 'Keep project', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(2);
  await copy.getByRole('button', { name: `Delete ${copyName}`, exact: true }).click();
  await page.getByRole('button', { name: 'Delete project', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  const remaining = await page.request.get(`/api/projects/${project.id}`);
  expect(remaining.status()).toBe(200);
  await page.getByRole('banner').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A place for your plans' })).toBeVisible();
  expect((await page.request.get(`/api/projects/${project.id}`)).status()).toBe(401);
});

test('supporting pages stay usable without horizontal overflow on phone and desktop', async ({ page }) => {
  const pages = [
    ['/budget-planner', 'What can your budget build?'], ['/tools/materials', 'Material calculators'],
    ['/projects', 'My projects'], ['/how-it-works', 'A clearer path to your dream home'],
    ['/pricing', 'Start building your plan. For free.'], ['/privacy', 'Privacy notice'], ['/terms', 'Terms of use'],
    ['/consultations', 'Build with professional guidance'],
  ];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, heading] of pages) {
      await navigate(page, path, heading);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
  }
});
