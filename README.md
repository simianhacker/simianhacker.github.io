# simianhacker.github.io

Personal blog. Built with Jekyll, published via GitHub Pages.

**Live:** https://simianhacker.github.io

---

## Setup

Run once after cloning:

```bash
bin/bootstrap
```

This installs rbenv, Ruby 3.3, and all gem dependencies. Homebrew is required — install it from [brew.sh](https://brew.sh) if needed.

---

## Scripts

| Command | Description |
|---------|-------------|
| `bin/bootstrap` | First-time setup: installs Ruby + gems |
| `bin/serve` | Local preview with live reload at http://localhost:4000 |
| `bin/build` | Production build to `_site/` |
| `bin/new-post` | Interactive prompt — creates a new post file and opens it |

---

## Writing a post

### The fast way

```bash
bin/new-post
```

Prompts for title, slug, and description. Creates the file and opens it in your `$EDITOR`.

### The manual way

Create `_posts/YYYY-MM-DD-slug.md`:

```yaml
---
layout: post
title: "Your Post Title"
slug: your-url-slug
date: 2026-05-05
description: "One sentence shown on the index page."
---

Post content here.
```

The post will be live at `simianhacker.github.io/your-url-slug/`.

---

## Adding images

Drop images or screenshots into `assets/images/`:

```
assets/images/my-screenshot.png
```

Reference them in a post with standard Markdown:

```markdown
![Description of the image](/assets/images/my-screenshot.png)
```

Images are automatically styled with rounded corners and a subtle shadow.

---

## Code blocks

Fenced code blocks with a language tag get full syntax highlighting via highlight.js:

````markdown
```python
def hello():
    return "world"
```
````

````markdown
```esql
FROM logs-*
| WHERE @timestamp >= NOW() - 24h
| STATS count = COUNT(*) BY service.name
| SORT count DESC
```
````

Supported languages include `esql`, `python`, `javascript`, `typescript`, `bash`, `json`, `yaml`, `sql`, and [many more](https://highlightjs.org/demo).

---

## Publishing

```bash
git add .
git commit -m "Add post: your title"
git push
```

GitHub builds and deploys automatically. Changes are live in ~60 seconds.

---

## Project structure

```
.
├── _config.yml          # Site configuration
├── _layouts/
│   ├── default.html     # Base layout (nav, footer, theme toggle)
│   ├── home.html        # Post listing page
│   └── post.html        # Individual post
├── _includes/
│   └── head.html        # <head> tag: meta, CSS, highlight.js
├── _posts/              # Blog posts (YYYY-MM-DD-slug.md)
├── assets/
│   ├── css/main.css     # All styles + light/dark tokens
│   ├── js/theme.js      # Theme toggle with localStorage persistence
│   └── images/          # Post images and screenshots
├── bin/
│   ├── bootstrap        # First-time setup
│   ├── serve            # Local dev server
│   ├── build            # Production build
│   └── new-post         # Post scaffolding
└── index.html           # Home page (uses home layout)
```
