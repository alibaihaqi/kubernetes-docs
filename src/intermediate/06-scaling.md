---
title: Scaling
tier: intermediate
platform: kubernetes
---

# Scaling

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 06

## Goal

Scale the `web` Deployment from 1 replica to 4 and back to 2 to see how
Kubernetes distributes pods across the cluster.

## Why

One replica is a single point of failure. If that pod crashes or its node
becomes unavailable, the app is down until the pod is rescheduled. Scaling to
multiple replicas means the Service load-balances across healthy pods and
Kubernetes can reschedule if a node fails.

## Step 1 — Scale up

```bash
kubectl scale deployment/web --replicas=4
```

Watch the new pods come up:

```bash
kubectl get pods -l app=web
```

Expected output once all four are ready:

```
NAME                   READY   STATUS    RESTARTS   AGE
web-<hash>-<hash>      1/1     Running   0          2m
web-<hash>-<hash>      1/1     Running   0          15s
web-<hash>-<hash>      1/1     Running   0          15s
web-<hash>-<hash>      1/1     Running   0          15s
```

Kubernetes runs the readiness probe on each new pod before marking it `READY`.

## Step 2 — Inspect the Deployment

```bash
kubectl get deployment web
```

Expected output:

```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
web    4/4     4            4           5m
```

`READY 4/4` confirms all four replicas passed the readiness probe and are in
the Service endpoints.

## Step 3 — Scale back down

```bash
kubectl scale deployment/web --replicas=2
```

Kubernetes terminates two pods gracefully:

```bash
kubectl get pods -l app=web
```

Expected output:

```
NAME                   READY   STATUS    RESTARTS   AGE
web-<hash>-<hash>      1/1     Running   0          3m
web-<hash>-<hash>      1/1     Running   0          3m
```

## Checkpoint

You scaled the `web` Deployment up to 4 replicas and back to 2. The Service
automatically updated its endpoint list as pods came and went.

Next: [07 Wrap-up](./07-wrap-up.md)
