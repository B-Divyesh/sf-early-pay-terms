# Early Pay Terms — visual thesis

## Direction: a mid-century payment instrument

Early Pay Terms should feel like a dependable desk instrument: the confidence of a 1960s bookkeeping machine, softened for a tiny supplier working at a kitchen table. The interface borrows the physical logic of an instrument panel—label plates, ruled paper, rotary-notch details, a single signal lamp, and tabular readouts—without imitating retro skeuomorphism. This fits the product because its value is not spectacle; it is making one consequential number inspectable, repeatable, and calm.

The product uses a deliberately single light mode. It is designed as warm paper inside a dark enamel chassis; painting that world explicitly is more coherent than introducing a synthetic dark theme. Contrast is checked in that treatment.

## Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `--ink` | `#17211f` | Primary copy and printed numerals |
| `--ink-soft` | `#4d5b57` | Secondary copy (7.2:1 on paper) |
| `--paper` | `#f5f0df` | Main work surface |
| `--paper-deep` | `#e8dfc7` | Recessed controls and ruled areas |
| `--enamel` | `#153c3b` | Instrument chassis / strong regions |
| `--enamel-deep` | `#0d2928` | Chassis shadow and footer |
| `--signal` | `#d95d39` | Primary action and deadline marker |
| `--signal-dark` | `#a63c22` | Action hover/focus support |
| `--brass` | `#b58a38` | Measurement ticks and premium details |
| `--success` | `#286b4f` | Verified/paid states, always with text/icon |
| `--warning` | `#8a5615` | Cautions, always with text/icon |
| `--danger` | `#9e332d` | Errors, always with text/icon |

Primary text contrast exceeds 13:1 on paper; inverse text is off-white on enamel at more than 9:1. Signal orange is used behind dark ink where small text appears, and never carries state alone.

## Type

- **Headings and labels:** `Avenir Next`, `Century Gothic`, `Futura`, system sans-serif. Geometric capitals recall engraved equipment plates while staying highly legible.
- **Body and numerical readouts:** `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`, `Roboto Mono`, monospace. Tabular forms make financial comparisons honest and stable.
- No webfont files are necessary, eliminating a network dependency and font budget. Body copy starts at 16px, with 1.55 line-height and a 68-character reading measure.
- Type scale: 14, 16, 19, 24, 34, and clamp(42–68) px. Uppercase is reserved for short eyebrows and instrument labels.

## Spacing and layout

- Base rhythm is 4px; principal intervals are 8, 12, 16, 24, 32, 48, and 64px.
- The workbench is a two-column control/readout layout on wide screens. At 900px it becomes a single flow with the result immediately after the inputs. At 390px, ornamental hardware disappears, controls remain at least 48px tall, and sticky chrome is avoided so the keyboard never traps the task.
- A restrained 1px rule and proximity do most grouping. Raised cards are reserved for the two genuinely independent outputs: payment terms and paid-on-time receipt.
- Corners are mostly 2–8px, not pill-shaped. Shadows mimic a paper slip or shallow metal recess.
- Demo entry compresses the same enamel instrument into a first-screen four-field readout. It keeps the product identity while exposing the sample invoice, parties, deadline, and two payable amounts before any marketing scroll.

## Interaction grammar

- Changing any input recalculates immediately; the result dial gives a brief mechanical settle and the explanation line spells out the formula.
- The deadline has a notched timeline: issue → early deadline → due date. Dates and states always remain textual.
- Primary buttons resemble broad labeled switches. Their pressed state moves down by 1px. Focus uses a 3px brass/ink double ring.
- Optional complexity (tax treatment, basis, rounding) starts visible because it determines correctness. Explanations sit beside the choice rather than behind tooltips.
- Saving produces a dated local snapshot. Editing creates a new version; prior calculations remain visible and restorable, providing an audit trail rather than silently mutating history.
- Destructive history clearing requires an explicit confirmation; individual records can be removed with a five-second undo.

## Motion policy

- 180–240ms transitions, limited to opacity and transform: readout settle, notice arrival, and section reveal from its logical origin.
- Nothing loops, flashes, or moves decoratively. Print/export has no animation.
- Under `prefers-reduced-motion: reduce`, scrolling is instant, transitions are removed, and result changes use only an immediate color-neutral outline/text update.

## Asset plan and provenance

The hero illustration is a generated still-life of a fictional desktop payment calculator, invoice slips, and a date wheel. It explains the product world without pretending to show the UI. Interface icons, timeline ticks, stamp shapes, and logo mark are hand-authored SVG/CSS geometry by the product builder; no third-party icon set is used.

### Prompt sheet

- **Use case:** `stylized-concept`
- **Asset:** wide landing-page hero illustration
- **Subject/world:** an imaginary 1960s desktop accounting instrument beside two blank invoice slips; a date wheel, brass measurement marks, and a coral signal button visually connect invoice total, discount deadline, and amount due
- **Materials:** cream enamel, dark teal painted steel, warm paper, lightly oxidized brass, subtle screen-print grain
- **Light/lens:** soft directional morning light, slightly elevated 50mm product still-life, crisp silhouette, realistic tactile shadows
- **Palette words:** parchment, deep petrol teal, burnt coral, aged brass, charcoal ink
- **Composition:** 3:2 landscape, instrument to the right with calm negative space, no cropped key object
- **Negative list:** no people, hands, currency symbols, legible writing, logos, brands, gradients, neon, glassmorphism, watermark, or fake app UI
- **Required literal constraint:** no text, no watermark, no logos

Generation command: `/opt/fleet/lib/gen-image.sh "<prompt derived from the prompt sheet>" assets/src/terms-instrument-candidate-N.png 1536x1024 high` using the factory Azure image deployment. Both candidates were visually reviewed for malformed controls, accidental text/branding, seams, and palette fit. Candidate 2 was selected for its clean, text-free faceplate and clear three-stage relationship; it is exported as 640px (18 KB) and 960px (42 KB) WebP assets, comfortably below the 300 KB mobile budget. Generated on 2026-08-28; original work commissioned for this product under the project license. Prompt sidecars are retained beside both source images. The footer discloses that the scene is AI-generated.

## Print language

The generated payment card and receipt intentionally shed the enamel chassis. They print as high-contrast warm-white documents with a black rule, a compact terms table, the exact inputs, calculation version, and a verification disclaimer. A QR code is not included because this product does not collect payment and should not imply that it does.
