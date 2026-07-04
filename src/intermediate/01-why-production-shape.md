---
title: Why production-shape it
tier: intermediate
platform: kubernetes
---

# Why production-shape it

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 01

## Goal

Understand what a bare Deployment is missing and why each addition in this tier
matters in a real cluster.

## The gap

The beginner tier gave you a `web` Deployment that runs. A container starts, the
app responds, and port-forward lets you reach it. That is enough to prove the
concept.

In production (or even on a shared team cluster) the picture is different:

| Missing piece | What goes wrong without it |
|---|---|
| Config injection | Env vars baked into the image; changing them requires a rebuild |
| Liveness probe | Kubernetes can't detect a deadlocked process — it stays in `Running` forever |
| Readiness probe | Traffic hits pods that aren't ready yet; users see errors during rollouts |
| Resource requests | Kubernetes can't schedule pods intelligently; a noisy neighbour starves your app |
| Resource limits | One misbehaving container can eat all node memory and OOM-kill its neighbours |
| Rolling update | Changing the image version causes downtime unless Kubernetes knows how to swap pods gradually |
| Scaling | One replica is a single point of failure |

## What this tier adds

Each page in this ladder fixes one gap:

1. **02 ConfigMap and env** — externalise `GREETING` into a ConfigMap so the
   Deployment reads it at runtime, not at build time.
2. **03 Probes** — add `readinessProbe` + `livenessProbe` on the nginx `/`
   endpoint so Kubernetes knows when a pod is healthy.
3. **04 Resource requests and limits** — add CPU and memory budgets so the
   scheduler can place pods correctly and containers can't overconsume.
4. **05 Rolling update** — change the image tag from `nginx:1.27` to
   `nginx:1.27.1` and watch Kubernetes replace pods without downtime.
5. **06 Scaling** — scale the Deployment from 1 to 4 replicas and back.
6. **07 Wrap-up** — review what changed and tear down the cluster.

## Prerequisites

You have completed the beginner tier. The `learn` cluster is running and the
`web` Deployment, Service, and their manifests (`deployment.yaml`,
`service.yaml`) are in place.

Next: [02 ConfigMap and env](./02-configmap.md)
