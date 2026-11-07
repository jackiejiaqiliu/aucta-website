# AUCTA reconstruction — repair and verification report

Updated November 7, 2026 (America/Chicago). Local-only; no deployment.

## Source animation correction and actual blank-screen cause — November 7

This correction supersedes the previous generic page/block fades. The source body config selects **Flex**, even though the separate animation-style field says fade. The captured source module 79287 uses segmented heading words (20ms offsets, 650ms/ease), image clip reveals, grouped Flex transitions with the original cubic curve, and fade fallbacks for other specific roles. Local code now follows those selectors and retained preFlex/flexIn/preFade/fadeIn CSS; the whole-main Web Animation is removed.

The actual blank-screen defect was an inherited `animation:hideContent 2s` on header/footer/section content wrappers. The platform normally cancels it with `body[data-animation-state=booted]`; local pages had no startup marker. Every local HTML now includes the booted marker before initial paint, and regeneration preserves it. Previous timing tests inspected main visibility and failed to account for this animated ancestor. Their conclusions about visible first content were insufficient.

Rendered verification measured section wrapper opacity 1 and animation-name none, six independently entering hero words whose vertical transform decreased to zero, image clip expanded using preFlex/flexIn, no whole-main animation, functioning background canvas and zero browser errors. All 23 HTML paths have the startup marker and zero background-pause-button elements. Controls were removed at the user's request; background rendering remains active. Evidence: `audit/source-motion/`.

## Current status

**The severe layout defect has been fixed, but this is not claimed to be a 100% match to the original website.** The user confirmed the layout correction at `http://127.0.0.1:5500/home/index.html` after refreshing the existing Live Server copy.

The previous delivery passed file/link and simulated DOM checks while failing actual rendering. That was insufficient verification. This repair adds rendered layout and native-browser interaction evidence, and clearly distinguishes that evidence from pixel-level acceptance.

## Mobile and loading follow-up — November 7

- Mobile header now uses equal side columns with the original logo centered independently of the hamburger and action controls. Its image uses automatic width and height with containment, preserving the source aspect ratio. Embedded-browser checks at 320/375/390/430/768px measured a 2.01073 displayed ratio versus the 2.01081 natural ratio, and a horizontal center error under 0.004px.
- Root and nested mobile navigation align to the upper left below the header. Links and the Contact action use left alignment. The first root link begins 28px below the header at the tested widths. No browser errors were captured in these checks.
- The optional loading audit no longer starts itself from a collector URL after Live Server refreshes; it requires a deliberate button click. Speculative document fetches were removed.
- Bokeh initialization yields until after initial rendering and an idle opportunity. Colors and WebGL uniform locations are cached; background animation stops scheduling frames when offscreen, paused, or the document is hidden. Shader equations and particle configuration are preserved.
- Embedded-browser animation checks passed: no per-frame color reads, no draws while paused or offscreen, successful resume, WebGL error 0 and no captured browser errors. Evidence: `audit/mobile-loading-followup/`.
- The user still reported long top-level blank intervals after the preceding update. Earlier iframe first-paint timings do not explain or resolve that report. This follow-up reduces confirmed work and request overhead; perceived top-level navigation latency remains unverified.

## Header and loading update — November 7

- Restored the original fixed-header threshold: after more than 10px of scrolling, the header gains the source `shrink` state and white background. At the top it follows the original transparent-first-section behavior. Embedded-browser comparison recorded matching source/local states: desktop 154.1px → 148.3px; mobile 140.8px → 134px; scrolled background `rgb(255,255,255)`.
- Downloaded **585 original-CDN responsive derivatives for 138 images**, at applicable 300/500/750/1000/1500px widths. These are source-server derivatives, not newly designed or re-encoded replacements. Every file passed an image integrity check. All full-size originals remain available to the lightbox.
- Added local responsive `srcset`/`sizes`, eager priority for the first content image, intrinsic logo dimensions, and lazy loading for other content images. Example: the test browser selected a 124KB homepage hero derivative instead of the 258KB original.
- Preloaded the existing local heading font and retained `font-display:swap`. Removed unused inherited font-hiding CSS; no whole-page loading overlay or content-hide gate was added.
- Background shader/context initialization waits until its section approaches the viewport. The configured base color is present immediately. The initially visible About Us section can initialize normally; the lower quote section remains deferred. Native testing verified a valid WebGL context and functioning pause/play controls after entering view.
- Gallery/background scripts load only on pages that use them. Speculative document prefetch was subsequently disabled to avoid competing requests on constrained devices.

