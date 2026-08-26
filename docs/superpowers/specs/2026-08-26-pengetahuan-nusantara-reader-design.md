# Pengetahuan Nusantara Reader Experience — Design Spec

**Date:** 2026-08-26
**Status:** Approved direction; awaiting written-spec review
**Scope:** `/articles` catalogue and article reader only

## 1. Goal

Turn FiGo's `Pengetahuan Nusantara` area into a calm, accessible digital library for long-form Nusantara spiritual and literary texts.

Success means a first-time visitor can discover a text quickly, scan its relevance without eye strain, open it, comfortably read it on desktop or mobile, resume later, and save/highlight it without UI competing with the writing.

The design direction is **quiet Nusantara library + modern reader controls**. It is not a magazine landing page and not a generic FiGo utility screen.

## 2. Constraints

- Keep existing article datasets, routes, pagination, search, sorting, pinned items, highlights, and read-progress behavior.
- Keep light and dark modes; use Tailwind semantic light/dark utilities, no new hard-coded dark backgrounds.
- Keep FiGo's minimalist visual system: `rounded-2xl` for substantial panels, restrained shadows, no emoji in UI.
- Do not change unrelated local work already present in repository.
- Preserve shareable query state for article id/page and add shareable search/filter/sort state where current routing permits.
- Meet WCAG 2.1 AA for text contrast, focus visibility, labels, and pointer target sizing.

## 3. Information Architecture

### 3.1 Contextual shell

Within `/articles`, content navigation takes priority over FiGo utility navigation:

- Breadcrumb: `FiGo / Pengetahuan Nusantara`
- Context actions: `Jelajahi`, `Kategori`, `Tokoh`, `Koleksi`, `Tersimpan`
- Link back to FiGo home remains available but is visually secondary.

The initial implementation keeps contextual navigation as page-level controls rather than changing global site navigation. This prevents unrelated header risk while making the library's purpose clear.

### 3.2 Two views

1. **Catalogue view** — discovery, search, filter, sort, save, page navigation.
2. **Reader view** — single article reading, table of contents, progress, saved state, highlights, reader settings, sequential navigation.

Route/query state determines selected article. Back from reader restores catalogue state.

## 4. Catalogue Experience

### 4.1 Header and result context

Use one max-width container for the title, intro, controls, result count, grid, and pagination.

- Page title: `Pengetahuan Nusantara`
- Supporting copy: concise statement of collection purpose.
- Result context below filters: `Menampilkan N artikel`.
- When search or category filter is active, show a visible reset action.

### 4.2 Search, sort, and filters

- Use native `<label>` or accessible `aria-label` for search and sort.
- Search field is full-width at mobile; search plus sort uses `1fr auto` from tablet upward.
- Category filters use buttons with `aria-pressed`; active state must differ by text, border, and background, not color alone.
- Mobile category controls horizontally scroll with adequate left/right padding and visible focus states.
- All state changes reset catalogue page to page one and update URL state.

### 4.3 Article card

Each card communicates only what helps selection:

1. Category badge
2. Save button labelled `Simpan artikel` / `Hapus dari tersimpan`
3. Title
4. Author/source in sentence case
5. Excerpt clamped to three lines
6. One consistent footer CTA

CTA states:

- New / zero progress: `Baca artikel →`
- Resumable: `Lanjut baca · N%` with a labelled progress bar

The reader's progress belongs to the user and only displays for an article with saved local progress greater than zero. `Baca Makna` is removed as a card action; if that phrase denotes content type, it belongs in metadata rather than action text.

Cards are keyboard reachable and open with an actual link/button semantic, not a click handler on a generic container. Bookmark control remains separately focusable.

### 4.4 Responsive layout

- 320–639px: one column
- 640–1023px: two columns
- 1024px+: three columns

Card titles are 18–20px with readable line-height. Excerpts are 14–16px and use `1.5–1.65` line-height. Icon actions retain a 44px minimum hit area.

### 4.5 States

- Loading: card-shaped skeletons, not an unlabelled animated dot sequence.
- No results: explicit no-results copy plus `Reset filter` action.
- Dataset failure: helpful error state with retry/return action where fetching can fail.
- Pagination: semantic previous/next buttons and current page announced accessibly.

## 5. Reader Experience

### 5.1 Desktop layout

At `lg` and above, reader uses a deliberate 12-column layout:

- Left / navigation: 3 columns; article outline, catalogue return, related navigation.
- Main text: 6 columns; capped to about 680px line length.
- Right / tools: 3 columns; read progress, saved state, text controls, highlight summary.

Desktop secondary columns use sticky regions only if no ancestor has blocking `overflow`. The main reader remains fully usable when sticky behavior is unavailable.

### 5.2 Reader header and prose

Header order:

1. Category
2. Article title
3. Author/source
4. Reading-time estimate where source text is available
5. Reading progress

Prose defaults:

- Serif text face
- 18–20px at desktop default; user-controlled range remains available
- 1.75–1.9 line-height
- High contrast text in both themes
- Clear paragraph rhythm and heading hierarchy
- Max readable line measure around 65–75 characters

Reader controls remain user preferences and persist locally:

- font size
- serif/sans choice
- text alignment only if existing reader needs it

