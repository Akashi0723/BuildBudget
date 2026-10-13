---
name: BuildBudget
description: Clear homeowner planning with the approved Modular Block identity.
colors:
  paper: "#f5f3ed"
  surface: "#ffffff"
  ink: "#182b25"
  muted: "#52645a"
  border: "#d6ddd4"
  control-border: "#798b80"
  accent: "#24634b"
  accent-hover: "#1b4e3b"
  accent-soft: "#e4eee5"
  forest: "#24634b"
  forest-soft: "#e4eee5"
  white: "#fff"
  hover-paper: "#e9eee6"
  selected-paper: "#edf4ee"
  selected-ink: "#24634b"
typography:
  display:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "clamp(48px, 5vw, 72px)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  section:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.65
  button:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
  badge:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.5
  amount:
    fontFamily: "'Manrope', Arial, sans-serif"
    fontSize: "clamp(20px, 1.9vw, 26px)"
    fontWeight: 800
    lineHeight: 1.5
rounded:
  badge: "4px"
  control: "6px"
  panel: "12px"
  home-control: "8px"
  home-panel: "16px"
  round: "50%"
spacing:
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.hover-paper}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    padding: "10px 0"
  button-text-hover:
    textColor: "{colors.accent-hover}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 13px"
    height: "48px"
  badge:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "4px 9px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px"
  choice-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px 18px"
  choice-card-selected:
    backgroundColor: "{colors.selected-paper}"
  navigation-selected:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.control}"
    padding: "12px"
---

# Design System: BuildBudget

## Overview

**Creative North Star: "Modular Block"**

BuildBudget gives early home planning a clear, grounded identity. Forest actions, warm paper, white working surfaces, and ink text support a confident, readable interface. Manrope ties headings, controls, explanations, and figures together.

The approved concept B replaces the earlier terracotta and serif identity. The vector lockup in `public/brand-logo.svg` combines the modular mark with outlined DejaVu Sans Bold lettering; it requires no browser font for its wordmark. `BrandMark.tsx` reuses it in the header, footer, and account dialog. Compact modular assets serve the browser/app icon, and PDF reports carry the brand.

This record describes implemented CSS. Impeccable's launcher and detector are unavailable; screenshot review is manual, with no automated visual certification. Homepage composition belongs in `.impeccable/surfaces/home.md`.

**Key Characteristics:**

- Forest actions and selection with warm paper and white foundations.
- Manrope throughout the live interface.
- Modular vector identity and restrained rounded geometry.
- Flat surfaces, visible outlines, and explained tabular figures.
- Plain homeowner language and visible demonstration assumptions.

## Colors

The frontmatter records implemented reusable colors from `src/app/globals.css`; sidecar tonal ramps are synthesized preview aids, not shipping tokens.

### Primary

Forest supplies primary actions, links, focus, active navigation, and the homepage reference total. Deep Forest supplies hover feedback. Soft Forest distinguishes selected navigation and supporting planning information. Selected Paper gives chosen options a lighter ground.

### Neutral

Warm Paper grounds pages; White forms the working surfaces. Ink carries primary text and Muted Green carries explanations. Planning Rule divides groups; Control Outline identifies editable fields. Hover Paper supports secondary states. Legacy CSS aliases named navy, orange, green, and cream resolve to this current palette.

**The Action Color Rule.** Use forest for action, selection, and focus; keep explicit labels and indicators alongside color.

## Typography

**Display Font:** Manrope, with Arial and sans-serif fallbacks.

**Body Font:** Manrope, with Arial and sans-serif fallbacks.

Normal Latin weights (400/500/600/700/800) are self-hosted with `font-display: swap`; `public/fonts/Manrope-LICENSE.txt` contains the license. Logo lettering is outlined vector artwork, independent of the UI font.

### Hierarchy

- **Display:** bold homepage introduction; responsive variants belong to the home surface.
- **Headline / Section / Title:** shared page and panel hierarchy uses weight (700), with observed panel and mobile variants.
- **Body:** readable explanations, generally (16px), with (65–75ch) limits for longer introductions.
- **Label / Button / Badge:** visible functional labels; home labels use weight (600), shared labels use (700).
- **Amount:** the home total uses weight (800); other results retain their observed sizes. Tabular numerals align monetary comparisons.

**The Number Clarity Rule.** Keep explanations adjacent to the figures they qualify and use tabular numerals for comparisons.

## Layout

