import BuildBudget from '@/components/BuildBudget';
import { notFound } from 'next/navigation';
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join('/');
  const views: Record<string,string> = {
    'projects/new': 'new', projects: 'projects', dashboard: 'projects', reports: 'projects',
    'sign-in': 'projects', 'sign-up': 'projects', estimate: 'result', optimize: 'optimize',
    'budget-planner': 'planner', 'tools/materials': 'materials',
    'how-it-works': 'how-it-works', features: 'features', pricing: 'pricing', about: 'about',
    privacy: 'privacy', terms: 'terms', consultations: 'consultations',
  };
  const initialView = views[path] || (/^projects\/[^/]+$/.test(path) ? 'result' : null);
  if (!initialView) notFound();
  return <BuildBudget initialView={initialView} />;
}
