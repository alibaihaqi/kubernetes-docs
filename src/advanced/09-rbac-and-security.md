---
title: RBAC and security
tier: advanced
platform: kubernetes
position: 9
---

# RBAC and security

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › RBAC and security

**Goal**

Apply Kubernetes RBAC to restrict access, enforce Pod Security Standards, and run containers as non-root.

**Prerequisites**

- [Logging with Loki](./08-logging-with-loki.md)

## Why RBAC

By default, any pod can call the Kubernetes API and read secrets in any namespace. RBAC (Role-Based Access Control) enforces least privilege:

- **Role** — defines what actions are allowed on which resources (in a namespace)
- **ClusterRole** — same, but cluster-scoped
- **RoleBinding** — binds a Role to a user, group, or ServiceAccount
- **ClusterRoleBinding** — binds a ClusterRole cluster-wide

## ServiceAccount for the web app

Pod → ServiceAccount → RoleBinding → Role.

Create `rbac.yaml`:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: web-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: web-role
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: web-role-binding
subjects:
  - kind: ServiceAccount
    name: web-sa
roleRef:
  kind: Role
  name: web-role
  apiGroup: rbac.authorization.k8s.io
```

Update the Deployment to use the ServiceAccount:

```yaml
spec:
  template:
    spec:
      serviceAccountName: web-sa
```

## Pod Security Standards

Kubernetes defines three levels:

| Standard | Behavior |
|----------|----------|
| **Privileged** | No restrictions (the default, but avoid) |
| **Baseline** | Prevents known privilege escalations |
| **Restricted** | Full hardening — no root, no host network, no capabilities |

Enforce via namespace label:

```bash
kubectl label namespace default pod-security.kubernetes.io/enforce=restricted
```

Now any pod that violates restricted policy (e.g., runs as root) will be rejected. To comply, add a `securityContext` to the Deployment:

```yaml
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 101
        runAsGroup: 101
        fsGroup: 101
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: web
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
            readOnlyRootFilesystem: true
```

## NetworkPolicy

Restrict pod-to-pod communication by default:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

Then allow specific traffic:

```yaml
kind: NetworkPolicy
metadata:
  name: allow-web-ingress
spec:
  podSelector:
    matchLabels:
      app: web-demo
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - port: 80
```

## Checkpoint

```bash
kubectl auth can-i get configmaps --as system:serviceaccount:default:web-sa
# yes

kubectl auth can-i delete pods --as system:serviceaccount:default:web-sa
# no

# Verify restricted policy
kubectl run test --image=nginx --restart=Never
# Error: violates PodSecurity "restricted:latest"
```

**Next:** [Production hardening](./10-production-hardening.md) — PDBs, topology spread, and multi-zone resilience.
