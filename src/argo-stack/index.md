---
title: Argo Stack
tier: argo-stack
platform: kubernetes
position: 1
---

# Argo Stack — Event-Driven GitOps

## What is the Argo project?

Argo is a suite of CNCF-graduated Kubernetes-native tools:

- **ArgoCD** — GitOps continuous delivery (covered in [Advanced / GitOps with ArgoCD](/advanced/06-gitops-with-argocd))
- **Argo Workflows** — Engine for orchestrating parallel jobs and pipelines
- **Argo Events** — Event-based dependency manager that triggers workflows

Together they form an event-driven GitOps pipeline: code push → events →
workflow → deploy.

## What we'll build

A webhook-triggered pipeline on your local kind cluster:

```
curl (simulating a push)
  → Argo Events EventSource (webhook)
  → EventBus (Redis)
  → Sensor (triggers on payload)
  → Argo Workflows (WorkflowTemplate)
  → ArgoCD sync (app deploys)
```

No GitHub or ngrok required — all local.

## Prerequisites

- kind cluster running ([Beginner / Local Cluster](/beginner/02-local-cluster))
- [ArgoCD installed](/advanced/06-gitops-with-argocd) (Advanced page 06)
- kubectl configured and pointing at your kind cluster

## Pages

1. [Overview](/argo-stack/) (this page)
2. [Argo Events](/argo-stack/02-argo-events) — EventBus, webhook EventSource, Sensor
3. [Argo Workflows](/argo-stack/03-argo-workflows) — WorkflowTemplate, steps, submit
4. [Pipeline](/argo-stack/04-pipeline) — wire Events → Workflow → ArgoCD sync
5. [Teardown](/argo-stack/05-teardown) — clean up

## Next

Continue to [Argo Events →](/argo-stack/02-argo-events)
