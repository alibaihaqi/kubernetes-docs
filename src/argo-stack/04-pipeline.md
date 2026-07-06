---
title: Pipeline
tier: argo-stack
platform: kubernetes
position: 4
---

# Pipeline

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Argo Stack › Pipeline

**Goal**

Wire the Argo Events Sensor to trigger the Argo Workflows WorkflowTemplate automatically. Send one curl command and watch the full pipeline run: webhook → event → workflow. This is the capstone — everything from pages 02 and 03 comes together.

**Prerequisites**

- [Argo Events installed](/argo-stack/02-argo-events) (EventBus, EventSource, and the `webhook-sensor` Sensor with its `log` trigger)
- [Argo Workflows installed with the `build-pipeline` WorkflowTemplate](/argo-stack/03-argo-workflows) (the reusable template is what the Sensor will launch)
- [GitOps with ArgoCD](/advanced/06-gitops-with-argocd) — optional, only for the deploy-sync reference in Step 5

## Step 1: The wired pipeline (overview)

Up to now the two Argo halves have run in parallel: Events fired into a `log` trigger that printed a line, and Workflows ran only when you typed `argo submit`. This page connects them so an event creates a workflow.

```
curl (webhook)
  → EventSource (:12000/push)
  → EventBus (Redis)
  → Sensor (detects payload)
  → creates a Workflow from build-pipeline template
  → Workflow runs: build-step → deploy-step
```

The only change from page 02 is the **Sensor trigger**. Everything upstream (EventSource, EventBus) and downstream (WorkflowTemplate, the steps) is reused verbatim. We swap the Sensor's `log` trigger for a `workflow` trigger — a Kubernetes resource trigger that creates a `Workflow` object on each event.

## Step 2: Update the Sensor to trigger a Workflow

The Sensor's `triggers` section changes from `log` (just prints) to `k8s` (creates a Kubernetes resource). The `k8s` trigger type lets a Sensor create any Kubernetes object — here, a `Workflow` referencing our `build-pipeline` template.

Save as `sensor-pipeline.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: webhook-sensor
  namespace: argo-events
spec:
  template:
    serviceAccountName: operate-workflow-sa
  dependencies:
    - name: webhook-dep
      eventSourceName: webhook
      eventName: example
  triggers:
    - template:
        name: workflow-trigger
        k8s:
          group: argoproj.io
          version: v1alpha1
          resource: workflows
          operation: create
          source:
            resource:
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: webhook-build-
                namespace: argo-events
              spec:
                workflowTemplateRef:
                  name: build-pipeline
                arguments:
                  parameters:
                    - name: message
                      value: "from-webhook"
          parameters:
            - src:
                dependencyName: webhook-dep
              dest: spec.arguments.parameters.0.value
```

Key changes from page 02's sensor:

- **`k8s` trigger type** (instead of `log`) — tells the Sensor to create a Kubernetes resource rather than just log
- **`resource` block** defines the `Workflow` to create; `workflowTemplateRef.name: build-pipeline` points at the template from page 03
- **`generateName: webhook-build-`** — every trigger creates a uniquely-named workflow (`webhook-build-abc123`, `webhook-build-def456`, …) because the Sensor will fire repeatedly
- **`parameters` block** maps the webhook payload (`dependencyName: webhook-dep`) into the workflow's first argument (`spec.arguments.parameters.0.value`, i.e. the `message` parameter)

Apply the updated sensor:

```bash
kubectl apply -f sensor-pipeline.yaml
kubectl get sensor -n argo-events
# NAME             AGE
# webhook-sensor   2m
```

The Sensor picks up the new trigger config without a restart — the next event will create a workflow.

## Step 3: End-to-end test

Make sure the EventSource port-forward from page 02 is still running:

```bash
kubectl port-forward -n argo-events svc/webhook-eventsource-svc 12000:12000 &
```

Send the trigger:

```bash
curl -X POST http://localhost:12000/push \
  -d '{"message":"pipeline-test"}' \
  -H "Content-Type: application/json"
```

Expected: a `200` or `202` response from the EventSource.

Immediately check for the auto-created workflow:

