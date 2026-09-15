# AGENTS.md — Art Contribution Brief 美术工单

You are contributing to **homefurthem.org (回家计划)** — a real, live adoption
website for rescued stray dogs at a volunteer rescue base in China. Real dogs,
real adopters browsing on phones. Bilingual (中文/English), pure static
HTML/CSS/JS, no build step, no frameworks. Keep it that way.

**Your role here: artist / art director.** Content and dog data are managed by
the maintainers — your canvas is illustration and visual polish.

## Commissions (priority order)

1. **P1 — Hero illustration** for `index.html`. The slot already exists:
   `.hero-art` (index.html line ~37) currently holds a placeholder
   `assets/mascot.webp`. Theme: **"from the streets to a warm home"
   (从街头到家)**. Mood: warm, hopeful, storybook — this site sells hope,
   never pity. No sad eyes behind bars.
2. **P2 — Spot decorations**: paw prints, small section-header illustrations
   (about the base / adoption steps / stories), subtle corner doodles.
3. **P3 — Social card**: upgrade `assets/og.jpg` to match the new hero.

## Style guide

- **Palette** (from `styles.css`, stay inside it):
  bg `#fdf7f0` / `#faf1e8` · ink `#4a3a31` · primary orange `#e08a4a` /
  `#c9743a` · peach `#f3cbb9` / `#fbe7dc` · matcha `#b3c9a4` / `#7d9e76` ·
  cream `#fbeecf`
- Title font is ZCOOL KuaiLe (round, playful). Match that friendliness:
  soft edges, hand-drawn warmth. Watercolor / storybook direction preferred;
  textured-flat also welcome.
- **The dogs are mixed rural Chinese dogs (田园犬/中华田园犬)** — medium build,
  yellow/white/black coats, pointy or floppy ears. Draw them, not Western
  breed clichés. Reference photos: `assets/dogs/`.
- Avoid text inside images (bilingual site). Decorative art gets
  `aria-hidden="true"` and empty `alt` (existing pattern).

## Technical rules

- New art goes in **`assets/art/`** (create it). Kebab-case English filenames.
- SVG preferred for decorations. Hero may be PNG/WebP, **≤ 300 KB** —
  adopters browse on slow mobile connections. Transparent background where
  possible so art sits on the warm page bg.
- You may edit HTML/CSS to place your work. **Do not touch `data.js`**
  (volunteer-managed dog content). Do not add frameworks, build steps, or
  JS dependencies.
- Cache convention: HTML references scripts as `app.js?v=N` / `data.js?v=N`.
  If you edit those files, bump `N` in every HTML file that references them.
  New image files need no versioning (new filename = fresh cache).
- Mobile-first: verify nothing overflows at ~400 px width. Preview by opening
  the HTML files directly in a browser — no server needed.

## Workflow

- Push to `main` is fine, or open a PR if you prefer.
- **Pushes do NOT auto-deploy.** A maintainer reviews and pulls to production,
  so you can iterate freely without fear of breaking the live site.
- Commit messages in English, imperative mood.

---

The dogs in `assets/dogs/` are real and waiting at the base right now.
Make each one look like somebody's future family member.

谢谢你，美术老师。 — Ginger & the site bear 🐾
