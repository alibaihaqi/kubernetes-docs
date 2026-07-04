---
title: A Service
---

# A Service

A Service gives the Pods a stable in-cluster address. Pods are ephemeral — they
get new IP addresses when they restart. A Service has a fixed ClusterIP and
load-balances requests across all Pods whose labels match its selector.

## Create `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
    - port: 8080
      targetPort: 80
```

The Service listens on port `8080` inside the cluster and forwards traffic to
port `80` on each matching Pod (the port nginx listens on).

## Apply and verify

```bash
kubectl apply -f service.yaml
kubectl get service web   # ClusterIP + port 8080
```

The `ClusterIP` column shows the stable virtual IP assigned to this Service.
The `PORT(S)` column shows `8080/TCP`.

> **Checkpoint:** `kubectl get service web` shows a `ClusterIP` address and
> `8080/TCP` in the `PORT(S)` column.

Next: [06 Reach the app](./06-reach-the-app.md)
