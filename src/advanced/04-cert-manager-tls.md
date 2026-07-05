---
title: cert-manager TLS
tier: advanced
platform: kubernetes
position: 4
---

# cert-manager TLS

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › cert-manager TLS

**Goal**

Install cert-manager, create a self-signed ClusterIssuer for local development, and configure the Ingress to terminate TLS.

**Prerequisites**

- [Ingress controller](./03-ingress-controller.md)

## Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.0/cert-manager.yaml

# Wait for pods
kubectl -n cert-manager wait --for=condition=Ready pods --all --timeout=120s
```

## ClusterIssuer (self-signed for local dev)

Create `cluster-issuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
```

A `ClusterIssuer` is cluster-scoped (works for any namespace). For production you would swap `selfSigned` with `acme` (Let's Encrypt):

```yaml
# Production example (do not apply to kind):
# spec:
#   acme:
#     server: https://acme-v02.api.letsencrypt.org/directory
#     email: you@example.com
#     privateKeySecretRef:
#       name: letsencrypt-key
#     solvers:
#       - http01:
#           ingress:
#             class: nginx
```

Apply the self-signed issuer:

```bash
kubectl apply -f cluster-issuer.yaml
```

## Certificate + updated Ingress

Update `ingress.yaml` to request a certificate:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: selfsigned-issuer
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - web.local
      secretName: web-tls
  rules:
    - host: web.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-demo-svc
                port:
                  number: 80
```

Apply:

```bash
kubectl apply -f ingress.yaml
```

## Verify

```bash
kubectl get certificate
# NAME      READY   SECRET    AGE
# web-tls   True    web-tls   10s

kubectl describe certificate web-tls
# Status:
#   Conditions:
#     Message: Certificate is up to date and has not expired

# Test TLS (with -k for self-signed):
curl -k https://web.local
# or
curl -k https://localhost:8080  # via port-forward
# Works with TLS encryption
```

## Checkpoint

```bash
curl -kv https://web.local 2>&1 | grep "SSL certificate verify"
# → self-signed certificate in chain (expected for local dev)
kubectl get certificaterequests
# → Ready=True
```

**Next:** [StatefulSet and PVC](./05-statefulset-and-pvc.md) — deploy PostgreSQL as a StatefulSet with persistent storage.
