---
title: better-seo.js Documentation
description: Programmable SEO for Next.js and modern apps — one model for metadata, social previews, and JSON-LD.
---

# better-seo.js

**better-seo.js is a programmable SEO engine for Next.js and modern apps.** You describe a page once (title, description, canonical, Open Graph, Twitter, JSON-LD), then map that document to Next.js `Metadata`, React Helmet, or plain tags — without five parallel sources of truth.

## What to read next

| Layer (PRD §8.6) | Start here                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------ |
| **~60 seconds**  | [Get started](./getting-started/index.md) — install and `seo({ title })`                   |
| **Mental model** | [Concepts](./concepts/seo-document.md) — the `SEO` object and pipeline                     |
| **Copy-paste**   | [Recipes](./recipes/index.md) — layout merge, rules, OG, icons, React                      |
| **Reference**    | [API overview](./api/index.md), [CLI overview](./cli/index.md) → [commands](./commands.md) |

This site is built with **Next.js + Nextra** and uses **`@better-seo/next`** for root metadata and JSON-LD (see monorepo **`apps/docs`**).

## Repository

- **Source & issues:** [github.com/0xMilord/better-seo-js](https://github.com/0xMilord/better-seo-js)
- **Golden Next.js example:** `examples/nextjs-app` (Playwright E2E)