```bash
argo list -n argo-events
# NAME                  STATUS      AGE   DURATION   PRIORITY
# webhook-build-XXXXX   Running     3s    3s         0
```

You should see a `webhook-build-XXXXX` workflow that you never typed `argo submit` for — the Sensor created it. Watch it run to completion:

```bash
argo watch -n argo-events @latest
```

Pull the combined logs:

```bash
argo logs -n argo-events @latest
```

Expected output:

```
build-step: Building... received: pipeline-test
deploy-step: Deploying... done!
```

Both messages prove the pipeline executed end-to-end from one curl.

## Step 4: Verify the parameter flowed through

The curl payload `{"message":"pipeline-test"}` was extracted by the Sensor's `parameters` block and injected into the Workflow's `message` parameter. The chain is:

```
curl body {"message":"pipeline-test"}
  → Sensor parameters: src.dependencyName=webhook-dep, dest=spec.arguments.parameters.0.value
  → Workflow spec.arguments.parameters[message] = "pipeline-test"
  → Template: {{workflow.parameters.message}} → build-step {{inputs.parameters.message}}
  → echo "Building... received: pipeline-test"
```

That the build step printed `pipeline-test` (not the template's default `default`) is the proof: the full event-to-workflow parameter passing works. Change the curl body and the printed value changes on the next run.

## Step 5: Where ArgoCD fits (reference)

In a production pipeline, the deploy-step wouldn't just `echo "Deploying... done!"` — it would call ArgoCD to sync the new manifest to the cluster:

```bash
argocd app sync my-app --server argocd-server.argocd.svc.cluster.local:443
```

This requires three things this tutorial skips:

- **ArgoCD CLI in the container** — bake `argocd` into the deploy image
- **Network access** — the workflow pod must reach `argocd-server.argocd.svc.cluster.local`
- **An auth token** — RBAC-bound, stored as a Kubernetes Secret and injected as an env var

For this tutorial the deploy step simulates the sync with an echo. The full ArgoCD setup lives in [GitOps with ArgoCD](/advanced/06-gitops-with-argocd).

In production the whole shape is the same, just with real components:

| Tutorial | Production |
|----------|-----------|
| `curl` to webhook | GitHub push event |
| `echo "Building..."` | kaniko building a real container image |
| `echo "Deploying..."` | ArgoCD sync of the new image tag |
| manual `argo watch` | ArgoCD UI + Image Updater |

## Step 6: Send multiple triggers

Send two or three more curl commands with different messages:

```bash
curl -X POST http://localhost:12000/push -d '{"message":"second"}'  -H "Content-Type: application/json"
curl -X POST http://localhost:12000/push -d '{"message":"third"}'   -H "Content-Type: application/json"
```

List the workflows:

```bash
argo list -n argo-events
# NAME                  STATUS      AGE   DURATION   PRIORITY
# webhook-build-aaa11   Succeeded   10s   4s         0
# webhook-build-bbb22   Succeeded   8s    4s         0
# webhook-build-ccc33   Running     2s    2s         0
```

Each trigger created its own `webhook-build-*` workflow because the Sensor used `generateName`. Each ran the full build → deploy sequence independently. This is the pipeline handling repeated triggers — the same shape a GitHub webhook produces on every push.

## Checkpoint

You now have:

- **Full pipeline working:** curl → EventSource → EventBus → Sensor → Workflow → build + deploy steps
- **The Sensor automatically creates a new Workflow on every webhook event** — no manual `argo submit`
- **Parameter passing from webhook payload to Workflow is confirmed** — change the curl body, the printed message changes

## What you learned

- **Argo Events:** webhook ingestion + EventBus transport + Sensor triggers
- **Argo Workflows:** WorkflowTemplate + sequential steps + parameter passing
- **Pipeline wiring:** a Sensor `k8s` trigger creates Workflow resources from templates, with `parameters` plumbing the event payload into workflow arguments
- **How this maps to real CI/CD:** GitHub → Events → Workflow (build) → ArgoCD (deploy)

**Next:** [Continue to Teardown →](/argo-stack/05-teardown)
