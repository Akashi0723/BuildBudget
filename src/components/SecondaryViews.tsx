'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowRight, Building2, Calculator, Check, CheckCircle2, ChevronRight, Copy, Download, FolderOpen, Hammer, Layers3, LoaderCircle, LockKeyhole, Mail, MapPin, Paintbrush, Pencil, Plus, Ruler, Search, ShieldCheck, Trash2, Triangle, UserRound, Wallet, X } from 'lucide-react';
import { api, peso, provinces, shortPeso } from '../lib/client';
import type { Estimate, Finish, ProjectInput, SavedProject, User } from '../lib/types';
import BrandMark from './BrandMark';

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function Loading({ label = 'Loading…' }: { label?: string }) {
  return <span className="loading-inline" role="status"><LoaderCircle size={18} className="spin" /> {label}</span>;
}

function Dialog({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const modal = ref.current;
    const selector = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';
    ((modal?.querySelector('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)') || modal?.querySelector(selector)) as HTMLElement | null)?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab' && modal) {
        const elements = Array.from(modal.querySelectorAll<HTMLElement>(selector));
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; before?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}><button className="modal-close icon-btn" aria-label="Close dialog" onClick={onClose}><X size={22} /></button><h2 id={titleId}>{title}</h2>{children}</div></div>;
}

