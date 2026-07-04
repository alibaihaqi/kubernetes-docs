---
title: Resource requests and limits
tier: intermediate
platform: kubernetes
---

# Resource requests and limits

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 04

## Goal

Add CPU and memory `requests` and `limits` to the `web` container so the
Kubernetes scheduler can place it correctly and it cannot consume unbounded
resources.

## Why

- **Requests** — the amount of CPU/memory the pod is _guaranteed_. The scheduler
  uses this to decide which node can host the pod.
- **Limits** — the maximum the container is allowed to use. A container that
  exceeds its memory limit is OOM-killed; one that exceeds its CPU limit is
  throttled.

Without requests, the scheduler treats every pod as if it needs zero resources
and may overcommit nodes. Without limits, one runaway container can starve its
neighbours.

## Step 1 — Add resources to deployment.yaml

Open `deployment.yaml` and add a `resources` block to the container spec (after
the probes added in the previous page):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
          env:
            - name: GREETING
              valueFrom:
                configMapKeyRef:
                  name: web-config
                  key: GREETING
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 2
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              cpu: "50m"
              memory: "64Mi"
            limits:
              cpu: "200m"
              memory: "128Mi"
```

Apply:

```bash
kubectl apply -f deployment.yaml
```

## Step 2 — Verify

Describe a pod to confirm the limits appear:

```bash
kubectl describe pod -l app=web | grep -A4 Limits
```

Expected output:

```
    Limits:
      cpu:     200m
      memory:  128Mi
    Requests:
      cpu:     50m
      memory:  64Mi
```

## Checkpoint

The `web` Deployment now has resource budgets. The scheduler places pods on
nodes that have at least 50m CPU and 64Mi memory free, and containers that try
to exceed 128Mi memory will be restarted.

Next: [05 Rolling update](./05-rolling-update.md)
