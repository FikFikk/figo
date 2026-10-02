# FiGo UI/UX contract

Read this file before changing any interface. It is the design source of truth for this repository. Implement the rules below; do not invent a second theme. The implemented tokens live in `tailwind.config.ts` and `app/assets/css/main.css`.

## Product and boundaries
FiGo is a free, no-account collection of file tools and everyday utilities. Its interface should feel fast, clear, useful, and dependable. Lead with choosing a tool and completing a task. File conversion, compression and media download are the primary entry points. Keep every existing route, API, file limit, processing option, download, persisted preference, and specialist feature working. Calendar, articles, Quran, recipes, nutrition, stocks, editor and streaming remain available; their domain-specific content and controls are not marketing decoration.

Stack: Nuxt 4, Vue 3 Composition API, Tailwind CSS 3 through `@nuxtjs/tailwindcss`, TypeScript, Nitro server routes, PWA/Capacitor. Use existing composables; do not replace processing implementations during visual work. Use `NuxtLink` for navigation and native buttons for actions. Avoid CSS-in-JS and new UI libraries.

## Design system: utility workspace
Use solid surfaces, crisp borders, clear headings and one cobalt action color. No floating blobs, animated decorative canvases, glassmorphism, glowing cards, giant poster copy, or artificial live/status indicators. A normal tool should be usable above the fold on a laptop. Meaningful previews (images, video, color swatches, charts) keep their own colors.

### Semantic tokens
Tokens are RGB channels in CSS so Tailwind opacity modifiers work. The root defaults to dark, matching `useColorMode`; `.light` switches values. Use `bg-canvas`, `bg-panel`, `bg-panel-muted`, `text-ink`, `text-muted`, `border-line`, `text-accent`, `bg-action`, and `text-on-action`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| canvas | #F5F7FB | #0B1220 | page background |
| panel | #FFFFFF | #111C2E | cards, menus, dialogs |
| panel-muted | #EDF1F7 | #18263B | nested settings, previews |
| ink | #152238 | #F1F5FB | headings/body |
| muted | #526176 | #A8B8CF | help, metadata, secondary text |
| line | #CED7E5 | #35455F | borders/dividers |
| accent | #2459C4 | #9ABBFF | links, active text, focus |
| action | #2459C4 | #2459C4 | primary button fill |
| on-action | #FFFFFF | #FFFFFF | text/icons on primary fill |

`primary` and `tertiary` remain #2459C4 aliases for legacy filled controls. New inline links use `text-accent`, never `text-primary` in dark mode. Legacy `glass-panel` and `bento-card` resolve to solid `panel` with `line` border. Their names are compatibility hooks, not permission to reintroduce glass.

Feedback: success uses emerald-700 / dark:emerald-300; error uses red-700 / dark:red-300; warning uses amber-800 / dark:amber-300, always with a written message or icon. Use a pale 10% state background and visible border. Red is for failures/destructive actions, not routine navigation. Stock gain/loss, calendar events, article highlights, Quran themes, media/canvas colors and generated palettes retain domain meaning; do not recolor these indiscriminately.

### Type and rhythm
Keep self-hosted Inter for body/controls and Manrope for headings, system sans-serif fallbacks. Playfair is an existing specialist article/reading face, not the global UI font. Body: 16px/1.6; help text and controls: 14px/1.5; metadata: 12px/1.5 minimum. Do not add 9–11px text to new navigation or forms. Page headings: 30–40px, 700–800, tracking -0.035em. Homepage heading: clamp(36px, 5vw, 60px), line-height 1.08. Card title: 18px/1.35, 700. Sentence case; no all-caps paragraph headings. Monospace only for values, filenames, formats, code, and identifiers.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64px. Page container: 1200px maximum, 20px mobile gutters, 32px at >=768px. Tool workspace: 960px maximum. Cards: 20–24px padding, 16px radius, 1px border. Inputs/buttons: 10px radius. Pills only for short tags. Default shadow is none; menus/dialogs may use `0 16px 48px rgb(0 0 0 / .2)`.

