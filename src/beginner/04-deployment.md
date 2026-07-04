---
title: A Deployment
---

# A Deployment

A Deployment manages a replicated set of Pods and recreates them if they crash.
Instead of declaring a single Pod you declare a desired replica count and a Pod
template; the Deployment controller ensures that many Pods always exist.

## Remove the standalone Pod first

The standalone Pod from page 03 has the same name (`web`) as the Pods the
Deployment will create. Delete it to avoid a name clash:

```bash
kubectl delete pod web
```

## Create `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
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
```

## Apply and verify

```bash
kubectl apply -f deployment.yaml
kubectl get pods -l app=web   # two managed pods, Running
```

Both Pods carry the label `app: web` — the selector the Service (next page)
will use to find them.

> **Checkpoint:** `kubectl get pods -l app=web` shows two Pods with status `Running`.

Next: [05 A Service](./05-service.md)
