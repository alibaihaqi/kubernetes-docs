---
title: Rolling update
tier: intermediate
platform: kubernetes
---

# Rolling update

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 05

## Goal

Change the `web` Deployment's image tag from `nginx:1.27` to `nginx:1.27.1` and
watch Kubernetes replace pods gradually so the app stays available throughout.

## Why

Without a rolling update strategy, changing the image would require taking the
old pods down and bringing new ones up — causing downtime. Kubernetes
`RollingUpdate` (the default) brings new pods up before removing old ones, so
there is always at least one healthy pod serving traffic.

## Step 1 — Update the image tag in deployment.yaml

Open `deployment.yaml` and change the `image` line:

```yaml
          image: nginx:1.27.1
```

The full container spec with all additions so far:

```yaml
      containers:
        - name: nginx
          image: nginx:1.27.1
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

## Step 2 — Watch the rollout

```bash
kubectl rollout status deployment/web
```

Kubernetes prints a progress line for each pod it replaces and exits with code 0
when the rollout completes:

```
Waiting for deployment "web" rollout to finish: 0 of 1 updated replicas are available...
deployment "web" successfully rolled out
```

## Step 3 — Check rollout history

```bash
kubectl rollout history deployment/web
```

Expected output:

```
deployment.apps/web
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

Revision 1 is the original `nginx:1.27` image; revision 2 is `nginx:1.27.1`.

## Step 4 — Roll back if needed

If something goes wrong, undo the last rollout:

```bash
kubectl rollout undo deployment/web
```

Kubernetes restores revision 1 using the same rolling strategy.

## Checkpoint

You updated the image tag and Kubernetes replaced the pod without downtime. The
rollout history gives you a safety net to undo.

Next: [06 Scaling](./06-scaling.md)
