---
title: Argo Workflows
tier: argo-stack
platform: kubernetes
position: 3
---

# Argo Workflows

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Argo Stack › Argo Workflows

**Goal**

Install Argo Workflows, understand the `WorkflowTemplate` structure, create a build-pipeline template, and submit it manually. By the end, you can run workflows that simulate a CI build pipeline.

**Prerequisites**

- [Argo Stack overview](/argo-stack/)
- A kind cluster running ([Beginner / Local Cluster](/beginner/02-local-cluster))
- [Argo Events installed](/argo-stack/02-argo-events) (EventBus, EventSource, Sensor, and the `operate-workflow-sa` ServiceAccount already exist)

## Step 1: Install Argo Workflows

Create the namespace and apply the install manifest:

```bash
kubectl create namespace argo
kubectl apply -n argo -f https://raw.githubusercontent.com/argoproj/argo-workflows/stable/manifests/install.yaml

kubectl -n argo wait --for=condition=Ready pods --all --timeout=180s
```

This installs two components:

- **workflow-controller** — watches `Workflow` resources and spins up the pods for each step
- **argo-server** — provides the REST API and the web UI

Verify the pods are running:

```bash
kubectl get pods -n argo
# NAME                                   READY   STATUS    RESTARTS   AGE
# argo-server-xxxxx-xxxxx                1/1     Running   0          1m
# workflow-controller-xxxxx-xxxxx        1/1     Running   0          1m
```

## Step 2: Install the Argo CLI

The CLI makes it easy to submit and watch workflows from your terminal.

macOS:

```bash
brew install argo
```

Linux:

```bash
# Pick the release for your architecture from:
# https://github.com/argoproj/argo-workflows/releases
curl -sLO https://github.com/argoproj/argo-workflows/releases/latest/download/argo-linux-amd64.gz
gunzip argo-linux-amd64.gz
chmod +x argo-linux-amd64
sudo mv argo-linux-amd64 /usr/local/bin/argo
```

Verify:

```bash
argo version
```

## Step 3: Workflow concepts

A few terms make the rest of this page readable:

- **Template** — a reusable unit of work: a container image plus the commands and arguments to run inside it
- **WorkflowTemplate** — a named, cluster-visible collection of templates that can be submitted any number of times
- **Workflow** — a single execution (a "run") of a template; each run gets its own pods and its own status
- **Steps** — sequential or parallel groups of templates; we use sequential groups so each step waits for the previous one to succeed
- **DAG** — an alternative to Steps where you declare dependencies between tasks; useful for fan-out/fan-in, but we won't build one here

## Step 4: Create a WorkflowTemplate

This template simulates a build pipeline with two sequential steps: **build** then **deploy**. It accepts a single `message` parameter so a caller can pass context (an event payload in the next page, a manual value now).

Save as `workflow-template.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: build-pipeline
  namespace: argo-events
spec:
  serviceAccountName: operate-workflow-sa
  entrypoint: main
  arguments:
    parameters:
      - name: message
        value: "default"
  templates:
    - name: main
      steps:
        - - name: build
            template: build-step
            arguments:
              parameters:
                - name: message
                  value: "{{workflow.parameters.message}}"
        - - name: deploy
            template: deploy-step
    - name: build-step
      inputs:
        parameters:
          - name: message
      container:
        image: alpine:3.18
        command: [echo]
        args: ["Building... received: {{inputs.parameters.message}}"]
    - name: deploy-step
      container:
        image: alpine:3.18
        command: [echo]
        args: ["Deploying... done!"]
```

Key fields:

- `entrypoint: main` — when the workflow runs, start at the `main` template
- `arguments.parameters` — workflow-level inputs; `message` defaults to `"default"` but can be overridden at submit time
- `steps` — the double dash `- -` introduces a **sequential group**: each inner list runs in order, so `deploy` only starts after `build` succeeds
- `{{workflow.parameters.message}}` — Argo interpolation that forwards the workflow-level parameter down into the `build-step` template's own input

Apply it:

```bash
kubectl apply -f workflow-template.yaml
kubectl get workflowtemplate -n argo-events
# NAME             AGE
# build-pipeline   10s
```

## Step 5: Submit a workflow manually

Port-forward the Argo UI so you can watch the run in the browser:

```bash
kubectl port-forward -n argo svc/argo-server 2746:2746 &
```

Open the UI at `https://localhost:2746` and accept the self-signed certificate warning.

Submit a run from the template via the CLI, passing a value for `message`:

```bash
argo submit -n argo-events \
  --from workflowtemplate/build-pipeline \
  -p message="manual-test"
```

List the workflows in the namespace:

```bash
argo list -n argo-events
# NAME                STATUS      AGE   DURATION   PRIORITY
# build-pipeline-...  Running     5s    5s         0
```

Watch the most recent workflow until it finishes:

```bash
argo watch -n argo-events @latest
```

Pull the combined logs:

```bash
argo logs -n argo-events @latest
```

## Step 6: Understand the output

The workflow-controller creates **two pods, one at a time**:

1. A `build-step` pod runs `echo` and prints the message you passed through. Because the parameter flowed from `argo submit -p` into `workflow.parameters.message` and then into `inputs.parameters.message`, the output is:

   ```
   Building... received: manual-test
   ```

2. Only after `build` succeeds does the `deploy-step` pod run and print:

   ```
   Deploying... done!
   ```

In the UI you'll see the two steps appear sequentially with green checkmarks, and the `argo logs` output shows both messages in order. If `build-step` had failed, `deploy-step` would never start — that's the sequential guarantee.

## Checkpoint

You now have:

- **Argo Workflows** installed in the `argo` namespace (controller + server)
- **`build-pipeline` WorkflowTemplate** in `argo-events`, parameterized and reusable
- A **successful manual run** that executed build → deploy in order

The key idea to carry forward: **the template is reusable**. You just submitted it by hand with `argo submit`; in the [Pipeline](/argo-stack/04-pipeline) page the Sensor will trigger the exact same template automatically whenever a webhook event arrives.

**Next:** [Continue to Pipeline →](/argo-stack/04-pipeline)