### Loading measurements and limits

The controlled embedded-browser run measured first paint across 23 pages at 60–192ms before, and 60–108ms after (median 76ms in both runs). A separate same-origin test through the user's actual **Live Server at port 5500** measured first paint at **36–104ms, median 56ms**, across all 23 pages.

These are this machine/browser/cache session's navigation measurements, not cold-network guarantees or top-level browser-container loading measurements. A multi-second blank was not reproduced in these tests. They establish that the current page documents paint promptly under the recorded conditions; they do not prove that every possible blank-screen cause is eliminated.

Header state comparisons, before/after timing, actual Live Server measurements and delayed-background results are in `audit/header-loading/`. The 23-page native interaction run was repeated after this update and passed for all dropdowns, mobile folders, accordions and gallery dialogs.

## Confirmed defects and repairs

1. CSS rewriting used a regular expression over `url(...)` and inserted line breaks after every closing brace. This could corrupt embedded SVG data and quoted selectors, preventing later header, section and list rules from applying. Resource existence checks did not detect the failure. Styles now retain their original token structure, and localization replaces only known asset URL strings. The shared repair applies to all 23 paths.
2. Responsive `<picture><source srcset>` logo variants had remained linked to the original CDN. These now reference the downloaded local logo files; the static validator checks them too.
3. The quote section's generative background had been omitted, leaving light text on white. Its configured base color is restored, and a standalone WebGL implementation uses the original Bokeh shader equations and configuration, including pause/play controls. No platform runtime is loaded.
4. The admission reel initially aligned the first image to the left and added an arbitrary gap. It now centers the first letter with circular neighboring letters and initializes dimensions using the source-style integer rounding. Native control/alignment checks passed for both homepage paths at all six widths; first-slide centering error was below 0.22 px, next moved to image 2, and previous returned to image 1. Evidence: `audit/reel-verification.json`.

The desktop homepage was approximately 12,539 px tall before the CSS repair, including an approximately 2,980 px header. After repair the test render is approximately 4,667 px tall with a 154 px header. The locally served reference snapshot measured approximately 4,644 px in that test, but its Adobe heading font did not load on the comparison origin, so the difference is **not** a trustworthy pixel-accuracy score.

## Inventory and preserved content

The original homepage, recursive navigation links and sitemap exposed 23 paths representing 16 distinct main-content bodies, including aliases and the sitemap-only `why-choose-us` page. Every discovered path has its own local HTML document. Normalized main-content text comparisons against the collected source pass for every page. Original heading/section inventories remain in `audit/investigation.md` and `audit/page-inventory.json`.

## Complete URL mapping

Original paths retain the same local directory route. Python's server adds a trailing slash to directory URLs.

