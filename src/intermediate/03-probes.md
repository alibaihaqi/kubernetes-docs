---
title: Probes
tier: intermediate
platform: kubernetes
---

# Probes

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 03

## Goal

Add a `readinessProbe` and a `livenessProbe` to the `web` container so
Kubernetes knows when the pod is ready to accept traffic and when it needs to
be restarted.

## Why

Without probes:

- **Readiness** — Kubernetes sends traffic to pods immediately after they start,
  even if the app hasn't finished initialising. Requests during a rollout hit a
  pod that isn't ready yet.
- **Liveness** — If the app deadlocks (process is alive but unresponsive),
  Kubernetes leaves the pod running forever. A liveness probe detects this and
  restarts the container.

## Step 1 — Add probes to deployment.yaml

Open `deployment.yaml` and add `readinessProbe` and `livenessProbe` to the
container spec (after the `env` block added in the previous page):

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
```

Apply:

```bash
kubectl apply -f deployment.yaml
```

## Step 2 — Verify

Watch the pods until the readiness probe passes:

```bash
kubectl get pods -l app=web
```

Expected output once ready:

```
NAME                   READY   STATUS    RESTARTS   AGE
web-<hash>-<hash>      1/1     Running   0          20s
```

`READY 1/1` means the readiness probe has passed and the pod is in the Service
endpoints. Before the probe passes, you'll see `0/1`.

Describe a pod to see the probe configuration:

```bash
kubectl describe pod -l app=web | grep -A10 Liveness
```

## Checkpoint

The `web` Deployment now has both probes. Kubernetes will:

- Hold traffic away from pods until `readinessProbe` passes.
- Restart pods automatically when `livenessProbe` fails.

Next: [04 Resource requests and limits](./04-resources.md)
