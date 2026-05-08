# Samaan-Bol Website Design Guide

## Design Direction

Samaan-Bol uses a dark, voice-first product aesthetic built for Indian retail. The visual language should feel modern, trustworthy, energetic, and practical: deep black surfaces, saffron accents, soft glass panels, animated glow, and product UI mockups that make the app feel tangible.

The site should stay focused on the product and its benefits. Avoid generic marketing decoration, stock imagery, unrelated illustrations, or bright multi-color layouts that weaken the dark saffron identity.

## Color System

Use the existing CSS variables as the source of truth.

```css
--saffron: #FF6B00;
--saffron-dark: #E85D00;
--saffron-light: #FF8A33;
--saffron-glow: rgba(255, 107, 0, 0.21);
--saffron-tint: rgba(255, 107, 0, 0.08);

--bg-deep: #0A0A0F;
--bg-card: #15151C;
--bg-elevated: #1E1E26;

--text-primary: #EAEAE6;
--text-secondary: #8A8A90;
--text-muted: #5A5A62;
--border-dark: #2A2A34;

--success: #32D583;
--warning: #FFB547;
--danger: #E85A4F;
```

Primary backgrounds should be `--bg-deep`. Cards and app-like surfaces should use `--bg-card` or `--bg-elevated`. Saffron is the main action and brand color; use it for CTAs, active states, progress bars, highlights, and glow effects. Use green, yellow, and red only for status states.

## Typography

Use three font families:

- Headings and brand/UI emphasis: `Space Grotesk`
- Body copy and general interface text: `Inter`
- Hindi/Devanagari text: `Noto Sans Devanagari`, with `Space Grotesk` fallback

Headings use tight line-height, medium-to-bold weight, and slight negative tracking. Body copy should stay calm and readable, usually in muted gray rather than pure white.

Recommended patterns:

- Hero heading: `clamp(40px, 5.5vw, 64px)`
- Hindi hero line: `clamp(28px, 3.5vw, 40px)`, saffron, medium weight
- Section heading: large `Space Grotesk`, primary text
- Section labels: small uppercase or compact label text, saffron or muted
- Legal page body: `15px`, `line-height: 1.7`

## Layout Principles

The page uses centered containers with generous horizontal padding:

- Standard container: `max-width: 1200px`
- Wide container: `max-width: 1400px`
- Legal pages: `max-width: 720px`
- Horizontal padding: `clamp(20px, 5vw, 48px)`

Keep sections spacious and scannable. The homepage alternates between open hero/product storytelling, card grids, language chips, comparison panels, testimonials, and CTA blocks. The legal pages are narrow, text-first, and optimized for reading.

Responsive behavior should preserve the same hierarchy:

- Desktop hero: two columns, copy left, phone mockup right
- Tablet/mobile hero: stacked layout with centered content
- Mobile nav: hide link list and show menu button
- Cards and grids collapse to fewer columns without changing content order

## Components

### Navigation

The nav is fixed at the top with transparent background initially. On scroll, it becomes dark glass:

- Background: `rgba(10, 10, 15, 0.85)`
- Backdrop blur: `20px`
- Bottom border: `1px solid --border-dark`

Logo mark is a 36px rounded square/circle-style SVG treatment with saffron fill. Logo text is `Space Grotesk`, bold, with the `Bol` segment in saffron.

### Buttons

Primary buttons are saffron filled, dark text, and slightly rounded:

- Padding: `14px 32px`
- Radius: `10px`
- Font: `Space Grotesk`, `600`
- Hover: lift up and add saffron glow

Secondary buttons are transparent with a dark border and subtle hover fill. Do not introduce unrelated button shapes or colors.

### Cards and Panels

Cards use dark elevated surfaces, thin borders, subtle hover transforms, and restrained glows. Common card traits:

- Background: `--bg-card` or glass-like dark
- Border: `1px solid rgba(255,255,255,0.04)` or `--border-dark`
- Radius: usually `12px`
- Hover: slight upward movement, brighter border, or soft glow

Avoid bright white cards or heavy shadows that break the dark system.

### Phone Mockup

The hero phone is the main product visual. Preserve its proportions and app-like density:

- Frame: `280px x 580px`
- Radius: `40px`
- Dark frame and screen
- 2x2 stats grid
- Product rows with compact icons, names, metadata, and quantity
- Floating mic/action button in saffron

Use small status colors for inventory states: warning for low stock, danger for out of stock, success for activity.

### Feature and AI Blocks

Feature and AI cards should use line icons, dark surfaces, and saffron or status-colored labels. AI tags have tinted backgrounds:

- Predictive stock: indigo tint
- Smart alerts: warning tint
- Voice analytics: success tint
- Team intelligence: saffron tint

Keep icons simple, stroke-based, and consistent with the existing inline SVG style.

### Language Chips

Language chips are rounded dark pills/cards with native script shown as secondary text. The featured Hindi chip uses saffron emphasis. Preserve multilingual text rendering and use the `.hindi` class for Devanagari text.

### Legal Pages

Privacy and terms pages use a narrower reading layout:

- Page padding: `24px`
- Container width: `720px`
- Back link: dark card button with saffron hover
- Table of contents: dark card with border and compact links
- Sections: native `<details>` accordion with plus/minus indicator
- Reading progress: 2px saffron gradient bar at top
- Back-to-top: fixed circular button, hidden until scroll

Do not make legal pages full-width or marketing-heavy. They should feel like part of the same brand but prioritize readability.

## Motion and Interaction

Motion is subtle and product-oriented:

- Hero language word cycles every few seconds
- Hero words reveal with staggered entrance
- Cards reveal on scroll
- Stat counters animate when visible
- Phone and CTA elements use glow/lift hover states
- Background canvas uses low-intensity animated gradients and particles

Respect `prefers-reduced-motion` by disabling or minimizing animation. Avoid adding large, distracting motion or unrelated decorative effects.

## Content Tone

The copy is direct, benefit-led, and localized for Indian retail shopkeepers. It mixes English with Hindi and Indian language examples. Keep product language concrete:

- Voice-first inventory
- Indian retail/kirana context
- Stock, alerts, expiry, buy lists, team roles
- AI that understands local language and business patterns

Do not replace local examples with generic SaaS language.

## Implementation Notes

The design source of truth is currently:

- `app/styles/home.css`
- `app/styles/legal-base.css`
- `app/content/home.ts`
- `app/content/privacy.ts`
- `app/content/terms.ts`

When adding new UI, reuse the existing CSS variables, typography, card treatments, grid rhythm, icon style, and motion behavior. New components should look like they belong beside the phone mockup, feature cards, AI blocks, and legal accordions without requiring a redesign.
