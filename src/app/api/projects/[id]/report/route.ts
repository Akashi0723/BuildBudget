import PDFDocument from 'pdfkit';
import { requireUser } from '@/lib/auth';
import { getProject } from '@/lib/db';
import { ApiError, safeRoute } from '@/lib/http';
import type { SavedProject } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const currency = (value: number) => `PHP ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const printable = (value: string) => value.replace(/×/g, 'x').replace(/m²/g, 'sq m').replace(/±/g, '+/-').replace(/[–—]/g, '-');

async function createReport(project: SavedProject): Promise<Buffer> {
  const document = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `${project.name} - BuildBudget PH estimate`, Author: 'BuildBudget PH' } });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
  });
  const estimate = project.estimate;
  const heading = (text: string) => document.moveDown(0.8).font('Helvetica-Bold').fontSize(13).fillColor('#101d32').text(text).moveDown(0.4);
  const line = (text: string) => document.font('Helvetica').fontSize(10).fillColor('#26332a').text(printable(text), { lineGap: 3 });
  document.font('Helvetica-Bold').fontSize(24).fillColor('#101d32').text('BUILDBUDGET PH');
  document.font('Helvetica').fontSize(11).fillColor('#5f6c61').text('Preliminary residential planning estimate');
  document.moveDown(1);
  document.font('Helvetica-Bold').fontSize(19).fillColor('#26332a').text(printable(project.name));
  line(`Saved ${new Date(project.createdAt).toISOString().slice(0, 10)}  |  Project ${project.id}`);
  line(`Report generated (Asia/Manila): ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'long' })}`);
  heading('Project details');
  line(`Location: ${estimate.input.city}, ${estimate.input.province}`);
  line(`Scope: ${estimate.input.type === 'new-house' ? 'New house' : 'Cosmetic / nonstructural renovation'} | Finish: ${estimate.input.finish}`);
  line(`Floor areas: ${estimate.input.floors.map(area => `${area} sq m`).join(' + ')} | Total: ${estimate.area} sq m`);
  line(`Adjusted inclusive rate: ${currency(estimate.rate)} / sq m | Location factor: ${estimate.locationFactor}`);
  if (estimate.input.budget !== null) line(`User target budget: ${currency(estimate.input.budget)}`);
  heading('Estimated project budget');
  document.font('Helvetica-Bold').fontSize(26).fillColor('#176a4d').text(currency(estimate.total));
  line(`Illustrative +/-15% scenario: ${currency(estimate.low)} to ${currency(estimate.high)}`);
  line(`Base: ${currency(estimate.base)} | Allowance: ${currency(Math.round(estimate.input.allowance * 100) / 100)}`);
  line(`Contingency: ${estimate.input.contingency}% = ${currency(estimate.contingencyAmount)}`);
  heading('Budget allocation');
  for (const category of estimate.categories) {
    line(`${category.name}: ${currency(category.amount)}`);
  }
  document.moveDown(0.5);
  line('These categories allocate the inclusive estimate; they are not measured quantities or separate additional markups.');
  heading('Model assumptions and rate provenance');
  for (const assumption of estimate.assumptions) { line(`- ${assumption}`); document.moveDown(0.4); }
  heading('Exclusions and limits');
  for (const exclusion of estimate.exclusions) { line(`- ${exclusion}`); document.moveDown(0.4); }
  heading('Professional review required');
  line('This prototype uses educational assumptions. Obtain site-specific quantities and current quotations, and seek review from a licensed civil engineer, architect, or quantity surveyor. This report does not establish building-permit compliance or certify design safety.');
  line(`Rate version: ${estimate.rateVersion} | Rate date: ${estimate.rateDate} | Estimate date: ${estimate.createdAt}`);
  document.end();
  return result;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return safeRoute(async () => {
    const user = requireUser(request);
    const { id } = await context.params;
    const project = getProject(user.id, id);
    if (!project) throw new ApiError(404, 'This project could not be found.');
    const file = await createReport(project);
    const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'project';
    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="buildbudget-${slug}.pdf"`,
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      },
    });
  });
}
