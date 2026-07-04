---
title: Local cluster with kind
---

# Local cluster with kind

`kind` (Kubernetes IN Docker) runs a full Kubernetes control plane inside a
Docker container. It is the fastest way to get a real cluster locally without
any cloud account.

## Create the cluster

```bash
kind create cluster --name learn
```

kind pulls a node image, starts the container, and configures `kubectl` to
point at it automatically.

## Confirm it is up

```bash
kubectl get nodes
# NAME                  STATUS   ROLES           AGE   VERSION
# learn-control-plane   Ready    control-plane   30s   v1.xx.x
```

One node with role `control-plane` and status `Ready` means the cluster is
healthy. You are now ready to schedule workloads.

> **Note:** This is the only page that creates a cluster. [07 Teardown](./07-teardown.md)
> deletes it when you are done.

Next: [03 A Pod](./03-pod.md)
