---
name: Stitch & Soul
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#524346'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#847376'
  outline-variant: '#d7c1c5'
  surface-tint: '#8d495d'
  primary: '#8d495d'
  on-primary: '#ffffff'
  primary-container: '#d4849a'
  on-primary-container: '#591e32'
  inverse-primary: '#ffb1c5'
  secondary: '#79545d'
  on-secondary: '#ffffff'
  secondary-container: '#fdced8'
  on-secondary-container: '#79555e'
  tertiary: '#635e53'
  on-tertiary: '#ffffff'
  tertiary-container: '#a19b8e'
  on-tertiary-container: '#373329'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#ffb1c5'
  on-primary-fixed: '#3b061b'
  on-primary-fixed-variant: '#713246'
  secondary-fixed: '#ffd9e0'
  secondary-fixed-dim: '#e9bbc5'
  on-secondary-fixed: '#2e131b'
  on-secondary-fixed-variant: '#5f3d46'
  tertiary-fixed: '#e9e2d3'
  tertiary-fixed-dim: '#cdc6b8'
  on-tertiary-fixed: '#1e1b13'
  on-tertiary-fixed-variant: '#4b463c'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  headline-md:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-edge: 40px
  section-gap: 120px
---

## Brand & Style

This design system captures the tactile, intentional nature of handmade crochet. It blends **Minimalism** with a **Craft-focused Editorial** aesthetic, prioritizing whitespace and high-quality photography to let the texture of the yarn speak for itself. 

The personality is cozy yet sophisticated—moving away from "hobbyist" cliches toward a high-fashion, Gen-Z boutique feel. The UI should evoke the feeling of a physical lookbook or a premium gallery. 

Key visual principles:
- **Asymmetry:** Intentional layout shifts that mimic the organic flow of hand-weaving.
- **Handmade Accents:** Subtle SVG stitch patterns and "thread-pull" line decorations used sparingly to anchor content.
- **Bilingual Fluidity:** A seamless transition between Arabic (RTL) and English (LTR) that preserves the editorial rhythm across scripts.

## Colors

The palette is anchored in warmth and soft contrast. 

- **Primary (#D4849A):** A deep, muted pink used for calls to action, active states, and emphasis in both light and dark modes.
- **Secondary (#F5C6D0):** A soft pastel pink for surface highlights and secondary buttons.
- **Surface (#FDF5E6):** A warm beige "paper" background for light mode to avoid the clinical feel of pure white.
- **Dark Background (#1A1A1A):** A soft, warm black for dark mode, providing high legibility for the pink accents without the harshness of true black.

For accessibility, ensure the deep pink accent maintains a 4.5:1 contrast ratio against the warm beige background for small text.

## Typography

The typography system relies on the interplay between the rounded, friendly geometry of **Quicksand** and the modern, clean professionality of **Plus Jakarta Sans**.

- **Headings (Quicksand):** Used for all titles to instill a sense of softness and approachability. In Arabic, ensure the font weight is slightly heavier to maintain visual parity with English.
- **Body & Interface (Plus Jakarta Sans):** Selected for its exceptional legibility and modern proportions.
- **Editorial Flourish:** Occasionally use `display-lg` with "thread-pull" underlines (SVG) for section headers to create an editorial lookbook feel.
- **Bilingual Pairing:** For Arabic text, use a font-stack that prioritizes modern, clean Naskh styles that match the x-height of Plus Jakarta Sans to prevent visual jumping between languages.

## Layout & Spacing

This design system utilizes a **Fluid Grid with Asymmetric Offsets**. 

- **The 12-Column Grid:** Content generally adheres to a 12-column grid, but "Editorial Breaks" allow images or pull-quotes to shift 1/2 column off-center to create a dynamic, handmade rhythm.
- **Vertical Rhythm:** Generous `section-gap` spacing (120px+) is used between product categories to create a "breathable" luxury experience.
- **Bilingual Logic:** Spacing mirrors exactly in RTL. Ensure that icons (like "back" arrows) are flipped, while brand-specific stitch motifs remain organic and non-directional.
- **Desktop Focus:** On desktop, utilize the horizontal width to place text and imagery in side-by-side "vignettes" rather than standard centered stacks.

## Elevation & Depth

To maintain the "Minimalist but Cozy" feel, depth is created through **Tonal Layers** and **Soft Ambient Shadows** rather than heavy borders.

- **Soft Depth:** Use extremely diffused shadows (Blur: 30px, Opacity: 4%) with a slight tint of the Primary color (#D4849A) to make cards feel like they are resting gently on a soft fabric surface.
- **Tonal Stepping:** In Light Mode, use the Secondary color (#F5C6D0) as a subtle background for container elements (like shopping carts or sidebars) to distinguish them from the main Beige (#FDF5E6) surface.
- **Interactions:** Upon hover, elements should lift slightly with an increased shadow spread, mimicking the "squishy" tactile nature of crochet.

## Shapes

The shape language is dominated by **Organic Roundedness**. 

- **Primary Radius:** A default of `0.5rem` (8px) is applied to buttons and inputs.
- **Product Cards:** Use `1rem` (16px) to soften the edges of photography.
- **Editorial Containers:** Large sections or featured images may use a "pill-shaped" top-left and bottom-right corner (32px+) while keeping others standard, suggesting the uneven, organic edges of a handmade garment.
- **Icons:** Use clean, medium-stroke SVG line icons with rounded caps to match the Quicksand typeface.

## Components

- **Buttons:** 
  - *Primary:* Filled with `#D4849A`, white text, `0.5rem` radius. 
  - *Ghost:* Outlined in `#D4849A` with a subtle hover fill of `#F5C6D0`.
- **Product Cards:** Borderless, using soft shadows and the Beige surface. Price labels should use the `label-sm` style with increased letter spacing for a premium feel.
- **Input Fields:** Soft beige background with a `1px` border that transitions to Deep Pink on focus. Labels should always be positioned above the field for clarity in both English and Arabic.
- **Chips/Tags:** Used for "Material" (e.g., 100% Cotton). These should be pill-shaped with a tiny "stitch" icon prefix.
- **Stitch Divider:** Instead of a standard horizontal rule, use a custom SVG path that resembles a simple crochet chain stitch.
- **Language Switcher:** A minimalist text-only toggle located in the top navigation, using the `label-sm` font style.