| Original URL | Local URL | Document title |
| --- | --- | --- |
| https://en.auctaedu.org/ | http://localhost:8000/ | AUCTA Education |
| https://en.auctaedu.org/about-us | http://localhost:8000/about-us/ | About 1 — AUCTA Education |
| https://en.auctaedu.org/about/founders-letter | http://localhost:8000/about/founders-letter/ | About 1 — AUCTA Education |
| https://en.auctaedu.org/about/our-journey | http://localhost:8000/about/our-journey/ | Our Journey — AUCTA Education |
| https://en.auctaedu.org/admissions-result | http://localhost:8000/admissions-result/ | Undergraduate — AUCTA Education |
| https://en.auctaedu.org/admissions-result/graduate | http://localhost:8000/admissions-result/graduate/ | Graduate — AUCTA Education |
| https://en.auctaedu.org/admissions-result/undergraduate | http://localhost:8000/admissions-result/undergraduate/ | Undergraduate — AUCTA Education |
| https://en.auctaedu.org/contact | http://localhost:8000/contact/ | Contact 1 — AUCTA Education |
| https://en.auctaedu.org/graduate-1 | http://localhost:8000/graduate-1/ | General 4 — AUCTA Education |
| https://en.auctaedu.org/graduate-services/faqs | http://localhost:8000/graduate-services/faqs/ | FAQs — AUCTA Education |
| https://en.auctaedu.org/graduate-services/overview | http://localhost:8000/graduate-services/overview/ | General 4 — AUCTA Education |
| https://en.auctaedu.org/our-team | http://localhost:8000/our-team/ | Team 1 — AUCTA Education |
| https://en.auctaedu.org/our-team/chinese-consultants | http://localhost:8000/our-team/chinese-consultants/ | Chinese Consultants — AUCTA Education |
| https://en.auctaedu.org/our-team/management-team | http://localhost:8000/our-team/management-team/ | Team 1 — AUCTA Education |
| https://en.auctaedu.org/our-team/us-consultants | http://localhost:8000/our-team/us-consultants/ | US Consultants — AUCTA Education |
| https://en.auctaedu.org/services | http://localhost:8000/services/ | General 4 — AUCTA Education |
| https://en.auctaedu.org/student-testimonials/graduate | http://localhost:8000/student-testimonials/graduate/ | Reviews 1 — AUCTA Education |
| https://en.auctaedu.org/student-testimonials/undergraduate | http://localhost:8000/student-testimonials/undergraduate/ | Reviews 1 — AUCTA Education |
| https://en.auctaedu.org/student_testimonials | http://localhost:8000/student_testimonials/ | Reviews 1 — AUCTA Education |
| https://en.auctaedu.org/undergraduate-services/faqs | http://localhost:8000/undergraduate-services/faqs/ | FAQs — AUCTA Education |
| https://en.auctaedu.org/undergraduate-services/overview | http://localhost:8000/undergraduate-services/overview/ | General 4 — AUCTA Education |
| https://en.auctaedu.org/home | http://localhost:8000/home/ | AUCTA Education |
| https://en.auctaedu.org/why-choose-us | http://localhost:8000/why-choose-us/ | Why Choose Us — AUCTA Education |

### Equivalent content / aliases

- `/` = `/home`
- `/about-us` = `/about/founders-letter`
- `/admissions-result` = `/admissions-result/undergraduate`
- `/graduate-1` = `/graduate-services/overview`
- `/our-team` = `/our-team/management-team`
- `/services` = `/undergraduate-services/overview`
- `/student-testimonials/undergraduate` = `/student_testimonials`


## Implementation and local assets

- Static HTML5, CSS and vanilla JavaScript. No framework, package manager, build step or Squarespace runtime is needed to browse the project.
- Original page text, shared styles, page-specific responsive grids, image choices, focal-point metadata, SVG masks, navigation labels and footer content are retained.
- 178 local image/graphic files (175 raster assets and 3 SVGs), plus the original root favicon. Raster integrity checks passed. The provenance manifest lists the source and local filename of each asset.
- Archivo Expanded bold is locally included under the SIL Open Font License as the explicitly documented heading-font substitute. Its license is in `assets/fonts/`.
- English internal links resolve locally. The Chinese-language switch and LinkedIn remain intentional external hyperlinks.
- There was no contact submission form in the collected contact page. No backend delivery is claimed.
- Desktop dropdowns, mobile folder/Back navigation, accordions, circular reel controls and gallery dialogs are independent local JavaScript. Bokeh is rendered by local WebGL code; the noise shader's MIT attribution/license is retained in code and `licenses/webgl-noise-MIT.txt`.
- The asset manifest's apparent `%23check` failure refers to an escaped fragment inside an inline SVG mask, not a missing image. Unused proprietary platform icon fonts are neutralized; no font file is copied for them.

## Verification completed after repair

### Static and server checks

- All 23 route documents passed local HTTP serving checks.
- 1,504 local link references resolve to existing targets.
- 433 script/image `src` references and 1,538 responsive `srcset` candidates, stylesheet references, inline/CSS asset targets and accordion target IDs were checked; no missing local target or external runtime resource was found.
- All 23 main-content text comparisons pass.
- Navigation, gallery, accordion and background JavaScript syntax checks pass.
- Simulated DOM state tests still pass, but are supplementary rather than visual proof.

