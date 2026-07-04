---
title: What is Kubernetes
---

# What is Kubernetes

Kubernetes is a container orchestration system. You describe the **desired
state** of your application in YAML — how many replicas, which image, which
ports — and the control plane continuously reconciles the cluster's actual state
to match it. If a Pod crashes, Kubernetes restarts it. If you scale a
Deployment, it schedules new Pods. You stop managing individual containers and
start managing declared intent.

## Tools you need

Install both tools before continuing. You'll need Docker already running.

```bash
# kubectl — the Kubernetes CLI
# Install per your OS: https://kubernetes.io/docs/tasks/tools/
kubectl version --client   # confirm kubectl is installed
```

```bash
# kind — Kubernetes IN Docker
# Install: https://kind.sigs.k8s.io/docs/user/quick-start/#installation
kind version               # confirm kind is installed
```

Once both commands succeed, move to [02 Local cluster with kind](./02-local-cluster.md).