### 5.3 Highlights and save state

- Existing highlights must identify paragraph/index ranges, never globally replace every matching word.
- Saved article action uses visible text and accessible labels.
- Highlight palette remains subtle and readable in both themes.
- A mobile floating toolbar appears near top after text selection, avoiding OS bottom selection UI.

### 5.4 Reading progress

Progress derives from scroll position through article content and writes at controlled intervals to local storage. It must not cause layout reflow during scroll.

Progress language is explicit, for example: `Progres baca Anda: 45%`.

### 5.5 Sequential navigation

`Artikel sebelumnya` and `Artikel berikutnya` appear after prose, not in catalogue header. They are never required to return to the collection.

## 6. Mobile Reader

Mobile is a single text column. Sidebars do not collapse into a long page before the article.

- Reader settings open via bottom sheet.
- Outline/highlights/saved panel opens via drawer or second bottom sheet.
- Floating actions sit above bottom browser/UI collision zones.
- Every trigger has a visible label or accessible name.
- Text selection uses a document `selectionchange` listener because mobile native selection handles consume local touch/mouse handlers.

## 7. Visual System

Use existing FiGo neutral and emerald palette in semantic roles:

- Primary text: high-contrast slate/white pair.
- Body copy: visible slate pair meeting normal-text AA.
- Metadata: muted but readable.
- Emerald: active filter, selected/focus state, save state, primary accent.
- Indigo may remain only for progress if it meets contrast and does not create a second dominant brand color.

Surface hierarchy is built by light/dark Tailwind surface classes, modest borders, and spacing—not stacked shadows or gradients.

Typography hierarchy:

- page title: 28–32px, semibold/bold
- card title: 18–20px, semibold
- reader title: 32–44px responsive, semibold
- prose: 18–20px reader; 14–16px catalogue excerpt
- metadata: at least 12–13px, never needlessly all-caps

## 8. Component Boundaries

The current `app/pages/articles.vue` is large. Split presentation and logic while keeping route orchestration in the page.

Proposed boundaries:

- `app/pages/articles.vue` — route/query orchestration, selected article choice, view switching.
- `app/components/articles/ArticleCatalogue.vue` — controls, count, empty/loading states, grid, pagination.
- `app/components/articles/ArticleCard.vue` — accessible card and saved/progress footer.
- `app/components/articles/ArticleFilters.vue` — search/sort/category controls.
- `app/components/articles/ArticleReader.vue` — desktop/mobile composition and reader header.
- `app/components/articles/ReaderSettings.vue` — desktop panel and mobile sheet presentation.
- `app/components/articles/ReaderOutline.vue` — desktop outline/mobile drawer presentation.
- `app/composables/useArticleCatalogue.ts` — search, filter, sort, pagination, URL serialization.
- `app/composables/useArticleReading.ts` — read progress, persistent settings, saved items, highlight-safe range state.

Exact boundaries can adapt to existing imports and data structures, but each component has one responsibility and no generic card click handlers.

## 9. Accessibility Requirements

- Normal text contrast minimum 4.5:1; large text minimum 3:1.
- Use real buttons, links, labels, and native select/input controls.
- Icons without visible text get `aria-label` and useful title/tooltip.
- Visible keyboard focus for every interactive control.
- Touch targets minimum 44×44px for standalone actions.
- Dynamic counts/progress use an appropriate accessible announcement without repeated scroll spam.
- No state depends only on color.

## 10. Verification

### Automated

- Run existing project validation/build command.
- Add focused component/composable tests if project test harness exists; otherwise add a deterministic script-level verification appropriate to existing project tooling.
- Run static Vue checks already configured in `scripts/check_vue.cjs`.

### Manual browser checks

Check catalogue and reader at 320px, 375px, 768px, 1024px, and 1440px:

- no clipped controls or horizontal page overflow
- mobile one-column catalogue and reader
- filters/search/sort update visible results and pagination correctly
- bookmark works without opening article
- reader progress saves and CTA changes after return to catalogue
- keyboard tab order and focus rings work
- light/dark mode text remains readable
- reader settings and outline work as drawers/sheets on mobile

## 11. Non-goals

- No global homepage/header redesign in this change.
- No content/dataset rewrite.
- No new backend service unless existing front-end persistence cannot support a declared behavior.
- No social comments, accounts, recommendations engine, or magazine image system.

## 12. Risk Management

- Existing uncommitted files must remain untouched unless explicitly part of article UI work.
- Before edits, snapshot the current `articles.vue` state in a branch/commit or backup location.
- Build in small, testable slices: catalogue controls/cards first, reader layout second, mobile panels third, persistence/accessibility final.
- Avoid hard-coded dark color regressions by replacing only components under active redesign with theme-safe Tailwind classes.
- Keep route compatibility for existing `?id=...&page=...` links.

## 13. Sources

- Vue 3 official guide: https://vuejs.org/guide/essentials/component-basics.html
- Nuxt 4 pages/routing: https://nuxt.com/docs/4.x/guide/directory-structure/app/pages
- MDN accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- WCAG 2.1 contrast minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- WCAG target size guidance: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Existing FiGo design guide: `frontend-ui-engineering/references/fikri-ux-guidelines.md`