Evidence: `audit/static-verification.json`, `audit/dom-verification.json`, `audit/http-verification.json`.

### Rendered layout matrix

A QA harness was opened in the app's actual embedded browser. It rendered every local path at **1440, 1280, 1024, 768, 390 and 375 px**, with a 1000 px frame height: **138 local route/viewport combinations**. The matrix recorded header and section geometry, image loading and dimensions, font states and browser errors. Every combination had zero broken visible images and zero captured local browser errors.

The harness also rendered the corresponding collected reference HTML with its original remote scripts/styles/assets. This was useful for identifying CSS failure and gallery positioning. **It is a locally served source snapshot, not a visit to the original origin.** Adobe fonts did not load on that comparison origin; source-origin behavior can differ. Its geometry must not be treated as a golden screenshot or proof of exact typography.

Evidence: `audit/rendered-layout/`. The matrix was collected after the CSS/logo/background repair. The later circular reel adjustment and header/loading update have their own separately dated checks; the original matrix is retained as historical evidence.

### Native-browser interactions

The embedded browser exercised all 23 local documents, checking actual rendered visibility and panel dimensions after the source CSS transitions settled:

- 138 desktop dropdowns.
- 138 mobile folder/Back transitions and hamburger opening/closing.
- All 29 accordion items.
- Five gallery/lightbox instances, including aliases.
- No external runtime requests or captured local browser errors.

Evidence: `audit/browser-interaction-verification.json`. These are programmatic interactions inside the rendered document; they do not establish hover, physical touch-gesture or animation equivalence to the live original.

## Typography and exact-match blocker

The source uses Adobe **Pragmatica Extended, bold normal/italic** for headings/meta, and **Helvetica Neue, Arial, sans-serif** for body text. Source h1/h2 scales, responsive sizing formulas, line heights, spacing and design tokens are retained, including the 1800 px maximum width, 3vw desktop gutter and 6vw mobile gutter.

The delivered Archivo substitute is not metrically or visually identical to Pragmatica Extended. It can change heading shapes, line breaks and section heights. The user was asked whether licensed webfont files or control of the original Adobe Fonts project are available. Exact typography remains unresolved until a permitted original-font source is provided/configured. No Adobe font redistribution rights are assumed.

## Screenshot acceptance and remaining discrepancies

- CUA's trusted browser process cannot initialize in this environment; direct Playwright/Chrome exits with SIGABRT. Native full-page screenshot capture/control through those tools remains unavailable.
- The embedded-browser QA harness provides real layout/interaction evidence despite that limitation. DOM rasterization was also used internally to inspect local rendering, but it is **not a native browser screenshot** and is not presented as pixel-accuracy proof.
- Full live-original/local screenshot pairs, image-difference scores and pixel-level acceptance for every page remain outstanding.
- Original-font availability, exact heading wrapping, complete image-crop/mask parity and hover/touch details still require live-original visual comparison.
- The local Bokeh renderer follows the original equations/configuration. Its particles are random and animated; frame-identical output is not established. Reduced-motion and fallback behavior are implemented locally.
- The circular reel and local dialog preserve core functionality; exact original drag physics, transition timing, lightbox chrome and touch gestures remain unverified.
- Scroll-triggered reveal timing and dynamic header theme changes are not fully reproduced/verified.
- Python's basic server adds trailing slashes to directory routes; internal links use relative `index.html` targets.

Do not describe this project as 100% accurate or visually indistinguishable until the original-font issue and complete native screenshot comparison are resolved. Optional Playwright comparison tools remain in `tools/` for a browser environment that supports them.

## Rights and scope

Original website materials remain owned by their respective rights holders. The requested local evaluation copy has not been published. Public accessibility is not represented as a redistribution license. Archivo and the noise shader retain their provided licenses; Adobe fonts are not redistributed. No stock or AI-generated replacement imagery was introduced.

## Common mobile padding and document transitions

Mobile header controls, Back links, navigation links and the Contact button container now share `--mobile-nav-padding:6vw`. Removed the Back control extra horizontal inset. Same-origin cross-document view transitions retain the outgoing rendered page while the next document becomes ready in browsers supporting this feature. This is a blank-flash mitigation, not evidence that the reported underlying navigation delay is resolved.

