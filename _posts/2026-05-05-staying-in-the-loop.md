---
layout: post
title: "Staying in the Loop"
slug: staying-in-the-loop
date: 2026-05-05
description: "A tour of my agentic coding infrastructure featuring scheduling, memory, observability, and supervision"
---

This post walks through the stack I've built to support agent software engineering as a daily practice — not as a demo, but as a production workflow. Every piece exists because I hit a real problem and needed a real solution.

## The core insight: separate compute from control

![OpenCode Web UI showing multiple agent sessions running in parallel across different repos and worktrees](/assets/images/opencode-web.png)

The first thing I got right — mostly by accident — was decoupling where agents run from where I interact with them.

My work laptop sits on my desk running [OpenCode](https://opencode.ai), an agent software engineering tool with a server mode. I start it with `opencode serve` and it exposes an API on port 4096. Every device I own — my laptop, my iPad Mini, my phone — is connected via [Tailscale](https://tailscale.com), which gives me a private mesh network with stable DNS names and no port forwarding.

This means I can start a coding session on my laptop, walk to the couch, and pick it up on my iPad. I can dispatch an agent to work on something, leave my desk, and check on it from my phone. The laptop is the server. Everything else is a thin client.

One detail worth noting: OpenCode currently runs inside a [macOS Seatbelt](https://developer.apple.com/documentation/security/app_sandbox) sandbox — a small wrapper script launches `opencode serve` via `sandbox-exec`, restricting writes to `~/Projects`, config and cache directories, and temp paths. The sandbox explicitly blocks reads and writes to `~/.ssh`, `~/.gnupg`, the macOS Keychain, and macOS credential storage. Reads are broadly permitted elsewhere, which is why I'm migrating to Docker for proper filesystem isolation.


## Memory: Obsidian as the shared brain

![The Obsidian vault showing global agent memory files with YAML frontmatter properties — title, date, tags, summary, and scope](/assets/images/obsidian-vault.png)

Agents without memory are goldfish. They do great work in a session, then forget everything when the session ends. The next agent that spins up in the same project has no idea what the last one decided, what patterns it established, or what it tried and abandoned.

I solve this with an [Obsidian](https://obsidian.md) vault that serves as shared memory for all my agents. The vault contains global agent memories, per-project agent memories, research findings, multi-agent review results, and a knowledge base wiki. Each memory file is a markdown document with YAML frontmatter:

```yaml
---
title: "OpenCode memory-bootstrap: use system.transform not session.created"
date: 2026-05-01
tags:
  - memory
  - opencode
  - plugin
summary: "OpenCode 1.4.x: use experimental.chat.system.transform to inject context."
scope: global
---
```

An OpenCode plugin I wrote called `memory-bootstrap` reads these files at the start of every LLM request. It doesn't dump the full content into the system prompt — that would blow up the context window. Instead, it builds a lightweight manifest: title, summary, and file path for each memory. When an agent needs the full context of a particular memory, it reads the file.

This is a two-tier retrieval system built entirely on markdown files. No vector database, no embeddings, no infrastructure to maintain. Just files on disk with a plugin that reads frontmatter.

The manifest is organized into two sections — global memories (things every agent should know regardless of project) and project memories (scoped by resolving the git root of the working directory). An agent working in my dotfiles repo sees dotfiles-specific memories. An agent working in Kibana sees Kibana memories. Global memories are always present. Here's what actually gets injected into the context at the start of every session:

```xml
<memory-context>
## Agent Memory — Known Context

The following memories are loaded from the Obsidian vault.
To save new memories, use the `vault-memory` skill. To read full memory
content, open the file directly.

## Global Memories

- **Guided code walkthrough format for change comprehension**
  (`global-agent-memory/guided-code-walkthrough-format.md`): Present code
  changes as a sequential guided walkthrough in numbered parts, pausing
  after each for questions. Builds comprehension incrementally.
- **Review Panel Intensity by Project Type**
  (`global-agent-memory/review-panel-intensity-by-project-type.md`):
  Conditional review panel intensity: full for Elastic upstream,
  lightweight for personal/POC.
- **Verify Latest Version of Software Before Installing**
  (`global-agent-memory/verify-software-versions-before-installing.md`):
  Before installing or recommending software, verify the latest version
  via a web search to avoid outdated assumptions.
</memory-context>
```

Because it's all in Obsidian, I can review and edit memories from any device using the native apps. I pay for Obsidian Sync, which keeps the vault consistent across my laptop, iPad, and phone. The vault uses end-to-end encryption with a vault password — Obsidian can't read the contents, and neither can anyone who compromises the account without the password. Edit a memory on my phone, and the next agent session on my laptop picks up the change. The feedback loop between human review and agent behavior is just... editing a markdown file.

## Mission Control: a control plane for agent work

Dispatching a single agent session is easy. Managing a fleet of recurring tasks, one-shot jobs, and multi-step pipelines across multiple repos — that's where you need tooling.

I built a CLI called `mission-control` that serves as the control plane for all my agent work. It has three core primitives.

**Dispatch** is the simplest: point at a directory, give it a prompt, and it creates an OpenCode session scoped to that directory. The prompt can come from a string, a file, or stdin. Under the hood it discovers the OpenCode server via Tailscale, creates a session via the API, and fires the prompt asynchronously. Fire and forget.

**Schedule** layers time-based automation on top of dispatch. You define schedules with cron expressions or one-shot `runAt` timestamps, each pointing to a prompt file and a target directory. A scheduler daemon runs as a macOS LaunchAgent, ticking every 60 seconds to evaluate which schedules are due and dispatch them. One-shot schedules have retry caps (3 attempts within a 30-minute window) and auto-complete logic. Old completed schedules get pruned after 30 days. Session history is tracked per schedule with configurable retention.

**Ship** is the most opinionated primitive — it's a pipeline for shipping code changes. Given a change name, it runs pre-flight checks (change exists, has tasks, worktree is clean), creates an isolated git worktree, copies the project's agent skills and commands into it, creates a session scoped to the worktree, and dispatches a templated pipeline prompt. The worktree isolation means the agent makes changes on a branch without touching your working tree.

The key design decision across all three: mission-control doesn't execute agent work itself. It's purely an orchestrator that talks to OpenCode's API. The separation means scheduling, retry logic, and pipeline orchestration live in mission-control rather than baked into the agent runtime — though today it speaks OpenCode's API specifically.

## Observability: if you can't see it, it didn't happen

![A mission-control/dispatch trace in Kibana APM, showing spans for opencode.create_session and opencode.send_prompt](/assets/images/mission-control-dispatch-traces.png)

Here's where my day job as an observability engineer bleeds into my side projects.

Every layer of this stack is instrumented with OpenTelemetry. The `memory-bootstrap` plugin emits spans for each injection — how many memories loaded, which project was resolved, whether the vault exists. Mission-control emits spans for every dispatch, schedule evaluation, and pipeline step. There are histograms for dispatch latency, counters for commands and errors, and structured log records correlated with traces.

The most interesting instrumentation detail: when mission-control dispatches a prompt, it injects a W3C `traceparent` as an HTML comment at the end of the prompt text. This means I can correlate the mission-control dispatch trace with whatever the agent does downstream. The trace flows from "I ran `mc schedule run`" through "scheduler evaluated cron" through "dispatch created session" through "agent started working."

This might sound like overkill for a personal setup. It's not. When you have agents running on schedules while you're away, you *need* to be able to answer "what happened?" after the fact. Did the 2am memory audit run? Did it succeed? How long did it take? What did the agent do? Without observability, autonomous agents are a black box.

## The iPad as a steering wheel

All of this infrastructure exists so that I can be productive from any device, with any amount of time. The scenarios look like:

**From my desk** (deep work): I'm in OpenCode's web interface, working directly with an agent, full context, full keyboard. It's a surprisingly nice experience — multiple sessions visible at once, easy to context-switch between repos and worktrees. This is where the complex work happens.

**From my iPad on the couch** (supervision): I check on running sessions via OpenCode's web UI over Tailscale. I review agent-generated artifacts in Obsidian. If something needs a nudge, I can send a follow-up prompt. If I have an idea for a new task, I dispatch it via the web UI.

**From my phone in line at the coffee shop** (capture): I jot down an idea in Obsidian that'll become a prompt file or a memory. I glance at a session to see if a pipeline finished. I review a multi-agent panel discussion result.

The key insight is that none of these devices need to be powerful. They don't compile code, run tests, or host models. They're viewports into an agent-powered development environment that lives on my desk.

## What I've learned

A few takeaways after building and using this stack daily:

**Agent memory is a UX problem, not an AI problem.** The hard part isn't getting an agent to remember things — it's making the memory layer something a human can inspect, edit, and trust. Markdown files in Obsidian are dramatically less sophisticated than a vector database, and dramatically more useful in practice because I can review them on my phone. One trade-off worth naming: because agents can write memories, a successful prompt injection in any session could persist to future sessions. The two-tier design — summary in context, full content on explicit read — limits unintended propagation, and I periodically review what's in the vault.

**Scheduling is the gateway to autonomous agents.** The moment you can say "run this every morning at 6am" instead of "run this right now while I watch," your relationship with agents changes. They become background processes, not pair programmers. Most of my agent output now happens while I'm doing something else.

**Observability isn't optional — it's the accountability layer.** Traces don't prevent agents from doing something wrong; they tell you what happened when they do. That's what lets me audit autonomous runs after the fact and maintain confidence over time.

**The best infrastructure is boring infrastructure.** Tailscale, LaunchAgent cron, markdown files, HTTP APIs, git worktrees. None of this is novel. All of it is reliable. The most sophisticated part of this stack is the OTel instrumentation, and even that is just standard distributed tracing applied to a new domain.


