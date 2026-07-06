---
title: Teardown
tier: argo-stack
platform: kubernetes
position: 5
---

# Teardown

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Argo Stack › Teardown

**Goal**

Remove all Argo Stack resources and optionally delete the kind cluster. A clean teardown matches the clean setup — each piece you installed comes out in reverse order.

## Step 1: Remove Argo Events

```bash
kubectl delete namespace argo-events
```

Deleting the namespace removes everything inside it in one shot:

- The **EventBus** (Redis StatefulSet + Service)
- The **EventSource** (`webhook`) and its Service
- The **Sensor** (`webhook-sensor`)
- The RBAC bindings (`operate-workflow-sa`, roles) created in page 02
- All the **Workflows** the Sensor created in page 04 (they live in this namespace)

Verify it is gone:

```bash
kubectl get namespace argo-events
# Error from server (NotFound): namespaces "argo-events" not found
```

The `NotFound` error is the success signal — the namespace no longer exists.

## Step 2: Remove Argo Workflows

```bash
kubectl delete namespace argo
```

This removes the **workflow controller** Deployment and the **argo-server**, plus the `build-pipeline` WorkflowTemplate (it is cluster-scoped by default for templates, but the controller + server live in this namespace).

Optionally remove the Argo Workflows CRDs for a fully clean slate:

```bash
kubectl delete crd workflowtemplates.argoproj.io workflows.argoproj.io
```

Skip the CRD deletion if you plan to reinstall Argo Workflows soon — keeping them preserves any global template state and saves a reinstall cycle.

## Step 3: Remove ArgoCD (optional)

If you want to keep ArgoCD for GitOps on other projects, **skip this step** — ArgoCD is independent of the Events/Workflows stack and will keep running fine.

Otherwise:

```bash
kubectl delete namespace argocd
```

For the full ArgoCD teardown walkthrough (including CRDs and the `argocd` CLI config), see [GitOps with ArgoCD](/advanced/06-gitops-with-argocd).

## Step 4: Delete the kind cluster

If you're done with Kubernetes entirely for now:

```bash
kind delete cluster
```

This removes everything — the control-plane container, the containerd runtime, the Docker network, and every resource across all namespaces. After this, `kubectl get nodes` returns a connection error, which is the expected tidy end state.

## Confirm it is gone

```bash
kubectl get nodes   # error / no cluster — expected
```

You should see an error like `Unable to connect to the server` — that means the cluster is fully removed.

## What you learned

Over the full Argo Stack section you built and tore down:

- **Argo Events:** webhook EventSource → EventBus (Redis) → Sensor with a trigger
- **Argo Workflows:** a `WorkflowTemplate` with sequential steps and parameter passing between them
- **Pipeline:** a Sensor `k8s` trigger creates `Workflow` resources automatically from the template on every webhook event
- **Event-driven GitOps:** a webhook triggers the build pipeline; in production ArgoCD handles the deploy side

The shape you built locally — `push → event → workflow → deploy` — is the same shape production CI/CD systems run, just with GitHub webhooks instead of curl, real image builds instead of `echo`, and ArgoCD syncs instead of simulated deploys.

## Where to go next

- [Argo Events docs](https://argoproj.github.io/argo-events/) — official documentation, including the full list of EventSource types (S3, Kafka, calendar, GitHub, …)
- [Argo Workflows docs](https://argoproj.github.io/argo-workflows/) — official documentation, covering DAGs, artifacts, retries, and conditional steps
- [GitOps with ArgoCD](/advanced/06-gitops-with-argocd) — revisit the ArgoCD tutorial that the pipeline's deploy step simulated
- **Production patterns to explore next:**
  - GitHub webhooks instead of `curl` (a real EventSource)
  - kaniko for building container images inside a workflow step
  - ArgoCD Image Updater for automatic rollouts when a new image tag is pushed

This is the final page of the Argo Stack section — you're done.
