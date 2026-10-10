import { test, expect } from '@playwright/test';

test('quick estimate accepts decimals and keeps the chosen plan through a late session response', async ({ page }) => {
  const response = await page.request.post('/api/estimates', { data: {
    name: 'Previous tab plan', type: 'new-house', province: 'Pangasinan', city: 'Dagupan',
    floors: [50], finish: 'standard', budget: null, contingency: 10, allowance: 0,
  } });
  const { estimate } = await response.json();
  await page.addInitScript(previous => {
    sessionStorage.setItem('buildbudget-estimate', JSON.stringify(previous));
  }, estimate);

  let releaseSession!: () => void;
  const sessionGate = new Promise<void>(resolve => { releaseSession = resolve; });
  await page.route('**/api/auth/session', async route => {
    await sessionGate;
    await route.fulfill({ json: { user: null } });
  });
  await page.goto('/');
  await expect(page.locator('.application')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('form')).toContainText('₱4,356,000');
  await page.getByRole('spinbutton', { name: /^Floor area/ }).fill('0');
  await expect(page.locator('#quick-error')).toContainText('10 to 500');
  await expect(page.getByRole('button', { name: 'Continue with this plan' })).toBeDisabled();

  await page.getByRole('spinbutton', { name: /^Floor area/ }).fill('120.05');
  await page.getByRole('combobox', { name: 'Location', exact: true }).selectOption('Cebu');
  await page.getByRole('combobox', { name: 'Finish', exact: true }).selectOption('basic');
  await expect(page.getByRole('button', { name: 'Continue with this plan' })).toBeEnabled();
  await page.getByRole('button', { name: 'Continue with this plan' }).click();
  await expect(page).toHaveURL(/\/projects\/new$/);

  const sessionResponse = page.waitForResponse('**/api/auth/session');
  releaseSession();
  await sessionResponse;
  await expect(page.getByLabel('Project name', { exact: true })).toHaveValue('My home plan');
  await expect(page.getByLabel('Province', { exact: true })).toHaveValue('Cebu');
  await expect(page.getByLabel('City / municipality', { exact: true })).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('buildbudget-estimate'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('buildbudget-project'))).toBeNull();
  await page.getByLabel('City / municipality', { exact: true }).fill('Cebu City');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Ground floor area')).toHaveValue('120.05');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'New estimate', exact: true }).click();
  await expect(page.locator('#main-content h1')).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden();
});
