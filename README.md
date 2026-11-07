# AUCTA English website — standalone local reconstruction

This folder contains 23 local URL paths covering 16 distinct public English page contents discovered through navigation and the original sitemap. It uses static HTML5, CSS and vanilla JavaScript. Images, a permitted substitute heading font, and styles load locally. No Squarespace scripts, analytics, framework, package manager, build step or original-site connection is required to browse the local site.

**Status (November 7 repair):** the CSS processing defect that broke the header, sections and service images has been fixed. All 23 paths were rendered in an embedded-browser QA harness at six viewport widths; local menus, accordions and lightboxes were also exercised in that browser. This is still **not a verified 100% visual match**: the original heading font is unavailable, and a live-origin native screenshot comparison remains outstanding. Read `reconstruction-report.md` for the exact test scope and remaining limitations.

## Open in VS Code and run

1. Choose **File → Open Folder** and select this `aucta-website` folder.
2. Open its integrated terminal.
3. Run:

```bash
python3 -m http.server 8000
```

4. Visit [http://localhost:8000](http://localhost:8000).
5. Stop the server with Ctrl+C.

Alternatively use VS Code's Live Server extension with this folder as the server root. Serve the folder itself, not its parent. A server is recommended over opening individual HTML files directly. Python 3 is the only server prerequisite; the website itself has no dependencies.

## Directory structure

```text
index.html                        Homepage
home/, about-us/, our-team/, …     Original aliases retained
about/                            Founder’s Letter and Our Journey
our-team/                         Management, Chinese and US consultants
undergraduate-services/           Overview and FAQs
graduate-services/                Overview and FAQs
admissions-result/                Undergraduate and graduate admissions
student-testimonials/             Undergraduate and graduate testimonials
why-choose-us/, contact/          Additional English pages
assets/images/                    Original local images and graphics
assets/images/responsive/         Original-CDN responsive derivatives
assets/fonts/                     Archivo substitute and OFL license
assets/asset-manifest.json         Source URLs and local filenames
css/reference-design.css          Reference CSS with its original token structure
css/reference-components.css      Reference component styling
css/component-*.css               Reference block styles
css/fonts.css                    Local heading font declaration
css/local.css                    Standalone layout/interaction adapters
js/navigation.js                 Desktop dropdowns and mobile folder menu
js/gallery.js                    Reel controls, swipe/drag and enlargement
js/background.js                 Lazy-initialized Bokeh background renderer
js/loading.js                    Progressive local navigation and page lifecycle
js/main.js                       Accordion interactions
audit/                           Inventory and recorded verification results
tools/                           Optional future browser screenshot comparison
reconstruction-report.md         Findings, results and limitations
```

## Editing

Each route has a real `index.html`; there is no framework or generated application bundle. A small progressive navigation script keeps the current page visible while fetching the next HTML document; direct URLs and browser back/forward remain supported. Visible content is editable directly in those files. Page/scroll motion uses the original Flex selectors and retained CSS: segmented heading reveals, clipped images and grouped content. The body startup marker is present in HTML, preventing the inherited two-second hideContent fallback. Background playback controls are removed as requested. Original per-page grid geometry and responsive rules are retained in inline `<style>` blocks near their sections. Shared colors, font sizes, widths and gutters are CSS custom properties in `reference-design.css`. Add intentional shared overrides to `local.css`.

Some original class names contain `sqs`, `fe-`, or collection IDs. These identify static layout/style rules; they do not invoke or require Squarespace. The retained reference CSS contains unused template selectors as well as the styles the public pages need. Its token structure is intentionally preserved; naïve formatting or regular-expression rewriting of embedded SVG data URLs can break later rules. Alias pages have separate HTML copies; keep their content in sync when editing.

## Links and interactions

All discovered English internal destinations resolve to local files, including aliases and nested paths. The Chinese-language switch and LinkedIn intentionally remain external hyperlinks. They are outside the English reconstruction. The contact page contains contact information, not a submission form. No backend or delivery service is represented as configured.

FAQ and admissions tables expand with their buttons. The mobile menu opens folders with a Back link. Admission images enlarge in a keyboard-accessible dialog: Escape closes it and arrow keys change images. The homepage reel starts with the first letter centered, continues circularly through neighboring letters, and supports previous/next controls, native touch scrolling and mouse dragging. The quote section renders the source Bokeh shader equations through standalone WebGL, with its configured base color as fallback and working pause/play controls.

## Loading checks

The header uses the source white/compact state after 10px of scrolling. Content images have local responsive derivatives; the lightbox reads the preserved original via `data-full-src`. When replacing an image, update its `srcset` and `data-full-src` as well as `src`. Fonts are preloaded with swap behavior, and background effects initialize near their sections.

For a dependency-free timing check in your own browser, open `tools/loading-audit.html` through the local server and click **Run checks**. It measures all local pages and offers a JSON download. Results depend on your browser, device and cache. Normal website navigation does not send diagnostic results anywhere.

## Optional screenshot comparison

The optional QA scripts require Node.js plus Playwright (and a browser), and Python Pillow for difference images. These are development tools only, not website dependencies. From a separate tooling directory, install Playwright and its browser, then set `NODE_PATH` to that directory's `node_modules` when invoking `tools/capture-comparison.cjs`. You may instead point `CHROME_PATH` to an installed Chrome executable. Run the website server first; `LOCAL_BASE` defaults to `http://127.0.0.1:8000`.

The capture script visits all 23 paths at 1440, 1280, 1024, 768, 390 and 375 px, with a 1000 px viewport height and scale factor 1. It saves original/local full-page screenshots and errors beneath `audit/`. Then run `python3 tools/diff-screenshots.py` to generate overlays and difference images. No screenshots or image-difference scores are included because capture was blocked in the current environment.

## Troubleshooting

- **Port in use:** run `python3 -m http.server 8001` and open port 8001 instead.
- **Missing styles or images:** serve the entire folder; do not move a nested page out of it. Check `assets/` was copied completely.
- **Nested URL redirects:** Python adds a trailing slash to directory routes; this is expected.
- **Heading shapes differ:** the original Adobe Pragmatica Extended is not redistributed. Archivo Expanded is deliberately documented as a substitute.
- **Visual acceptance:** rendered layout and native-browser interaction logs are in `audit/`; live-original native screenshot comparisons and exact typography acceptance remain outstanding.

No deployment was performed. Original content and image ownership remain with their respective rights holders; no new redistribution license is granted for them. Archivo's license is included in `assets/fonts/`.