## Layout and navigation
Header height is 72px. Main content reserves at least 96px above the page heading. Desktop navigation includes Convert, Compress, Download, Tools, Stocks. At <768px, retain a five-item bottom bar with 44px minimum targets, text labels, and safe-area padding. Do not remove navigation to less-used tools; the searchable tools directory lists all public entry points, including articles and Quran. A visible skip link targets `#main-content`. Active links expose `aria-current="page"`.

Homepage: concise introduction, primary file-tool cards, smaller grouped everyday tools, then footer. No full-viewport decorative hero. Directory: search with visible label, result count, responsive cards (1 column mobile, 2 at 640px, 3 at 1024px); empty state includes a clear-search button. Cards navigate as whole native links. Do not use click-only divs.

File pages use `file-workspace` and a left-aligned `workspace-heading`, with purpose and actual requirements near the form. Preserve input → options → processing → result progression. Upload zones accept drag/drop AND Enter/Space/click via `role="button"`, `tabindex="0"`, accessible name and native hidden input. State the real maximum from the implementation (currently 50MB in convert/compress). Preserve format detection, quality settings, batch operations and result downloads. Do not promise lossless compression or a fixed reduction when quality/content determines results.

## Reusable classes and examples
- `figo-container`: page width/gutters.
- `figo-panel`: solid bordered panel, radius 16px.
- `figo-button`: 44px minimum, solid action fill, white text.
- `figo-button-secondary`: same geometry, panel background, visible line border.
- `figo-icon`: 44px icon tile, muted panel, accent icon.
- `figo-eyebrow`: 12px semibold short label.
- `figo-tool-link`: linked directory/card surface with border-color hover.

Do: `<NuxtLink to="/convert" class="figo-tool-link">…</NuxtLink>`.
Do: `<button class="figo-button" :disabled="busy">{{ busy ? 'Converting…' : 'Convert files' }}</button>`.
Don't: `<div @click="navigate">Open</div>` or a link that needs hover to reveal its name.
Do: `bg-panel text-ink border-line`; don't add arbitrary background hex values to a generic card.

## States, accessibility, motion
All interactive elements need a visible keyboard focus ring (2px accent, 3px offset), accessible name and 44px target where practical. Inputs need visible labels; placeholders supplement labels. Support dialogs need a labelled dialog, Escape/backdrop/close controls, focus trap and return focus to the trigger. Buttons that only show icons need `aria-label`; decorative icons use `aria-hidden="true"`. Keep status/error text near the action, announce changes with `role="status"`/`role="alert"`. Do not remove an existing progress indicator or cancel control. Disabled means native `disabled`, opacity .5 and no hover effect; selected means border/background AND text/ARIA indication.

Normal text contrast >=4.5:1; large text and meaningful boundaries/icons >=3:1. Never rely on color alone. File names may truncate visually but preserve the full accessible text; narrow screens must not overflow horizontally. Charts and editors may scroll within a labelled region. Preserve Quran Arabic fonts, direction, reading spacing, TV behavior and article reader controls.

Transitions: color, border, background or opacity, 150ms ease; feedback may use 200ms. Avoid scale/lift on full cards, two-second theme sweeps and looping decoration. Reduce motion disables page/element animations and smooth scrolling. A spinner may signal real processing only.

## Definition of done
- Read existing page, shared component, route/composable, and theme code first.
- Keep all routes, forms, handlers, backend contracts, limits, downloads and persisted settings intact.
- Check light/dark modes at 375, 768 and 1440px, long titles and empty/error/loading/success states.
- Verify keyboard navigation, focus visibility, mobile bottom-bar clearance, labels, and semantic controls.
- Run `pnpm build` and `pnpm test:articles`; report actual results and environment limitations. Build is not a typecheck; do not claim type safety without running a typecheck.
- Smoke-test conversion/compression with a harmless small file, directory search and navigation, theme persistence and a representative utility. External processing needs its real service and may not be verifiable offline; report that explicitly.
- Update this file and its actual token implementation together when a deliberate design change is authorized. Do not create competing design documents.
