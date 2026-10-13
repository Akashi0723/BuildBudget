'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Boxes, Calculator, ClipboardList, Loader2 } from 'lucide-react';
import { api, peso, provinces } from '@/lib/client';
import type { Estimate, Finish, ProjectInput } from '@/lib/types';
import styles from './HomeDesk.module.css';
import { useMotionTransition, useScrollMotion } from './useMotion';

type Props = {
  onStart: () => void;
  onUse: (input: ProjectInput) => void;
  go: (view: string) => void;
};

export default function HomeDesk({ onStart, onUse, go }: Props) {
  const homeRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  useScrollMotion(homeRef);
  const [province, setProvince] = useState('Metro Manila');
  const [area, setArea] = useState('120');
  const [finish, setFinish] = useState<Finish>('standard');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const validArea = area.trim() !== '' && Number.isFinite(Number(area)) && Number(area) >= 10 && Number(area) <= 500;
  const input = useMemo<ProjectInput>(() => ({
    name: 'My home plan', type: 'new-house', province,
    city: 'To be confirmed', floors: [Number(area)], finish,
    budget: null, contingency: 10, allowance: 0,
  }), [province, area, finish]);

  useEffect(() => {
    const controller = new AbortController();
    if (!validArea) {
      setLoading(false);
      setError('Enter a floor area from 10 to 500 m².');
      return () => controller.abort();
    }
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      api<{ estimate: Estimate }>('/api/estimates', {
        method: 'POST', body: JSON.stringify(input), signal: controller.signal,
      }).then(data => {
        if (!controller.signal.aborted) setEstimate(data.estimate);
      }).catch(cause => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not calculate. Please retry.');
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [input, validArea, retry]);

  const current = validArea && estimate?.input.province === province && estimate.input.finish === finish && estimate.input.floors[0] === Number(area);
  const ready = current && !loading && !error;
  useMotionTransition(summaryRef, estimate, { enabled: !!ready, distance: 4, duration: 220 });
  const amount = (value?: number) => ready && value !== undefined ? peso(value) : '—';

  return <div ref={homeRef}>
    <section className={styles.desk} aria-labelledby="desk-title">
      <div className={styles.intro}>
        <h1 id="desk-title" data-motion="reveal">Make room<br />for your plans.</h1>
        <p data-motion="reveal" data-motion-order="1">A simpler way to plan your home construction budget<br className={styles.desktopBreak} /> in the Philippines. Get a clear picture before you build.</p>
        <div className={styles.actions} data-motion="reveal" data-motion-order="2">
          <button className="primary-btn" onClick={onStart}>Start free estimate <ArrowRight size={20} /></button>
          <button className="secondary-btn" onClick={() => go('planner')}>Start with my budget</button>
        </div>
      </div>

      <div className={styles.photo} data-motion="image">
        <Image src="/project-desk-house.png" alt="Illustrative two-storey tropical home with timber details and lush planting" width={1848} height={852} sizes="(max-width: 800px) 100vw, (max-width: 1200px) 60vw, (max-width: 1536px) 63vw, 968px" loading="eager" fetchPriority="high" />
      <span className={styles.photoCaption}>A little inspiration for what comes next. <small>Illustrative home</small></span>
      </div>

      <form className={styles.estimate} data-motion="reveal" data-motion-order="2" onSubmit={event => { event.preventDefault(); if (ready) onUse({ ...input, city: '' }); }}>
        <div className={styles.formIntro}>
          <h2>First, the numbers.</h2>
          <p>Try a quick estimate to see a reference budget for your plans.</p>
        </div>
        <div className={styles.fields}>
          <label htmlFor="quick-location">Location
            <select id="quick-location" value={province} onChange={event => setProvince(event.target.value)}>
              {provinces.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label htmlFor="quick-area">Floor area
            <div className={styles.unitInput}>
              <input id="quick-area" type="number" min={10} max={500} step="any" value={area} required aria-invalid={!validArea} aria-describedby={!validArea ? 'quick-error' : undefined} onChange={event => setArea(event.target.value)} />
              <span aria-hidden="true">m²</span>
            </div>
          </label>
          <label htmlFor="quick-finish">Finish
            <select id="quick-finish" value={finish} onChange={event => setFinish(event.target.value as Finish)}>
              <option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option>
            </select>
          </label>
        </div>
        <div className={styles.summary} ref={summaryRef} aria-live="polite" aria-busy={loading}>
          <div><span>Construction</span><strong>{amount(estimate?.base)}</strong></div>
          <div><span>10% contingency</span><strong>{amount(estimate?.contingencyAmount)}</strong></div>
          <div className={styles.total}><span>Reference total</span><strong>{amount(estimate?.total)}</strong></div>
        </div>
        <div className={styles.context}>
          {error ? <p id="quick-error" className="error-message" role="alert">{error} {validArea && <button type="button" className="text-btn" onClick={() => setRetry(value => value + 1)}>Retry</button>}</p>
            : <p>{loading ? <><Loader2 size={14} className="spin" /> Updating reference budget…</> : 'One-floor example · Demonstration rates'}</p>}
          <button type="submit" className={styles.continue} disabled={!ready}>Continue with this plan <ArrowRight size={17} /></button>
        </div>
      </form>
    </section>

    <section className={styles.tools} aria-labelledby="planning-tools-title">
      <div className={styles.toolsIntro} data-motion="reveal">
        <h2 id="planning-tools-title">A clearer next step.</h2>
        <p>Three practical tools to help you plan with confidence.</p>
      </div>
      {[
        { Icon: Calculator, title: 'Estimator', text: 'Get a reference budget based on your location, size, and finish level.', view: 'new' },
        { Icon: ClipboardList, title: 'Budget planner', text: 'Explore how much floor area your available budget could cover.', view: 'planner' },
        { Icon: Boxes, title: 'Material calculators', text: 'Estimate quantities for concrete, blocks, tiles, paint, and roofing.', view: 'materials' },
      ].map(({ Icon, title, text, view }, index) => <button key={view} className={styles.toolLink} data-motion="reveal" data-motion-order={index} onClick={() => go(view)}>
        <Icon size={32} strokeWidth={1.5} />
        <span><strong>{title}</strong><span>{text}</span></span>
        <ArrowRight size={18} className={styles.toolArrow} />
      </button>)}
    </section>
  </div>;
}
