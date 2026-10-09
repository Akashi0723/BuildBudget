import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate, RATE_DATE, RATE_METADATA, RATE_VERSION } from '../src/lib/engine';
import type { ProjectInput } from '../src/lib/types';

const input: ProjectInput = { name: 'Test house', type: 'new-house', province: 'Metro Manila', city: 'Quezon City', floors: [80], finish: 'standard', budget: null, contingency: 10, allowance: 0 };

test('inclusive cost formula uses total floor area, location, then contingency exactly once', () => {
  const estimate = calculateEstimate({ ...input, floors: [60, 40], allowance: 100_000 });
  assert.equal(estimate.area, 100);
  assert.equal(estimate.rate, 33_000);
  assert.equal(estimate.base, 3_300_000);
  assert.equal(estimate.contingencyAmount, 340_000);
  assert.equal(estimate.total, 3_740_000);
  assert.equal(estimate.low, 3_179_000);
  assert.equal(estimate.high, 4_301_000);
});

test('categories allocate the complete inclusive total without double-counting labor', () => {
  const estimate = calculateEstimate({ ...input, floors: [33.333], allowance: 150.25, contingency: 7.5 });
  assert.equal(estimate.categories.reduce((sum, item) => sum + Math.round(item.amount * 100), 0), Math.round(estimate.total * 100));
  assert.equal(estimate.total, Math.round((Math.round(33.333 * 33_000 * 100) + 15025) * 1.075) / 100);
});

test('scope and location factors are explicit and reproducible', () => {
  assert.equal(calculateEstimate({ ...input, type: 'renovation', province: 'Cebu' }).rate, 17_325);
  assert.equal(calculateEstimate({ ...input, province: 'Davao del Sur', finish: 'basic' }).rate, 22_000);
  const estimate = calculateEstimate(input);
  assert.equal(estimate.rateVersion, RATE_VERSION);
  assert.equal(estimate.rateDate, RATE_DATE);
  assert.equal(RATE_METADATA.approved, false);
  assert.match(RATE_METADATA.source, /demonstration/);
  assert.ok(estimate.assumptions.some(text => text.includes('Not approved')));
  assert.ok(estimate.exclusions.some(text => text.includes('building-permit')));
});

test('invalid areas, unsupported scope, nonfinite values, and excess contingency are rejected', () => {
  for (const patch of [
    { floors: [] }, { floors: [9] }, { floors: [501] }, { floors: [20, 20, 20, 20] },
    { floors: [Number.NaN] }, { floors: [Infinity] }, { contingency: 21 },
    { allowance: -1 }, { budget: -1 }, { type: 'commercial' }, { finish: 'luxury' },
  ]) assert.throws(() => calculateEstimate({ ...input, ...patch }));
});

test('changing a finish recalculates a comparable scope instead of promising structural savings', () => {
  const standard = calculateEstimate(input);
  const basic = calculateEstimate({ ...input, finish: 'basic' });
  assert.equal(standard.total, 2_904_000);
  assert.equal(basic.total, 2_129_600);
  assert.equal(standard.total - basic.total, 774_400);
  assert.equal(basic.area, standard.area);
});
