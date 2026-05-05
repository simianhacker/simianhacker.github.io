---
layout: post
title: "Hello World"
slug: hello-world
date: 2026-05-05
description: "The first post. A quick tour of everything this blog supports: code blocks, ES|QL, images, tables, and more."
---

Welcome. This is the first post.

## Code blocks

Here's a Python snippet with syntax highlighting:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("world"))
```

## ES|QL

ES|QL queries are fully highlighted:

```esql
FROM logs-*
| WHERE @timestamp >= NOW() - 24h
| STATS count = COUNT(*), avg_duration = AVG(event.duration)
    BY service.name
| SORT count DESC
| LIMIT 10
```

## Images

Drop screenshots or images into `assets/images/` and reference them like this:

```markdown
![Alt text describing the screenshot](/assets/images/my-screenshot.png)
```

Images are automatically styled with rounded corners and a subtle shadow.

## Tables

| Field | Type | Description |
|-------|------|-------------|
| `@timestamp` | date | Event timestamp |
| `service.name` | keyword | Service identifier |
| `event.duration` | long | Duration in nanoseconds |

## Blockquotes

> The best way to get started is to quit talking and begin doing.

## Inline code

Reference fields like `event.duration` or commands like `bundle exec jekyll serve` inline.

---

That's the full feature set. Write posts in `_posts/YYYY-MM-DD-title.md`, push to `main`, and they publish automatically.
