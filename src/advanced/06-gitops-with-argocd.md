---
title: GitOps with ArgoCD
tier: advanced
platform: kubernetes
position: 6
---

# GitOps with ArgoCD

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › GitOps with ArgoCD

**Goal**

Install ArgoCD on kind and point it at a Git repository so the cluster state is declared in Git and automatically reconciled.

**Prerequisites**

- [StatefulSet and PVC](./05-statefulset-and-pvc.md)
- A GitHub/GitLab repository with your Helm chart pushed

## What is GitOps

**GitOps** means:

> The desired cluster state is declared in a Git repository. An operator (ArgoCD) continuously compares the live cluster to the repo and auto-fixes drift.

No one runs `kubectl apply` manually in production — the cluster pulls its config from Git.

## Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl -n argocd wait --for=condition=Ready pods --all --timeout=120s
```

## Access the ArgoCD UI

```bash
# Port-forward the API server
kubectl -n argocd port-forward svc/argocd-server 8080:443 &

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Open `https://localhost:8080` in a browser, login as `admin` with the password above.

## Install the ArgoCD CLI

```bash
brew install argocd

argocd login localhost:8080 --insecure --username admin
```

## Register a cluster

ArgoCD needs access to your cluster:

```bash
argocd cluster add kind-kind
```

## Create an Application

Create `argocd-app.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/web-chart-repo
    path: web-chart
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Apply:

```bash
kubectl apply -f argocd-app.yaml
```

ArgoCD clones the repo, templates the Helm chart, and applies it to the cluster. The UI shows the app as **Synced**.

## Drift detection

Delete a pod manually:

```bash
kubectl delete pod -l app=web-demo
# ArgoCD sees the drift and recreates it within seconds
```

Change an image tag in the Git repo, commit, and push. ArgoCD detects the change and syncs automatically.

## Checkpoint

```bash
argocd app list
# NAME     CLUSTER          NAMESPACE  STATUS  HEALTH
# web-app  https://...      default    Synced  Healthy

argocd app get web-app
# Shows resources, sync status, health
```

**Next:** [Prometheus and Grafana](./07-prometheus-and-grafana.md) — cluster monitoring and dashboards.
