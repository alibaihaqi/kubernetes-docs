---
title: Kubernetes Advanced — production cluster with Helm, GitOps, and observability
tier: advanced
platform: kubernetes
---

# Kubernetes Advanced

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced

## What you'll build

You extend the intermediate kind cluster into a production-shaped setup: package manifests with Helm, install an Ingress controller and cert-manager for TLS, deploy a StatefulSet with persistent storage, implement GitOps with ArgoCD, add monitoring with Prometheus/Grafana, set up structured logging, and apply RBAC security best practices.

## Prerequisites

- Complete the [Intermediate tier](../intermediate/) (production-shape Deployment on kind)
- `kind`, `kubectl`, `helm` installed
- A local kind cluster (`kind create cluster`)

## The ladder

1. [01 Why Helm](./01-why-helm.md) — from raw YAML to charts
2. [02 Package with Helm](./02-package-with-helm.md) — create, template, install a chart
3. [03 Ingress controller](./03-ingress-controller.md) — nginx-ingress on kind
4. [04 cert-manager TLS](./04-cert-manager-tls.md) — automatic TLS certificates
5. [05 StatefulSet and PVC](./05-statefulset-and-pvc.md) — stateful workloads with persistent volumes
6. [06 GitOps with ArgoCD](./06-gitops-with-argocd.md) — declarative cluster state from Git
7. [07 Prometheus and Grafana](./07-prometheus-and-grafana.md) — metrics and visualization
8. [08 Logging with Loki](./08-logging-with-loki.md) — structured log aggregation
9. [09 RBAC and security](./09-rbac-and-security.md) — roles, bindings, Pod Security Standards
10. [10 Production hardening](./10-production-hardening.md) — PodDisruptionBudget, topology spread, network policies

**Start** → [01 Why Helm](./01-why-helm.md)
