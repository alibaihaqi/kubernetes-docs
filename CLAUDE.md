# Kubernetes Learning Docs

> Public VitePress documentation site published to GitHub Pages. Part of the
> learning-docs hub.

> **Read [`CHANGELOG.md`](./CHANGELOG.md) first** — it summarizes what has been
> added over time so you have context before reading the code.

## Content model
- Content lives in `src/`. Sections: `introduction`, `beginner`, `intermediate`, `advanced`, `argo-stack`.
- A tier is a numbered ladder building ONE concrete artifact.
- Tier `index.md` frontmatter: `title`, `tier`, `platform: kubernetes`.

## Add a page
1. Create `src/<tier>/NN-title.md` with a goal, steps with complete code, and a
   runnable checkpoint (command or clearly reader-facing kubectl/kind step).
2. Add it to the tier `index.md` ladder and the sidebar in `.vitepress/config.mts`.

## Add a tier
New `src/<tier>/` + `index.md` (frontmatter) + a sidebar group + a home feature
card in `src/index.md`.

## Build
- `pnpm install`
- `pnpm docs:build`   # must pass; checks dead links (Node 26.4.0)
- `pnpm docs:preview`

## RULE — this repo is PUBLIC
Never commit secrets, kubeconfigs, tokens, or personal data. kubectl/kind
commands in pages are reader-facing; no live cluster is created by this repo.
Images are public (`nginx`); no private registries.
