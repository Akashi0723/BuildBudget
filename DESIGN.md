---
name: BuildBudget PH
description: Welcoming homeowner planning in a warm personal build notebook.
colors:
  paper: "#f6f1e8"
  surface: "#fffcf7"
  ink: "#352a24"
  muted: "#6d6056"
  border: "#d3c8bb"
  control-border: "#8e8073"
  terracotta: "#9d4635"
  terracotta-hover: "#843a2c"
  terracotta-soft: "#efe0d6"
  olive: "#68715b"
  olive-soft: "#e9ecdf"
  white: "#fff"
  hover-paper: "#eee6db"
  selected-paper: "#faf0e7"
  selected-ink: "#803b2d"
typography:
  display:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "clamp(54px, 5.47vw, 84px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  section:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Lato', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Lato', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.65
  button:
    fontFamily: "'Lato', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
  badge:
    fontFamily: "'Lato', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.5
  amount:
    fontFamily: "'Lato', Arial, sans-serif"
    fontSize: "clamp(36px, 3.2vw, 52px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
rounded:
  badge: "4px"
  control: "6px"
  panel: "12px"
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
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-hover}"
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
    textColor: "{colors.terracotta}"
    padding: "10px 0"
  button-text-hover:
    textColor: "{colors.terracotta-hover}"
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
    backgroundColor: "{colors.terracotta-soft}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.control}"
    padding: "12px"
---

# Design System: BuildBudget PH

## Overview

**Creative North Star: "Planning journal"**

BuildBudget PH makes early home planning feel welcoming and easy to understand. Warm paper, cocoa text, terracotta actions, and editorial headings give the tools the character of a personal build notebook. Readable fields and explained figures keep the experience practical.

The material language is restrained: clean rules, flat surfaces, and modestly rounded controls. The journal metaphor comes from typography and document-like grouping; artificial paper grain and notebook doodles are excluded by the approved direction. Preserve the name BuildBudget PH while continuing the clearly different identity selected to replace the former navy-and-amber look.

This Scan-mode record describes implemented CSS and components. The local Impeccable launcher was unavailable; review was manual, with no automatic design metrics or certification claims. The homepage's composition and image direction remain in [.impeccable/surfaces/home.md](.impeccable/surfaces/home.md).

**Key Characteristics:**

- Warm paper and cocoa foundations.
- Terracotta actions with quiet olive support.
- Editorial serif headings and readable sans-serif controls.
- Flat, ruled groups and tangible outlined fields.
- Explained reference budgets and plain homeowner language.

## Colors

The palette feels warm and grounded, with terracotta marking action and olive supporting planning information. The frontmatter is the normative color inventory; source custom properties live in `src/app/globals.css`. The sidecar's synthesized OKLCH tonal ramps are preview aids, not additional implemented color tokens.

### Primary

- **Terracotta** supplies primary buttons, action links, active navigation, caret color, and focus outlines. **Deep Terracotta** is its hover state.
- **Soft Terracotta** marks selected navigation and recommendations. **Selected Terracotta Ink** supplies their stronger text. **Selected Paper** lightly warms selected choice and finish cards.

### Secondary

- **Quiet Olive** supports informational icons and small status marks.
- **Soft Olive** distinguishes planning notes, optimizer callouts, and within-budget messages. Status panels carry explicit wording as well as color.

### Neutral

- **Warm Paper** is the page ground; **Clean Paper** is the brighter field and panel surface.
- **Deep Cocoa** carries headings and primary information; **Muted Cocoa** carries supporting copy.
- **Paper Rule** separates groups. **Control Outline** gives editable fields and outlined actions a stronger edge.
- **Hover Paper** warms secondary controls and navigation on hover. **White** supplies text against terracotta actions.

**The Action Color Rule.** Use terracotta for actions, selection, and focus. Use olive for supporting planning information rather than competing primary actions.

## Typography

**Display Font:** Libre Caslon Text, with Georgia and serif fallbacks.

**Body Font:** Lato, with Arial and sans-serif fallbacks.

Both families are self-hosted in `public/fonts/` at normal weights (400 and 700), with `font-display: swap`. Their SIL Open Font Licenses are included. See `src/app/fonts.css` and `public/fonts/README.md` for the exact assets.

The serif gives headings an editorial, personal character; the sans serif makes inputs, amounts, and instructions easy to scan. The observed hierarchy is role-based rather than a fixed mathematical scale.

### Hierarchy

- **Display:** the responsive homepage introduction. Its specific responsive variants belong to the home surface.
- **Headline:** general page titles; narrower workspace titles step down to (34px), then (32px).
- **Section:** general section headings. Shared panel headings often use (28px); smaller screens use (26px).
- **Title:** small section and result-summary headings.
- **Body:** explanations and reading copy; general mobile body copy becomes (14px) below the phone breakpoint. Page introductions use a maximum measure of (75ch); wizard introductions use (65ch).
- **Label:** bold field labels and compact functional text, normally sentence case.
- **Button:** readable action labels. Shared buttons become (14px) on phones; larger surface-specific actions retain their own sizing.
- **Badge:** compact status labels.
- **Amount:** important totals use Lato with tabular numerals. The same numeric treatment aligns breakdown and comparison rows.

**The Number Clarity Rule.** Use the sans serif and tabular numerals for monetary totals and comparisons. Keep explanations adjacent to the numbers they qualify.

## Layout

