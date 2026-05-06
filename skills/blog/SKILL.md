---
name: "blog"
description: "Write and manage posts for simianhacker.github.io. Use when creating a new blog post, editing an existing post, adding images, or publishing."
---

# Blog Skill

Loaded skill: blog

This skill covers the full workflow for `simianhacker.github.io` — a Jekyll blog published via GitHub Pages.

**Repo:** `~/Projects/simianhacker.github.io/`
**Live:** https://simianhacker.github.io
**Branch:** `master` (GitHub Pages builds from `master`)

---

## Scripts

Always use the `bin/` scripts. Do not invoke `jekyll` or `bundle` directly.

| Script | Command | Purpose |
|--------|---------|---------|
| First-time setup | `bin/bootstrap` | Installs rbenv, Ruby 3.3, and gems |
| Local preview | `bin/serve` | Starts live-reload server at http://localhost:4000 |
| Production build | `bin/build` | Builds to `_site/` |
| New post | `bin/new-post` | Interactive: prompts for title/slug/description |

All scripts handle the rbenv PATH setup internally.

---

## Writing a post

### Fast path

```bash
cd ~/Projects/simianhacker.github.io
bin/new-post
```

Prompts for title, slug (auto-derived from title), and description. Creates the file and opens it.

### Manual path

Create `_posts/YYYY-MM-DD-slug.md`:

```markdown
---
layout: post
title: "Post Title"
slug: post-url-slug
date: 2026-05-05
description: "One sentence shown on the index page. Optional."
---

Post content here.
```

**Frontmatter fields:**

| Field | Required | Notes |
|-------|----------|-------|
| `layout` | Yes | Always `post` |
| `title` | Yes | Shown in the `<h1>` and browser tab |
| `slug` | Yes | Determines the URL: `simianhacker.github.io/<slug>/` |
| `date` | Yes | Format: `YYYY-MM-DD` |
| `description` | No | Shown on the index page and in `<meta>` description |

---

## Adding images

1. Place the image in `assets/images/`:

   ```
   assets/images/my-screenshot.png
   ```

2. Reference it in the post with standard Markdown:

   ```markdown
   ![Alt text describing the image](/assets/images/my-screenshot.png)
   ```

   Images are automatically styled: max-width, rounded corners, subtle drop shadow.

3. For an optional caption, put italic text on the line immediately after:

   ```markdown
   ![Screenshot of the dashboard](/assets/images/dashboard.png)

   *The Kibana dashboard after applying the new rule.*
   ```

**Supported formats:** PNG, JPG, GIF, WebP, SVG.

---

## Code blocks

Use fenced blocks with a language tag. All blocks are highlighted via highlight.js.

````markdown
```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```
````

````markdown
```esql
FROM logs-*
| WHERE @timestamp >= NOW() - 24h
| STATS count = COUNT(*) BY service.name
| SORT count DESC
| LIMIT 10
```
````

````markdown
```bash
bin/serve
```
````

Supported languages include `esql`, `python`, `javascript`, `typescript`, `bash`, `json`, `yaml`, `sql`, `ruby`, and [many more](https://highlightjs.org/demo).

---

## Markdown features

Full GitHub Flavored Markdown is supported:

- **Headings** — `##`, `###`, etc.
- **Bold / italic** — `**bold**`, `*italic*`
- **Inline code** — `` `code` ``
- **Links** — `[text](url)`
- **Lists** — ordered and unordered
- **Tables** — GFM pipe tables
- **Blockquotes** — `> text`
- **Horizontal rules** — `---`

---

## Publishing

```bash
cd ~/Projects/simianhacker.github.io
git add .
git commit -m "Add post: <title>"
git push
```

GitHub builds and deploys automatically. Changes are live in ~60 seconds at https://simianhacker.github.io.

**Important:** Always push to `master`. GitHub Pages is configured to build from `master`.

---

## Project structure

```
~/Projects/simianhacker.github.io/
├── _config.yml          # Site config (title, URL, permalink style)
├── _layouts/
│   ├── default.html     # Base layout: sticky nav, theme toggle, footer
│   ├── home.html        # Post listing (index page)
│   └── post.html        # Individual post
├── _includes/
│   └── head.html        # <head>: meta, highlight.js CDN, CSS, theme bootstrap
├── _posts/              # Posts — YYYY-MM-DD-slug.md
├── assets/
│   ├── css/main.css     # All styles — dark/light CSS tokens
│   ├── js/theme.js      # Theme toggle with localStorage persistence
│   └── images/          # Post images and screenshots
├── bin/
│   ├── bootstrap        # First-time setup
│   ├── serve            # Local dev server (live reload)
│   ├── build            # Production build
│   └── new-post         # Post scaffolding
└── index.html           # Home page
```

---

## Design notes

- **Dark by default**, with a light/dark toggle in the nav (☀ / ☾). Preference persists in `localStorage`. Respects `prefers-color-scheme` on first visit.
- **Typography:** `-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif` — clean and system-native.
- **Layout:** single-column, max-width 680px, generous whitespace.
- **No JavaScript frameworks**, no CSS frameworks — plain CSS and a small inline theme script.
- **highlight.js** via CDN handles syntax highlighting. Rouge (Jekyll's built-in) is present for fallback but highlight.js takes over client-side.

---

## Local preview workflow

```bash
bin/serve        # starts at http://localhost:4000, live-reloads on file save
```

Write the post, save the file, browser refreshes automatically. When satisfied:

```bash
git add .
git commit -m "Add post: <title>"
git push
```