## Immediate navigation and restored fades — November 7

This update supersedes the earlier cross-document view-transition mitigation, which is disabled. `loading.js` now intercepts ordinary same-origin HTML link clicks, fetches the next standalone document and required scripts, preserves the current body and shared styles during that fetch, and replaces content only when ready. No loading overlay, fade-out, image/font completion gate or source 1s animation delay is used. Page-owned global listeners, observers and animation callbacks are disposed on replacement. Direct HTML URLs, external links, modified clicks and normal hash links retain browser behavior; failed requests fall back to ordinary navigation.

The captured source configuration specifies fade, 650ms, ease and a 1s delay. Per the user's request for immediate content, the local entrance and scroll reveals use 650ms/ease with no pre-animation delay. Content is visible by default; Web Animations API fades run only when content enters the viewport. Reduced motion skips these effects.

Rendered embedded-browser navigation testing traversed all 23 pages with **zero full-document load events**, visible nonzero-opacity main content on every commit, active entrance animations and zero captured browser errors. A deliberately delayed Contact fetch retained the previous body throughout the delay. Separate rendered checks passed actual relative logo navigation, history back/forward, accordion interaction after replacement and gallery lightbox interaction. Evidence: `audit/instant-navigation/`.

These tests establish that ordinary local navigation no longer unloads the current page into a blank document. Initial cold top-level browser startup and the surrounding app's tab-loading UI remain outside this navigation test; no universal zero-latency claim is made.

## User-requested desktop dropdown redesign

The desktop dropdown panels were intentionally redesigned after the user accepted the reconstruction: white floating panels, 12px corners, restrained border/shadow, left-aligned rows with consistent spacing, pale green hover/focus feedback and directional chevrons. The panel uses a hover bridge and retains existing click/keyboard disclosure behavior. Changes are scoped to `.header-display-desktop`; mobile menu and source Flex/background behavior are preserved.

## Palette alignment, centered Contact and page titles

Per the user’s revision, desktop dropdowns use square corners and no shadow. All dropdown colors reference the existing white/black/lightAccent/darkAccent/accent palette variables; hover and current-page styling use a warm accent underline and darkAccent text, without a filled selected row. Current links are marked consistently across content aliases. Contact content is centered in a single column; its empty form placeholder is hidden. All 23 tab titles follow “Page Name — AUCTA Education”, including differentiated FAQs, service overviews, admissions and testimonial pages. The progressive navigation script already applies each fetched document title. Regeneration preserves titles, page identity and selected links.

Dropdown follow-up: desktop panels now use the existing lightAccent background and darkAccent text, with right-aligned labels. Square corners, no shadow, and palette-based underline interaction remain.

Final dropdown direction: near-white subtly warmed with the existing accent, charcoal labels, one warm hairline at the panel top and matching thin hover/current underlines. Text aligns to the parent label’s right edge. Previous dropdown CSS variants were consolidated into one implementation; corners remain square and shadows absent.

Dropdown correction: removed the mixed warm-white fill and warm accent rules. Panels now use the unmodified site white, site charcoal labels and charcoal underline behavior matching existing navigation. Corner radii directly reuse all four primary-button rounded radius variables (currently 6.4px). Text remains right-aligned; shadows remain absent.

Dropdown color follow-up: panel background now uses the existing accent palette variable directly, as requested. Charcoal text, button-derived corner radii and right alignment remain.

Dropdown revision: existing lightAccent off-white background with accent-colored hover/current-page underlines, retaining charcoal text, rounded corners and right alignment.

Dropdown warmth adjustment: cream off-white made from 90% existing white and 10% existing accent, paired with the unchanged accent underline. This warmer tint is explicitly requested by the user.

Latest dropdown background: neutral light gray (#f2f2f2), with accent underlines, rounded corners and right alignment retained.

Dropdown widths now fit each panel’s longest label plus horizontal padding; the shared minimum width has been removed.

Dropdown proportion refinement: short menus retain a modest 180px minimum width while longer labels expand naturally. Panel and row spacing are tightened; gray, accent underline and right alignment remain.