Shared public and workspace frames cap at (1536px); reading pages cap at (1250px). The desktop workspace uses a (224px) sidebar and a flexible content area with `min-width: 0`. General page gutters move from (50px) through (32px) and (24px) to (20px); narrow workspace content uses (16px). The shared header is (70px), reducing to (64px) on phones.

The extracted spacing steps are repeated measurements in CSS, not an existing named custom-property scale. Typical grids use (20px–24px) gaps and panels use (28px) padding, reducing to (24px) and (22px 18px). Rules group assumptions, actions, and result rows without adding nested containers.

Navigation changes at (999px): the desktop sidebar and public links give way to the header menu and horizontally scrollable workspace controls. Several working grids stack at (760px); fields, choices, and finish options stack at (560px). Additional observed breakpoints and the home surface's specific changes are recorded in the sidecar. Do not apply the homepage split or fixed rows to unrelated screens.

## Elevation & Depth

The implemented system uses no box shadows. Depth comes from the Warm Paper/Clean Paper distinction, soft terracotta or olive state surfaces, and thin rules. Buttons and fields remain tangible through their contrasting fills and stronger outlines. Focus uses a terracotta outline (3px) with an offset (4px); grouped input wrappers use an offset (3px).

**The Flat Surface Rule.** Use tonal surfaces and borders to distinguish groups. Preserve the shadow-free material language of Planning journal.

Motion is limited to color and border transitions (160ms, ease) and a loading spinner (900ms, linear). The implemented reduced-motion query disables animation and transitions.

## Shapes

Controls and navigation have gently curved corners; larger panels and choice cards are slightly softer. Compact badges use the smaller corner treatment. Thin borders (1px) recur throughout fields, panels, selected options, and ruled summaries. Circular forms belong to radio indicators, avatars, progress markers, and the small arrow affordance on home tool links. The architectural image uses a plain clipped plate on the homepage; other planning imagery sits in rounded containers.

## Components

### Buttons

Direct and readable. Primary buttons use terracotta with white text; secondary buttons use a transparent paper ground, cocoa text, and Control Outline. The common padding is in the frontmatter, with a minimum target height (44px). Large actions use a minimum height (52px) and padding (14px 24px).

Primary hover deepens terracotta. Secondary hover warms the background and darkens the border. Text buttons use terracotta, a minimum height (44px), and a deeper hover color. All keyboard-operable actions keep the shared visible focus outline. Disabled buttons use opacity (.55) and a not-allowed cursor; hover treatments exclude disabled states where implemented.

### Chips

The implemented compact chip is an informational badge, not a filter control. It uses Warm Paper, Muted Cocoa, and Paper Rule. Recommended planner badges use Soft Terracotta and Selected Terracotta Ink. Do not give static status labels interactive states.

### Cards / Containers

Flat, document-like groups. Shared cards use Clean Paper, Paper Rule, and the panel corner treatment. Titles are serif; supporting copy is sans serif. Results, planner notes, and status callouts may use the observed warm or olive tonal surfaces. Cards do not lift on hover.

Choice and finish cards are interactive outlined options. Hover changes the outline to terracotta; selection also warms the ground to Selected Paper and reveals a radio or check indicator. Keep the state indicator and label together.

### Inputs / Fields

Clearly editable, with visible labels. Shared fields use Clean Paper, Control Outline, control corners, and a height (48px). Text is (16px), even where surrounding mobile copy is smaller. The homepage's quick inputs use a height (46px), becoming (50px) when stacked.

Hover darkens the field edge; keyboard focus uses the shared outline. Grouped currency and unit fields put the focus treatment on their wrapper and separate units with a rule. Disabled fields use a muted warm ground. Errors use a warm terracotta tint, outlined message, clear text, and a recovery action when available; preserve `aria-invalid`, descriptions, and live feedback.

### Navigation

Public links use plain sans-serif text with terracotta hover. Active public links add a thin underline. Workspace navigation uses soft terracotta behind the selected item, stronger selected text, and an icon; hover uses Hover Paper. The mobile header menu preserves the same selected-state language. Shared menu items have a minimum height (48px).

### Explained budget rows

Compact ruled summaries align labels on the left and tabular amounts on the right. A stronger total row follows a divider; no floating result card is required for this pattern. The home quick estimate shows a placeholder while values are unavailable, labels its demonstration assumptions, and exposes loading or recovery feedback. These behaviors support the number-clarity rule.

### Planning tool links

Home tool links combine a quiet olive line icon, bold title, explanatory copy, and a small outlined circular arrow. Hover fills the arrow with terracotta. Narrow layouts retain readable rows and separators. This component may be reused where a tool needs a short explanation; its homepage placement remains surface-specific.

## Do's and Don'ts

### Do:

- **Do** pair warm paper and cocoa foundations with terracotta actions and quiet olive support.
- **Do** use Libre Caslon Text for editorial headings and Lato for controls, explanations, and amounts.
- **Do** use flat surfaces, thin rules, and outlined fields to make project details easy to scan.
- **Do** preserve visible focus, readable field labels, explicit selection indicators, and recovery states.
- **Do** label preliminary figures and demonstration assumptions alongside their amounts.
- **Do** keep generated architectural imagery identified as illustration rather than a built client project.

### Don't:

- **Don't** restore the former navy-and-amber brand identity.
- **Don't** add artificial paper grain or notebook doodles to express the journal metaphor.
- **Don't** replace the observed flat material language with decorative shadows.
- **Don't** use color alone to communicate selection, errors, or budget status.
- **Don't** promote the homepage composition into a mandatory layout for every surface.
- **Don't** invent customer proof, verified market-rate claims, or automated design certification.
