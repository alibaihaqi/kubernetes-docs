# Changelog

All notable changes to the Kubernetes learning-docs site. Newest first.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## 2026-07-04 — Intermediate tier

### Added
- **Intermediate tier** (`src/intermediate/`, 7 pages): production-shapes the
  beginner `web` Deployment — ConfigMap env, liveness/readiness probes, resource
  requests/limits, a rolling update, and scaling. Ends by reusing the beginner
  teardown.

## 2026-07-04 — Site scaffold + beginner tier

### Added
- Scaffolded the VitePress 1.6.4 site from an empty repo: home, introduction,
  config, GitHub Pages deploy workflow, Node 26.4.0 pin.
- **Beginner tier** (`src/beginner/`, 7 pages): deploy one app to a local kind
  cluster — Pod → Deployment → Service → port-forward, ending with a teardown
  page.
- **`CLAUDE.md`** — public-safe repo conventions.
