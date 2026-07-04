---
title: ConfigMap and env
tier: intermediate
platform: kubernetes
---

# ConfigMap and env

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 02

## Goal

Externalise configuration from the container image into a Kubernetes ConfigMap
and inject it as an environment variable into the `web` Deployment.

## Why

Hard-coding config in an image means a rebuild every time a value changes. A
ConfigMap lets you update values without touching the image — you just
re-apply the manifest.

## Step 1 — Create the ConfigMap

Create `configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
data:
  GREETING: "hello from configmap"
```

Apply it:

```bash
kubectl apply -f configmap.yaml
```

Verify it exists:

```bash
kubectl get configmap web-config
```

Expected output:

```
NAME         DATA   AGE
web-config   1      5s
```

## Step 2 — Reference the ConfigMap from the Deployment

Open `deployment.yaml` and add an `env` block to the container spec so it reads
`GREETING` from `web-config`:

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
```

Apply the updated Deployment:

```bash
kubectl apply -f deployment.yaml
```

## Step 3 — Verify the env var is injected

Once the pod restarts, exec into it and print the variable:

```bash
kubectl exec deploy/web -- printenv GREETING
```

Expected output:

```
hello from configmap
```

## Checkpoint

You now have a running `web` Deployment with `GREETING` sourced from a
ConfigMap. No image rebuild was required — changing the value in `configmap.yaml`
and re-applying is all that's needed.

Next: [03 Probes](./03-probes.md)
