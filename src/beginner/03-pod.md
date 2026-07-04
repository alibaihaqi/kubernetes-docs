---
title: A Pod
---

# A Pod

A Pod is the smallest deployable unit in Kubernetes. It wraps one or more
containers that share a network namespace and storage. In practice most Pods
hold one container.

## Create `pod.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      ports:
        - containerPort: 80
```

## Apply and inspect

```bash
kubectl apply -f pod.yaml
kubectl get pods            # web   1/1   Running
kubectl describe pod web    # events, image, node
```

`1/1` means one container running out of one desired. The `describe` output
shows which node the Pod landed on, what image was pulled, and any events such
as image pulls or scheduling decisions.

> **Checkpoint:** `kubectl get pods` shows `web` with status `Running`.

Next: [04 A Deployment](./04-deployment.md)
