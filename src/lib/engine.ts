import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Estimate, ProjectInput } from './types';

export const RATE_VERSION = 'PH-DEMO-2026-10-09-v1';
export const RATE_DATE = '2026-10-09';
export const RATE_METADATA = {
  version: RATE_VERSION,
  date: RATE_DATE,
  approved: false,
  source: 'Educational demonstration assumptions; not market verified.',
} as const;
export const projectInputSchema = z.object({
  name: z.string().trim().min(1, 'Enter a project name.').max(100),
  type: z.enum(['new-house', 'renovation']),
  province: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  floors: z.array(z.number().finite().min(10).max(500)).min(1).max(3),
  finish: z.enum(['basic', 'standard', 'premium']),
  budget: z.number().finite().min(0).max(1_000_000_000).nullable(),
  contingency: z.number().finite().min(0).max(20),
  allowance: z.number().finite().min(0).max(100_000_000),
}).strict();

const rates = { basic: 22_000, standard: 30_000, premium: 42_000 } as const;
const allocation = [
  { name: 'Structure & civil works', weight: 35, color: '#176a4d' },
  { name: 'Architectural finishes', weight: 25, color: '#64917b' },
  { name: 'Labor & supervision', weight: 20, color: '#d7ae5b' },
  { name: 'Electrical & plumbing', weight: 12, color: '#627b93' },
  { name: 'Site & contractor overhead', weight: 8, color: '#b5bdaf' },
] as const;

export function locationFactor(province: string): number {
  if (province.toLowerCase() === 'metro manila') return 1.10;
  if (province.toLowerCase() === 'cebu') return 1.05;
  return 1;
}

/** Illustrative planning model. All arithmetic is rounded to integer centavos. */
export function calculateEstimate(rawInput: ProjectInput | unknown): Estimate {
  const input = projectInputSchema.parse(rawInput);
  const area = input.floors.reduce((sum, value) => sum + value, 0);
  const factor = locationFactor(input.province);
  const scopeFactor = input.type === 'renovation' ? 0.55 : 1;
  const rate = Math.round(rates[input.finish] * factor * scopeFactor * 100) / 100;
  const baseCents = Math.round(area * rate * 100);
  const allowanceCents = Math.round(input.allowance * 100);
  const contingencyCents = Math.round((baseCents + allowanceCents) * input.contingency / 100);
  const totalCents = baseCents + allowanceCents + contingencyCents;
  let allocatedCents = 0;
  const categories: Estimate['categories'] = allocation.map((category, index) => {
    const cents = index === allocation.length - 1 ? baseCents - allocatedCents : Math.round(baseCents * category.weight / 100);
    allocatedCents += cents;
    return {
      name: category.name, amount: cents / 100, color: category.color,
      note: 'Illustrative allocation of the inclusive base estimate; not a measured bill of quantities.',
    };
  });
  if (allowanceCents) categories.push({ name: 'Additional allowance', amount: allowanceCents / 100, color: '#b58d60', note: 'User allowance for additional items outside the base scope.' });
  categories.push({ name: 'Contingency reserve', amount: contingencyCents / 100, color: '#d9ded3', note: `${input.contingency}% of base cost plus additional allowance.` });

  return {
    id: randomUUID(), createdAt: new Date().toISOString(), input,
    area, rate, rateVersion: RATE_VERSION, rateDate: RATE_DATE, locationFactor: factor,
    base: baseCents / 100, contingencyAmount: contingencyCents / 100, total: totalCents / 100,
    low: Math.round(totalCents * 0.85) / 100, high: Math.round(totalCents * 1.15) / 100,
    categories,
    assumptions: [
      'Educational demonstration rates, authored for this prototype. Not approved, market-verified, or sourced from current supplier quotations.',
      `Rate schedule ${RATE_VERSION}, dated ${RATE_DATE}: basic PHP 22,000/m², standard PHP 30,000/m², premium PHP 42,000/m² before location and scope factors.`,
      'Location assumptions: Metro Manila ×1.10; Cebu ×1.05; Davao and every other location ×1.00. City selection does not further alter the rate.',
      'Floor area is the sum of the entered areas of all floors, not the lot area. One to three floors, 10–500 m² each.',
      'Base rates already include labor, supervision, contractor overhead, and electrical/plumbing allocations. The breakdown is illustrative and adds no extra labor markup.',
      input.type === 'renovation' ? 'Renovation applies a 0.55 scope factor for cosmetic, nonstructural work only. Structural alterations, demolition, defects, and building-condition risks need a site-specific professional estimate.' : 'New-house scope assumes a conventional low-rise residential building and normal site conditions.',
      `Additional allowance is added once; ${input.contingency}% contingency is then applied to the base cost plus that allowance.`,
      'The ±15% range is an illustrative cost scenario, not a statistical confidence interval or a guaranteed quotation.',
      'Amounts are calculated in integer centavos; displayed rounded pesos may have small rounding differences.',
    ],
    exclusions: [
      'Land purchase, financing, taxes outside contractor pricing, and legal costs.',
      'Professional design fees, permits, approvals, surveys, and utility connection fees.',
      'Furniture, appliances, specialist systems, major landscaping, and off-site works.',
      'Unusual ground conditions, retaining works, demolition, and structural remediation.',
      'This preliminary planning estimate is not a signed bill of quantities, construction contract, structural design, or building-permit document. Consult licensed Philippine professionals before committing funds or applying for permits.',
    ],
  };
}