export function ProjectsView({ onOpen, onNew, user, onSignIn }: { onOpen: (project: SavedProject) => void; onNew: () => void; user: User | null; onSignIn: () => void }) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [busy, setBusy] = useState<string | null>(null);
  const [edit, setEdit] = useState<SavedProject | null>(null);
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<SavedProject | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    if (!user) { setProjects([]); setLoading(false); return; }
    setLoading(true); setError('');
    api<{ projects: SavedProject[] }>('/api/projects').then(data => { if (active) setProjects(data.projects); }).catch(err => { if (active) setError(errorText(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, refresh]);
  const filtered = projects.filter(project => `${project.name} ${project.estimate.input.province} ${project.estimate.input.city}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'budget' ? b.estimate.total - a.estimate.total : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  async function duplicate(project: SavedProject) {
    setBusy(project.id); setError('');
    try { await api('/api/projects', { method: 'POST', body: JSON.stringify({ input: { ...project.estimate.input, name: `${project.name} (copy)`.slice(0, 100) } }) }); setRefresh(value => value + 1); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(null); }
  }
  async function rename(event: FormEvent) {
    event.preventDefault(); if (!edit || !name.trim()) return;
    setBusy(edit.id); setError('');
    try { await api(`/api/projects/${edit.id}`, { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) }); setEdit(null); setRefresh(value => value + 1); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(null); }
  }
  async function remove() {
    if (!deleting) return; setBusy(deleting.id); setError('');
    try { await api(`/api/projects/${deleting.id}`, { method: 'DELETE' }); setProjects(list => list.filter(project => project.id !== deleting.id)); setDeleting(null); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(null); }
  }
  return <section className="secondary-page projects-page"><div className="page-heading"><div><h1>My projects</h1><p className="muted">Every idea, estimate, and next step. All in one place.</p></div><button className="primary-btn" onClick={onNew}><Plus size={18} /> New estimate</button></div>
    {!user ? <div className="card empty-state"><div className="icon-box"><FolderOpen size={32} /></div><h2>A place for your plans</h2><p>Sign in to securely save estimates, revisit your budget, and download project reports.</p><button className="primary-btn" onClick={onSignIn}>Sign in to view projects <ArrowRight size={17} /></button><button className="secondary-btn" onClick={onNew}>Try the estimator first</button></div> : <>
      <div className="projects-toolbar"><label className="search-field"><Search size={18} /><input aria-label="Search saved projects" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your projects…" /></label><label className="sort-field"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recently updated</option><option value="name">Project name</option><option value="budget">Highest estimate</option></select></label></div>
      {error && <div className="error-message" role="alert">{error} <button onClick={() => setRefresh(value => value + 1)}>Retry</button></div>}
      {loading ? <div className="card empty-state"><Loading label="Loading your projects…" /></div> : filtered.length ? <><p className="muted project-count">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</p><div className="tool-grid project-grid">{filtered.map(project => <article className="card project-card" key={project.id}><div className="project-card-top"><div className="icon-box"><Building2 size={23} /></div><span className="badge">{project.estimate.input.type === 'renovation' ? 'Renovation' : 'New construction'}</span></div><h2>{project.name}</h2><p className="project-location muted"><MapPin size={14} /> {[project.estimate.input.city, project.estimate.input.province].filter(Boolean).join(', ')}</p><div className="project-amount">{shortPeso(project.estimate.total)}<span>preliminary estimate</span></div><div className="project-details"><span>{project.estimate.area.toLocaleString()} m²</span><span>{project.estimate.input.floors.length} {project.estimate.input.floors.length === 1 ? 'floor' : 'floors'}</span><span className="capitalize">{project.estimate.input.finish} finish</span></div><p className="project-date muted">Updated {new Date(project.updatedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p><button className="primary-btn full-width" onClick={() => onOpen(project)}>View estimate <ArrowRight size={17} /></button><div className="project-actions"><a className="icon-btn" href={`/api/projects/${project.id}/report`} title="Download PDF report" aria-label={`Download report for ${project.name}`}><Download size={17} /></a><button className="icon-btn" aria-label={`Rename ${project.name}`} title="Rename project" disabled={busy === project.id} onClick={() => { setEdit(project); setName(project.name); }}><Pencil size={17} /></button><button className="icon-btn" aria-label={`Duplicate ${project.name}`} title="Duplicate project" disabled={busy === project.id} onClick={() => duplicate(project)}><Copy size={17} /></button><button className="icon-btn danger" aria-label={`Delete ${project.name}`} title="Delete project" disabled={busy === project.id} onClick={() => setDeleting(project)}><Trash2 size={17} /></button>{busy === project.id && <Loading label="Updating…" />}</div></article>)}</div></> : !error && <div className="card empty-state"><div className="icon-box"><FolderOpen size={32} /></div><h2>{query ? 'No matching projects' : 'Your first project starts here'}</h2><p>{query ? 'Try a different project name or location.' : 'Create an estimate, then save it to compare possibilities as your plans take shape.'}</p><button className="primary-btn" onClick={query ? () => setQuery('') : onNew}>{query ? 'Clear search' : 'Create my first estimate'} <ArrowRight size={17} /></button></div>}
    </>}
    {edit && <Dialog title="Rename project" onClose={() => { if (!busy) setEdit(null); }}><form onSubmit={rename}>{error && <p className="error-message" role="alert">{error}</p>}<label className="field"><span>Project name</span><input autoComplete="off" required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label><div className="modal-actions"><button type="button" className="secondary-btn" disabled={!!busy} onClick={() => setEdit(null)}>Cancel</button><button className="primary-btn" disabled={!!busy}>{busy ? 'Saving…' : 'Save name'}</button></div></form></Dialog>}
    {deleting && <Dialog title="Delete this project?" onClose={() => { if (!busy) setDeleting(null); }}><p className="muted">“{deleting.name}” and its saved estimate will be permanently removed from your account. Download your report first if you want to keep a copy.</p>{error && <p className="error-message" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary-btn" disabled={!!busy} onClick={() => setDeleting(null)}>Keep project</button><button className="primary-btn danger-btn" disabled={!!busy} onClick={remove}>{busy ? 'Deleting…' : 'Delete project'}</button></div></Dialog>}
  </section>;
}

const finishNames: Record<Finish, string> = { basic: 'Practical essentials', standard: 'Everyday comfort', premium: 'Elevated living' };
const rates: Record<Finish, number> = { basic: 22000, standard: 30000, premium: 42000 };

export function PlannerView({ onUse }: { onUse: (input: ProjectInput) => void }) {
  const [budget, setBudget] = useState('3000000');
  const [province, setProvince] = useState('Metro Manila');
  const [city, setCity] = useState('Quezon City');
  const [floors, setFloors] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<Estimate[]>([]);
  const calculation = useRef(0);
  function invalidateOptions() {
    calculation.current += 1;
    setOptions([]); setError(''); setLoading(false);
  }
  async function calculate(event: FormEvent) {
    event.preventDefault(); setError(''); setOptions([]);
    const request = ++calculation.current;
    const amount = Number(budget), count = Number(floors);
    if (!Number.isFinite(amount) || amount < 100000 || amount > 1000000000 || ![1, 2, 3].includes(count)) { setError('Enter a construction budget from ₱100,000 to ₱1 billion and choose 1–3 floors.'); return; }
    const factor = province === 'Metro Manila' ? 1.1 : province === 'Cebu' ? 1.05 : 1;
    const finishes = (['basic', 'standard', 'premium'] as Finish[]).filter(finish => Math.floor((amount / (rates[finish] * factor * 1.1) / count) * 10) / 10 >= 10);
    if (!finishes.length) { setOptions([]); setError(`This model starts at 10 m² per floor. A ${count}-floor basic option needs at least ${peso(10 * count * rates.basic * factor * 1.1)} including contingency.`); return; }
    setLoading(true);
    try {
      const estimates = await Promise.all(finishes.map(async finish => {
        const perFloor = Math.min(500, Math.floor((amount / (rates[finish] * factor * 1.1) / count) * 10) / 10);
        const input: ProjectInput = { name: `${finishNames[finish]} home`, type: 'new-house', province, city: city.trim(), floors: Array(count).fill(perFloor), finish, budget: amount, contingency: 10, allowance: 0 };
        const result = await api<{ estimate: Estimate }>('/api/estimates', { method: 'POST', body: JSON.stringify(input) });
        return result.estimate;
      }));
      if (request === calculation.current) setOptions(estimates);
    } catch (err) { if (request === calculation.current) { setError(errorText(err)); setOptions([]); } }
    finally { if (request === calculation.current) setLoading(false); }
  }
  return <section className="secondary-page planner-page"><div className="page-heading"><div><h1>What can your budget build?</h1><p className="muted">Turn a number into possibilities. Compare floor areas across three finish levels.</p></div><div className="icon-box large"><Wallet size={30} /></div></div><div className="planner-layout"><form className="card planner-form" onSubmit={calculate}><h2>Let’s find your fit</h2><p className="muted">Your construction budget includes a 10% contingency.</p><label className="field"><span>Total construction budget</span><div className="input-prefix"><span>₱</span><input type="number" min="100000" max="1000000000" step="1" required value={budget} onChange={event => { setBudget(event.target.value); invalidateOptions(); }} /></div></label><div className="form-grid"><label className="field"><span>Project location</span><select value={province} onChange={event => { setProvince(event.target.value); setCity(''); invalidateOptions(); }}>{provinces.map(value => <option key={value}>{value}</option>)}</select></label><label className="field"><span>City / municipality</span><input required maxLength={80} value={city} onChange={event => { setCity(event.target.value); invalidateOptions(); }} placeholder="Enter your city" /></label><label className="field"><span>Number of floors</span><select value={floors} onChange={event => { setFloors(event.target.value); invalidateOptions(); }}><option value="1">1 floor</option><option value="2">2 floors</option><option value="3">3 floors</option></select></label></div><button className="primary-btn full-width" disabled={loading}>{loading ? <Loading label="Calculating…" /> : <>Explore my options <ArrowRight size={17} /></>}</button>{error && <p className="error-message" role="alert">{error}</p>}<p className="form-help">For new residential construction. Excludes land, professional fees, permits, furniture, and unusual site conditions.</p></form><aside className="card planner-note"><h2>Dream big.{' '}<br />Plan realistically.</h2><p className="muted">A smaller home with thoughtful finishes can be a better fit than a larger home that stretches your budget.</p><div className="planner-tip"><ShieldCheck size={20} /><p>We set aside 10% for the unexpected before estimating your floor area.</p></div><div className="planner-tip"><Ruler size={20} /><p>Areas are distributed equally between floors. Actual layouts require a design professional.</p></div></aside></div>
    {options.length > 0 && <div className="planner-results"><div className="section-heading"><div><h2>Your budget, explored</h2></div><span className="muted">Based on {peso(options[0].input.budget || 0)} · {options[0].input.province}</span></div><div className="tool-grid planner-options">{options.map(estimate => <article className={`card planner-option ${estimate.input.finish === 'standard' ? 'recommended' : ''}`} key={estimate.input.finish}>{estimate.input.finish === 'standard' && <span className="badge">Balanced choice</span>}<h3>{finishNames[estimate.input.finish]}</h3><div className="planner-area">{estimate.area.toLocaleString('en-PH', { maximumFractionDigits: 1 })}<span>m² total floor area</span></div><p className="muted">{estimate.input.floors.length > 1 ? `${estimate.input.floors[0]} m² per floor · ${estimate.input.floors.length} floors` : 'One thoughtfully sized floor'}</p><hr /><div className="cost-line"><span>Estimated construction</span><strong>{peso(estimate.base)}</strong></div><div className="cost-line"><span>10% contingency</span><strong>{peso(estimate.contingencyAmount)}</strong></div><div className="cost-line total"><span>Estimated total</span><strong>{peso(estimate.total)}</strong></div><button className="secondary-btn full-width" onClick={() => onUse(estimate.input)}>Build on this option <ArrowRight size={16} /></button></article>)}</div><p className="form-help">Indicative planning rates, not contractor quotations. Floor area is rounded down to 0.1 m² per floor and limited to 10–500 m² per floor. Options below the minimum are omitted. Design, soil conditions, and market prices can change costs.</p></div>}
  </section>;
}

type MaterialTool = 'concrete' | 'wall' | 'tiles' | 'paint' | 'roof';
type ToolField = { key: string; label: string; unit: string; min: number; max?: number; step?: string; value: string };
const materialTools: { id: MaterialTool; title: string; subtitle: string; icon: typeof Hammer; fields: ToolField[] }[] = [
  { id: 'concrete', title: 'Concrete', subtitle: 'Slabs & simple volumes', icon: Layers3, fields: [{ key: 'length', label: 'Length', unit: 'm', min: 0.01, value: '5' }, { key: 'width', label: 'Width', unit: 'm', min: 0.01, value: '4' }, { key: 'depth', label: 'Thickness', unit: 'm', min: 0.01, value: '0.1' }, { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, max: 50, value: '5' }] },
  { id: 'wall', title: 'Hollow blocks', subtitle: 'Wall quantities', icon: Building2, fields: [{ key: 'length', label: 'Wall length', unit: 'm', min: 0.01, value: '6' }, { key: 'height', label: 'Wall height', unit: 'm', min: 0.01, value: '3' }, { key: 'openings', label: 'Doors & windows area', unit: 'm²', min: 0, value: '2' }, { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, max: 50, value: '5' }] },
  { id: 'tiles', title: 'Tiles', subtitle: 'Floor & wall coverage', icon: Calculator, fields: [{ key: 'length', label: 'Surface length', unit: 'm', min: 0.01, value: '5' }, { key: 'width', label: 'Surface width', unit: 'm', min: 0.01, value: '4' }, { key: 'tileLength', label: 'Tile length', unit: 'mm', min: 1, value: '600' }, { key: 'tileWidth', label: 'Tile width', unit: 'mm', min: 1, value: '600' }, { key: 'waste', label: 'Cutting & waste allowance', unit: '%', min: 0, max: 50, value: '10' }] },
  { id: 'paint', title: 'Paint', subtitle: 'Coats & coverage', icon: Paintbrush, fields: [{ key: 'length', label: 'Wall length', unit: 'm', min: 0.01, value: '6' }, { key: 'height', label: 'Wall height', unit: 'm', min: 0.01, value: '3' }, { key: 'openings', label: 'Unpainted openings', unit: 'm²', min: 0, value: '2' }, { key: 'coats', label: 'Number of coats', unit: 'coats', min: 1, max: 10, step: '1', value: '2' }, { key: 'coverage', label: 'Coverage per liter', unit: 'm²/L', min: 0.01, value: '10' }, { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, max: 50, value: '10' }] },
  { id: 'roof', title: 'Roofing', subtitle: 'Pitched roof area', icon: Triangle, fields: [{ key: 'length', label: 'Building length', unit: 'm', min: 0.01, value: '10' }, { key: 'width', label: 'Building width', unit: 'm', min: 0.01, value: '8' }, { key: 'eaves', label: 'Eaves on each side', unit: 'm', min: 0, value: '0.5' }, { key: 'pitch', label: 'Roof pitch angle', unit: 'degrees', min: 0, max: 60, value: '25' }, { key: 'waste', label: 'Overlap & waste allowance', unit: '%', min: 0, max: 50, value: '10' }] },
];

type MaterialResult = { main: string; label: string; rows: { label: string; value: string }[]; assumption: string };
const quantity = (value: number, digits = 2) => value.toLocaleString('en-PH', { maximumFractionDigits: value > 0 && value < 0.01 ? 6 : digits });
const materialFormulas: Record<MaterialTool, string> = {
  concrete: 'Volume (m³) = length (m) × width (m) × thickness (m) × (1 + waste ÷ 100).',
  wall: 'Blocks = round up [(length × height − openings in m²) × 12.5 blocks/m² × (1 + waste ÷ 100)].',
  tiles: 'Tiles = round up [surface area (m²) ÷ tile area (m²) × (1 + waste ÷ 100)]. Tile dimensions are converted from mm to m.',
  paint: 'Paint (L) = (length × height − openings in m²) × coats ÷ coverage (m²/L) × (1 + waste ÷ 100).',
  roof: 'Roofing (m²) = [(length + 2 × eaves) × (width + 2 × eaves) ÷ cos(pitch)] × (1 + waste ÷ 100). Lengths are in m; pitch is converted from degrees.',
};

export function MaterialsView() {
  const [active, setActive] = useState<MaterialTool>('concrete');
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(materialTools[0].fields.map(field => [field.key, field.value])));
  const [result, setResult] = useState<MaterialResult | null>(null);
  const [error, setError] = useState('');
  const tool = materialTools.find(item => item.id === active)!;
  function select(id: MaterialTool) { const next = materialTools.find(item => item.id === id)!; setActive(id); setValues(Object.fromEntries(next.fields.map(field => [field.key, field.value]))); setError(''); setResult(null); }
  function tabKey(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % materialTools.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + materialTools.length) % materialTools.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = materialTools.length - 1;
    else return;
    event.preventDefault();
    select(materialTools[next].id);
    document.getElementById(`material-tab-${materialTools[next].id}`)?.focus();
  }
  function calculate(event: FormEvent) {
    event.preventDefault(); setError(''); setResult(null);
    const numbers = Object.fromEntries(tool.fields.map(field => [field.key, Number(values[field.key])]));
    for (const field of tool.fields) { if (!values[field.key]?.trim() || !Number.isFinite(numbers[field.key]) || numbers[field.key] < field.min || numbers[field.key] > (field.max ?? 100000)) { setError(`Enter a valid ${field.label.toLowerCase()} within the displayed range.`); return; } }
    const n = numbers, multiplier = 1 + n.waste / 100;
    if ((active === 'wall' || active === 'paint') && n.openings >= n.length * n.height) { setError('Openings must be smaller than the total wall area.'); return; }
    if (active === 'paint' && !Number.isInteger(n.coats)) { setError('Enter a whole number of paint coats.'); return; }
    if (active === 'concrete') {
      const wet = n.length * n.width * n.depth, order = wet * multiplier, dry = order * 1.54;
      setResult({ main: `${quantity(order)} m³`, label: 'Concrete including waste', rows: [{ label: 'Net concrete volume', value: `${quantity(wet)} m³` }, { label: '40 kg cement bags', value: `${Math.ceil(dry / 7 / 0.028)} bags` }, { label: 'Sand', value: `${quantity(dry * 2 / 7)} m³` }, { label: 'Gravel', value: `${quantity(dry * 4 / 7)} m³` }], assumption: 'Illustrative 1:2:4 volumetric mix; dry volume factor 1.54 and 0.028 m³ per 40 kg cement bag. These quantities do not specify concrete strength. A structural engineer must specify the mix and reinforcement; ready-mix orders use the concrete volume.' });
    } else if (active === 'wall') {
      const area = n.length * n.height - n.openings;
      setResult({ main: `${Math.ceil(area * 12.5 * multiplier).toLocaleString()} blocks`, label: 'Estimated hollow blocks', rows: [{ label: 'Net wall area', value: `${quantity(area)} m²` }, { label: 'Blocks before waste', value: `${Math.ceil(area * 12.5).toLocaleString()} blocks` }, { label: 'Waste allowance', value: `${n.waste}%` }], assumption: 'Based on 400 × 200 mm nominal hollow blocks (12.5 blocks per m²), including mortar joints. Excludes mortar, reinforcement, plaster, columns, and lintels. Verify actual block dimensions and wall design.' });
    } else if (active === 'tiles') {
      const area = n.length * n.width, tileArea = n.tileLength / 1000 * (n.tileWidth / 1000);
      setResult({ main: `${Math.ceil(area / tileArea * multiplier).toLocaleString()} tiles`, label: 'Estimated tiles to order', rows: [{ label: 'Surface area', value: `${quantity(area)} m²` }, { label: 'Area per tile', value: `${quantity(tileArea, 4)} m²` }, { label: 'Coverage including waste', value: `${quantity(area * multiplier)} m²` }], assumption: 'Area-based count without subtracting grout joints. Round up to whole supplier boxes. Diagonal layouts and many cuts may require more waste; adhesive and grout are excluded.' });
    } else if (active === 'paint') {
      const area = n.length * n.height - n.openings, liters = area * n.coats / n.coverage * multiplier;
      setResult({ main: `${quantity(liters)} L`, label: 'Estimated finish paint', rows: [{ label: 'Net paintable area', value: `${quantity(area)} m²` }, { label: 'Total coated area', value: `${quantity(area * n.coats)} m²` }, { label: 'Specified coverage', value: `${n.coverage} m²/L per coat` }], assumption: 'Use the coverage shown on your selected paint. Surface texture and absorption affect yield. Primer, fillers, and surface preparation are excluded. Round up to available container sizes.' });
    } else {
      const plan = (n.length + 2 * n.eaves) * (n.width + 2 * n.eaves), roofArea = plan / Math.cos(n.pitch * Math.PI / 180);
      setResult({ main: `${quantity(roofArea * multiplier)} m²`, label: 'Estimated roofing coverage', rows: [{ label: 'Plan area with eaves', value: `${quantity(plan)} m²` }, { label: 'Sloped area before waste', value: `${quantity(roofArea)} m²` }, { label: 'Roof pitch', value: `${n.pitch}°` }], assumption: 'Simple rectangular gable roof with equal pitches. Coverage includes your overlap and waste allowance. Excludes ridges, flashings, gutters, fasteners, and framing. Complex roof geometry needs a measured takeoff.' });
    }
  }
  return <section className="secondary-page materials-page"><div className="page-heading"><div><h1>Material calculators</h1><p className="muted">Get a practical quantity estimate before you make your materials list.</p></div><div className="icon-box large"><Hammer size={28} /></div></div><div className="material-tabs" role="tablist" aria-label="Material calculator">{materialTools.map((item, index) => { const Icon = item.icon; return <button role="tab" tabIndex={active === item.id ? 0 : -1} onKeyDown={event => tabKey(event, index)} aria-selected={active === item.id} aria-controls={`material-panel-${item.id}`} id={`material-tab-${item.id}`} className={active === item.id ? 'active' : ''} onClick={() => select(item.id)} key={item.id}><Icon size={22} /><span>{item.title}<small>{item.subtitle}</small></span></button>; })}</div><div className="materials-layout" role="tabpanel" id={`material-panel-${active}`} aria-labelledby={`material-tab-${active}`}><form className="card material-form" onSubmit={calculate}><div className="section-heading"><h2>{tool.title} calculator</h2><span className="badge">Metric units</span></div><p className="formula-note"><strong>Formula</strong> {materialFormulas[active]}</p><div className="form-grid">{tool.fields.map(field => <label className="field" key={field.key}><span>{field.label} <small>({field.unit})</small></span><input type="number" required min={field.min} max={field.max ?? 100000} step={field.step ?? 'any'} value={values[field.key]} onChange={event => { setValues(current => ({ ...current, [field.key]: event.target.value })); setResult(null); setError(''); }} /></label>)}</div><button className="primary-btn full-width"><Calculator size={18} /> Calculate quantities</button>{error && <p className="error-message" role="alert">{error}</p>}</form><aside className={`card material-result ${result ? 'has-result' : ''}`} aria-live="polite">{result ? <><div className="material-main">{result.main}</div><p className="muted">{result.label}</p><div className="material-result-rows">{result.rows.map(row => <div className="cost-line" key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}</div><div className="assumption-note"><ShieldCheck size={20} /><p>{result.assumption}</p></div></> : <><div className="icon-box"><Ruler size={32} /></div><h2>Measure twice.<br />Order with confidence.</h2><p className="muted">Enter your dimensions to see quantities, waste allowances, and the assumptions behind the calculation.</p><span className="badge">Clear formulas · No guesswork</span></>}</aside></div><p className="form-help">For preliminary planning. Check measurements, manufacturer specifications, and site requirements with your contractor before purchasing materials.</p></section>;
}

export function AccountModal({ mode: initialMode, onClose, onSuccess }: { mode: 'login' | 'register'; onClose: () => void; onSuccess: (user: User) => void }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await api<{ user: User }>(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify({ ...(mode === 'register' ? { name: name.trim() } : {}), email: email.trim(), password }) }); onSuccess(data.user); }
    catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  }
  return <Dialog title={mode === 'login' ? 'Welcome back' : 'Make room for your next idea'} onClose={onClose}><div className="auth-brand"><BrandMark/></div><p className="muted">Save your projects and pick up right where you left off.</p><div className="auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button></div><form onSubmit={submit}>{mode === 'register' && <label className="field"><span>Full name</span><div className="input-icon"><UserRound size={17} /><input required minLength={1} maxLength={80} value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Juan Dela Cruz" /></div></label>}<label className="field"><span>Email address</span><div className="input-icon"><Mail size={17} /><input type="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" /></div></label><label className="field"><span>Password</span><div className="input-icon"><LockKeyhole size={17} /><input type="password" required minLength={mode === 'register' ? 10 : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder={mode === 'register' ? 'At least 10 characters' : 'Enter your password'} /></div></label>{error && <p className="error-message" role="alert">{error}</p>}<button className="primary-btn full-width" disabled={busy}>{busy ? <Loading label="Please wait…" /> : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></>}</button></form><div className="auth-notice"><ShieldCheck size={17} /><p>Demo account service. Email verification and password reset are not available yet. Use a unique password.</p></div>{mode === 'register' && <p className="form-help">By creating an account, you agree to this demo’s terms and privacy notice. Avoid saving sensitive personal or financial details.</p>}</Dialog>;
}

const infoSteps = [
  { title: 'Tell us about your project', description: 'Choose your location, project type, floor area, finish level, and contingency. You can start without an account.', icon: Building2 },
  { title: 'Understand your estimate', description: 'See a total, an indicative range, and a clear breakdown across construction categories. Every estimate includes its assumptions and exclusions.', icon: Calculator },
  { title: 'Find a more comfortable budget', description: 'Compare finish levels and floor areas with the optimizer. See the impact of each choice before changing your plan.', icon: Wallet },
  { title: 'Save your next step', description: 'Create an account to save your project. Download a PDF report to discuss with your architect, engineer, or contractor.', icon: Download },
];

export function InfoView({ page, onStart }: { page: string; onStart: () => void }) {
  const normalized = page.toLowerCase().replace(/\s+/g, '-');
  if (normalized === 'privacy' || normalized === 'privacy-policy') return <section className="secondary-page legal-page"><div className="page-heading"><div><h1>Privacy notice</h1><p className="muted">A clear explanation of how this demonstration handles your data.</p></div></div><article className="card legal-copy"><h2>What we collect</h2><p>Creating an account stores your name, email address, and a password hash. Saved projects store the details you enter, the resulting estimate, and creation and update dates. Your password is never stored as plain text.</p><h2>Why we use it</h2><p>Your information supports sign-in, private project storage, and report generation. A session cookie keeps you signed in. The demonstration does not sell your information or run advertising trackers.</p><h2>Your projects and control</h2><p>You can view, download, rename, and delete saved projects from My Projects. Avoid entering exact home addresses, government identification numbers, payment information, or other sensitive information into project names or details.</p><h2>Storage and limitations</h2><p>This is a development demonstration. Its account and project database is stored on the application server; environment resets or redeployment may erase it. Download reports you need to keep. Account deletion, a privacy contact, and a verified retention policy must be established before public production deployment.</p><h2>Philippine privacy requirements</h2><p>A production service must provide a named personal information controller, lawful processing grounds, retention periods, security controls, and procedures for access, correction, erasure, and complaints under Republic Act No. 10173, the Data Privacy Act of 2012.</p><p><a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noreferrer">Read the National Privacy Commission’s Data Privacy Act guidance <ArrowRight size={14} /></a></p></article></section>;
  if (normalized === 'terms' || normalized === 'terms-of-service') return <section className="secondary-page legal-page"><div className="page-heading"><div><h1>Terms of use</h1><p className="muted">What these estimates can help you do, and where professional judgment is essential.</p></div></div><article className="card legal-copy"><h2>Preliminary estimates</h2><p>Budget Build provides indicative construction estimates and material quantities for early planning. Results are based on stated assumptions and illustrative planning rates. They are not quotations, construction contracts, structural designs, bills of quantities, or guarantees of final cost.</p><h2>Design and building permits</h2><p>These reports cannot replace signed and sealed plans, specifications, engineering calculations, or documents required by your local government for building permits. Consult appropriately licensed Philippine professionals and your local Office of the Building Official.</p><h2>Your inputs and actual conditions</h2><p>Check measurements, finish specifications, local labor and material prices, soil conditions, site access, and contractor proposals before committing to a project. Land, professional fees, permits, furniture, financing, and abnormal site conditions are excluded unless an estimate explicitly says otherwise.</p><h2>Accounts and demonstration availability</h2><p>Use a unique password and keep your account access private. This demonstration may be updated or reset without preserving saved projects. Download your reports. Email verification, password recovery, paid subscriptions, and professional consultation bookings are not currently available.</p><h2>Responsible use</h2><p>Do not submit another person’s private information, attempt to access another account, or use the service to misrepresent an estimate as professionally certified. Have a licensed professional review any decision affecting structural safety or legal compliance.</p></article></section>;
  if (normalized === 'consultations' || normalized === 'consultation') return <section className="secondary-page"><div className="page-heading"><div><h1>Build with professional guidance</h1><p className="muted">Your estimate is the starting point for a more informed discussion.</p></div></div><div className="card consultation-card"><div className="icon-box large"><UserRound size={32} /></div><span className="badge">Coming later</span><h2>Professional consultations</h2><p className="muted">A verified professional directory and booking service are planned. No professionals or appointment slots are listed in this demonstration.</p><button className="primary-btn" onClick={onStart}>Prepare a project estimate <ArrowRight size={17} /></button></div><div className="tool-grid"><div className="card"><h3>Architect</h3><p className="muted">Discuss space planning, layouts, finish specifications, and architectural permit documents.</p></div><div className="card"><h3>Civil or structural engineer</h3><p className="muted">Review structural design, soil and site requirements, and engineering documentation.</p></div><div className="card"><h3>Contractor</h3><p className="muted">Request an itemized quotation, construction schedule, payment terms, and clear scope.</p></div></div></section>;
  if (normalized === 'pricing') return <section className="secondary-page"><div className="page-heading"><div><h1>Start building your plan. For free.</h1><p className="muted">All working features in this demonstration are free to explore.</p></div></div><div className="pricing-layout"><div className="card pricing-card"><span className="badge">Available now</span><h2>Free planning tools</h2><div className="pricing-amount">₱0<span>No payment required</span></div><ul className="info-list">{['Construction estimates and cost breakdowns', 'Budget optimization and finish comparisons', 'Budget-to-build planner', 'Five material quantity calculators', 'Saved projects with a free account', 'Downloadable PDF project reports'].map(item => <li key={item}><Check size={18} />{item}</li>)}</ul><button className="primary-btn full-width" onClick={onStart}>Create a free estimate <ArrowRight size={17} /></button></div><div className="card pricing-future"><div className="icon-box"><Layers3 size={28} /></div><h2>More possibilities ahead</h2><p className="muted">Verified professional consultations and advanced planning tools are planned. Subscription pricing and payment processing have not been launched.</p><p className="form-help">We will clearly describe any future paid offering before collecting payment.</p></div></div></section>;
  if (normalized === 'about') return <section className="secondary-page"><div className="page-heading"><div><h1>Every great build starts with clarity.</h1><p className="muted">Budget Build helps Filipino homeowners turn early ideas into informed budget conversations.</p></div></div><div className="card about-hero"><div><h2>From “Can I afford it?”<br />to “Here’s my plan.”</h2><p>Planning a home can feel overwhelming when cost information is scattered or difficult to compare. We bring floor area, finish choices, contingency, and construction categories into one approachable workspace.</p><p>This demonstration combines civil engineering planning concepts with practical web tools. Its purpose is to make early decisions easier while keeping the role of licensed professionals clear.</p><button className="primary-btn" onClick={onStart}>Explore your project <ArrowRight size={17} /></button></div><div className="about-illustration"><Building2 size={108} strokeWidth={1} /><span>Plan thoughtfully.<br />Build confidently.</span></div></div><div className="tool-grid">{[{ icon: Calculator, title: 'Transparent calculations', text: 'Visible assumptions and exclusions, so you can understand what a number means.' }, { icon: MapPin, title: 'Philippine context', text: 'Peso estimates, metric measurements, and regional planning adjustments.' }, { icon: ShieldCheck, title: 'Professional judgment', text: 'Clear boundaries between early budget planning and certified design or permit work.' }].map(item => <article className="card" key={item.title}><div className="icon-box"><item.icon size={24} /></div><h3>{item.title}</h3><p className="muted">{item.text}</p></article>)}</div></section>;
  const isFeatures = normalized === 'features';
  return <section className="secondary-page info-page"><div className="page-heading"><div><h1>{isFeatures ? 'Tools for your next big build' : 'A clearer path to your dream home'}</h1><p className="muted">{isFeatures ? 'Practical tools that turn project details into a budget you can understand.' : 'A few project details are all you need to get started.'}</p></div></div><div className="tool-grid info-step-grid">{infoSteps.map((step, index) => <article className="card info-step" key={step.title}><div className="info-step-top"><div className="icon-box"><step.icon size={26} /></div>{!isFeatures && <span className="step-number">0{index + 1}</span>}</div><h2>{step.title}</h2><p className="muted">{step.description}</p></article>)}</div>{isFeatures && <div className="card additional-feature"><div className="icon-box"><Hammer size={26} /></div><div><h2>A practical materials toolkit</h2><p className="muted">Calculate concrete volume, hollow blocks, tiles, paint, and pitched roofing. Each tool shows its formula assumptions and waste allowance.</p></div><CheckCircle2 size={24} /></div>}<div className="card info-cta"><div><h2>Your first estimate is a few details away.</h2><p className="muted">Free to explore. No account needed to calculate.</p></div><button className="primary-btn" onClick={onStart}>Start my estimate <ChevronRight size={18} /></button></div></section>;
}
