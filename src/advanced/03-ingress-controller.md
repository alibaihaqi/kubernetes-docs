---
title: Ingress controller
tier: advanced
platform: kubernetes
position: 3
---

# Ingress controller

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › Ingress controller

**Goal**

Install the nginx-ingress controller on kind and route external traffic to the Helm-deployed web app via an Ingress resource.

**Prerequisites**

- [Package with Helm](./02-package-with-helm.md)
- `web-demo` chart installed

## Why an Ingress controller

A `Service` of type `ClusterIP` is only reachable inside the cluster. `NodePort` and `LoadBalancer` work, but they lack:
- Host and path-based routing
- TLS termination
- Rate limiting, auth, and header manipulation

An **Ingress controller** (e.g., nginx-ingress) is a reverse proxy running inside the cluster. You define an `Ingress` resource and the controller programs itself to match.

## Install nginx-ingress on kind

```bash
# Via Helm:
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace \
  --namespace ingress-nginx \
  --set controller.hostNetwork=true
```

On kind, `hostNetwork=true` binds the controller to the node's IP directly (no `LoadBalancer` needed).

## Verify the controller

```bash
kubectl -n ingress-nginx get pods
# NAME                                        READY   STATUS
# ingress-nginx-controller-5d8849f7b7-x2k9f   1/1     Running

kubectl -n ingress-nginx get svc
# The controller listens on node ports 80/80, 443/443
```

## Create an Ingress resource

Save as `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
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

## Test the Ingress

```bash
# Add host mapping (kind node IP)
kubectl get nodes -o wide
# INTERNAL-IP may be a Docker bridge IP, e.g., 172.18.0.2

# /etc/hosts entry:
echo "172.18.0.2 web.local" | sudo tee -a /etc/hosts

# Test
curl http://web.local
# nginx welcome page (served through the ingress controller)
```

## Port-forward for Mac/Windows

On Docker Desktop for Mac, kind nodes aren't directly reachable. Use a port-forward:

```bash
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80 &

curl http://localhost:8080
# → web app response
```

## Checkpoint

```bash
curl http://web.local  # or http://localhost:8080
# → nginx web page, served through Ingress
kubectl get ingress
# NAME          HOSTS       ADDRESS   PORTS   AGE
# web-ingress   web.local             80      30s
```

**Next:** [cert-manager TLS](./04-cert-manager-tls.md) — automate TLS certificates for the Ingress.