Shared public and workspace frames cap at (1536px); reading pages cap at (1250px). The desktop workspace pairs a (224px) sidebar with flexible content. The shared header is (88px), reducing to (64px) at the phone breakpoint. Gutters generally move from (50px) to (32px), (24px), and (20px); narrow workspace content uses (16px).

Navigation collapses at (999px). Working grids stack at (760px), while fields and choice groups stack at (560px). Spacing tokens summarize repeated CSS measurements rather than named source custom properties. The homepage's split composition and asymmetric tool list are surface-specific.

## Elevation & Depth

No box shadows are implemented. Warm Paper, White, forest state fills, and thin rules establish grouping. Focus uses a forest outline (3px) with offset (4px); grouped fields use offset (3px). Motion uses calm easing `cubic-bezier(.22,1,.36,1)`, quick feedback (140ms), and standard transitions (240ms). Existing route nodes enter at (280ms), wizard steps at (240ms), and updated data panels at (220/240/280ms). Viewport entrances run once: text/panels (420ms), image clipping (520ms), and ordered stagger (45ms). Menus and dialogs use (240ms). Values update immediately; motion never remounts content or delays navigation.

Reduced motion removes spatial movement, retaining brief fades/color feedback (120ms) and the essential loading spinner (900ms, linear). Preference changes cancel active custom animations live. Keyboard input skips or cancels spatial custom animations and decorative CSS entrances; focusing revealed content settles it immediately. Motion adds no dependencies, parallax, or looping decorative backgrounds. Implementation lives in `src/components/useMotion.ts` and `src/app/motion.css`.

**The Flat Surface Rule.** Distinguish working groups with surfaces and borders while preserving the implemented shadow-free treatment.

## Shapes

Shared controls use modest corners (6px); panels and choices use softer corners (12px); badges use (4px). The homepage has field/total corners (8px) and a quick-estimate panel (16px). Thin outlines (1px) recur throughout. Circles identify radios, avatars, and progress; the modular mark remains proportional and unframed.

## Components

### Buttons

Readable primary actions use Forest and White with padding (12px 20px), minimum height (44px), and shared control corners. Large actions use minimum height (52px). Hover deepens forest; outlined alternatives use Control Outline and Hover Paper. Text actions use forest. Disabled controls use opacity (.55) and a not-allowed cursor. Keep visible keyboard focus.

### Chips

Static informational badges use Warm Paper, Muted Green, and Planning Rule. Recommended labels use Soft Forest. Status labels do not acquire interactive behavior.

### Cards / Containers

White shared panels use Planning Rule, panel corners, and padding (28px). Manrope headings and explanations preserve a clear hierarchy. Choice and finish cards change their border to forest on hover; selected options add Selected Paper and an explicit radio or check indicator.

### Inputs / Fields

Shared labeled fields use White, Control Outline, height (48px), and padding (10px 13px). Home fields use height (50px) and home-control corners. Input text remains (16px). Focus remains visible on inputs or grouped wrappers. Disabled fields use Hover Paper. Existing error panels retain their semantic reddish treatment, descriptive text, and recovery action; preserve invalid-state descriptions and live feedback.

### Navigation

Public navigation uses plain text with forest hover and a thin active underline. Workspace selection uses Soft Forest, stronger forest text, and an icon. Phone menus and scrollable workspace controls keep tool access reachable; menu rows retain minimum height (48px).

### Explained reference budget

The homepage pairs compact tabular construction and contingency rows with a Forest total band and white text. Changing inputs updates the existing server calculation. Unavailable values, loading, and recovery states remain explicit; demonstration assumptions stay adjacent.

### Planning tool links

An asymmetric homepage list uses forest line icons, strong titles, descriptions, and a rounded arrow. Hover fills the arrow and moves it (3px) horizontally; reduced motion removes spatial movement while retaining brief color feedback. Preserve separators and readable stacked rows on phones.

## Do's and Don'ts

### Do:

- **Do** use the approved Modular Block assets and BuildBudget spelling.
- **Do** pair forest actions with warm paper, white surfaces, and Manrope.
- **Do** preserve readable labels, visible focus, explicit selection, and recovery states.
- **Do** explain demonstration assumptions alongside reference figures.
- **Do** identify generated architectural imagery as illustration.

### Don't:

- **Don't** restore the superseded terracotta initials or serif identity.
- **Don't** use color alone for errors, selection, or budget status.
- **Don't** impose the homepage composition on every workspace screen.
- **Don't** invent customer proof, verified market prices, or automated design certification.
