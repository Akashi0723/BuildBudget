'use client';

import { useEffect, type RefObject } from 'react';

const reduceQuery = '(prefers-reduced-motion: reduce)';
const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
let keyboardInteraction = false;

/** Keyboard tasks remain immediate; pointer interactions opt back into movement. */
export function useMotionInput() {
  useEffect(() => {
    const html = document.documentElement;
    const onKey = () => {
      keyboardInteraction = true;
      html.dataset.motionInput = 'keyboard';
      document.getAnimations().forEach(animation => {
        if (animation.id.startsWith('buildbudget-')) animation.cancel();
      });
    };
    const onPointer = () => { keyboardInteraction = false; html.dataset.motionInput = 'pointer'; };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer, true);
      delete html.dataset.motionInput;
    };
  }, []);
}

type MotionOptions = { enabled?: boolean; distance?: number; duration?: number };

/** Animate the existing node, never its React identity or business state. */
export function useMotionTransition<T extends HTMLElement>(
  ref: RefObject<T | null>,
  change: unknown,
  { enabled = true, distance = 12, duration = 280 }: MotionOptions = {},
) {
  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof node.animate !== 'function') return;
    const preference = window.matchMedia(reduceQuery);
    let animation: Animation | undefined;
    const stop = () => animation?.cancel();
    const onPreference = () => { if (preference.matches) stop(); };
    preference.addEventListener('change', onPreference);
    if (!preference.matches && !keyboardInteraction) {
      animation = node.animate([
        { opacity: 0.65, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration, easing });
      animation.id = 'buildbudget-transition';
    }
    return () => { stop(); preference.removeEventListener('change', onPreference); };
  }, [ref, change, enabled, distance, duration]);
}

/** One-time viewport entrances. Content is visible even without JS or observers. */
export function useScrollMotion<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const preference = window.matchMedia(reduceQuery);
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target as HTMLElement;
        observer.unobserve(node);
        if (preference.matches || keyboardInteraction || typeof node.animate !== 'function') continue;
        const image = node.dataset.motion === 'image';
        const delay = Number(node.dataset.motionOrder ?? 0) * 45;
        const animation = node.animate(image ? [
          { opacity: 0.65, clipPath: 'inset(8% 0 8% 0 round 12px)' },
          { opacity: 1, clipPath: 'inset(0 0 0 0 round 12px)' },
        ] : [
          { opacity: 0.45, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: image ? 520 : 420, delay, easing, fill: 'backwards' });
        animation.id = 'buildbudget-reveal';
        animations.add(animation);
        const forget = () => animations.delete(animation);
        animation.addEventListener('finish', forget, { once: true });
        animation.addEventListener('cancel', forget, { once: true });
      }
    }, { threshold: 0.12 });
    root.querySelectorAll('[data-motion]').forEach(node => observer.observe(node));
    // A focused control must never wait for a viewport reveal to settle.
    const settleFocus = (event: FocusEvent) => {
      for (const animation of animations) {
        const node = (animation.effect as KeyframeEffect | null)?.target;
        if (node instanceof HTMLElement && event.target instanceof Node && node.contains(event.target)) animation.cancel();
      }
    };
    const onPreference = () => {
      if (preference.matches) { animations.forEach(animation => animation.cancel()); observer.disconnect(); }
    };
    root.addEventListener('focusin', settleFocus);
    preference.addEventListener('change', onPreference);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', onPreference);
      root.removeEventListener('focusin', settleFocus);
    };
  }, [ref]);
}
