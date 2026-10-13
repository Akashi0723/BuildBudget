import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('.application')).toHaveAttribute('data-ready', 'true');
}

async function spatialMotionCount(page: Page) {
  return page.evaluate(() => document.getAnimations().filter(animation => {
    if (!animation.id.startsWith('buildbudget-') || animation.playState === 'finished') return false;
    const effect = animation.effect;
    return effect instanceof KeyframeEffect && effect.getKeyframes().some(frame => {
      const transform = frame.transform;
      return typeof transform === 'string' && transform !== 'none';
    });
  }).length);
}

test('animated navigation and wizard steps preserve edits, validation, and focus', async ({ page }) => {
  await ready(page, '/');
  await page.getByRole('button', { name: 'Start free estimate', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/new$/);
  await expect(page.locator('#main-content h1')).toBeFocused();

  await page.getByLabel('Project name', { exact: true }).fill('A home with a moving interface');
  await page.getByLabel('City / municipality', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('#main-content').getByRole('alert')).toContainText('city');
  await expect(page.getByLabel('Project name', { exact: true })).toHaveValue('A home with a moving interface');
  await page.getByLabel('City / municipality', { exact: true }).fill('Cebu City');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How much space are you planning?', exact: true })).toBeFocused();
  await page.getByLabel('Ground floor area').fill('123.45');

  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tell us about your project.', exact: true })).toBeFocused();
  await expect(page.getByLabel('Project name', { exact: true })).toHaveValue('A home with a moving interface');
  await expect(page.getByLabel('City / municipality', { exact: true })).toHaveValue('Cebu City');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Ground floor area')).toHaveValue('123.45');
  await expect(page.getByRole('heading', { name: 'How much space are you planning?', exact: true })).toBeFocused();

  await page.getByRole('button', { name: 'Back', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Tell us about your project.', exact: true })).toBeFocused();
  await expect(page.getByLabel('Project name', { exact: true })).toHaveValue('A home with a moving interface');
  await expect.poll(() => spatialMotionCount(page)).toBe(0);
});

test('reduced motion works at startup and cancels running movement without hiding content or breaking focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '/');
  await expect(page.getByRole('heading', { name: 'Make room for your plans.', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start free estimate', exact: true })).toBeEnabled();
  await page.getByRole('heading', { name: 'A clearer next step.', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: /^Material calculators/ })).toBeVisible();
  await expect.poll(() => spatialMotionCount(page)).toBe(0);
  expect(await page.locator('[data-motion]').evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return style.visibility !== 'hidden' && Number(style.opacity) > 0;
  }))).toBe(true);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Start free estimate', exact: true }).scrollIntoViewIfNeeded();
  // Hold actual app motion so the preference change must cancel it, not merely outlast it.
  const paused = await page.evaluate(async () => {
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(element => element.textContent?.trim().startsWith('Start free estimate'));
    button?.click();
    for (let frame = 0; frame < 30; frame++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const animations = document.getAnimations().filter(animation => {
        if (!animation.id.startsWith('buildbudget-') || animation.playState !== 'running') return false;
        return animation.effect instanceof KeyframeEffect && animation.effect.getKeyframes().some(keyframe => typeof keyframe.transform === 'string' && keyframe.transform !== 'none');
      });
      if (animations.length) {
        animations.forEach(animation => animation.pause());
        return animations.length;
      }
    }
    return 0;
  });
  expect(paused).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => spatialMotionCount(page)).toBe(0);
  await expect(page.getByLabel('Project name', { exact: true })).toBeVisible();
  await expect(page.locator('#main-content h1')).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
  await expect(navigation).toBeVisible();
  await navigation.getByRole('button', { name: 'Budget planner', exact: true }).click();
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('heading', { name: 'What can your budget build?', exact: true })).toBeFocused();
  const signIn = page.getByRole('banner').getByRole('button', { name: 'Sign in', exact: true });
  await signIn.click();
  await expect(page.getByRole('dialog').getByLabel('Email address')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(signIn).toBeFocused();
  await expect.poll(() => spatialMotionCount(page)).toBe(0);
});
