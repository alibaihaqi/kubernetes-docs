---
title: Why Helm
tier: advanced
platform: kubernetes
position: 1
---

# Why Helm

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › Why Helm

**Goal**

Understand what Helm solves compared to raw `kubectl apply -f`, and install Helm locally.

**Prerequisites**

- Intermediate tier completed
- `kubectl` configured against a kind cluster

## The raw-YAML problem

The beginner and intermediate tiers used `kubectl apply -f deployment.yaml`. This works for one or two files, but in production you have:

- **Environment duplication** — dev, staging, prod with slightly different values
- **No versioning** — no built-in way to roll back to a previous release
- **Templating** — every environment needs its own copy of the same YAML
- **Dependency management** — app A needs Redis, app B needs Postgres, no way to declare it

Helm solves all four: it packages Kubernetes manifests as a **chart** with templated values, supports rollbacks, and can depend on other charts.

## Install Helm

```bash
# macOS
brew install helm

# Or from the script:
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version --short
# v3.17+
```

## Chart structure

```
mychart/
  Chart.yaml          # metadata (name, version, dependencies)
  values.yaml         # default configuration values
  templates/          # Go-template YAML files
    deployment.yaml
    service.yaml
    _helpers.tpl      # reusable template snippets
```

Helm processes `templates/` with `values.yaml` and produces the final Kubernetes manifests.

## Checkpoint

```bash
helm version --short
# v3.17.x
helm create demo  # scaffold a chart
ls demo/
# Chart.yaml  charts/  templates/  values.yaml
rm -rf demo  # clean up — we'll build our own next
```

**Next:** [Package with Helm](./02-package-with-helm.md) — create a chart for the intermediate web app.
