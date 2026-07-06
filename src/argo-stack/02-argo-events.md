---
title: Argo Events
tier: argo-stack
platform: kubernetes
position: 2
---

# Argo Events

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Argo Stack › Argo Events

**Goal**

Install Argo Events, create an EventBus, a webhook EventSource, and a Sensor that receives events. By the end, sending a curl webhook shows the event flowing through the system.

**Prerequisites**

- [Argo Stack overview](/argo-stack/)
- A kind cluster running ([Beginner / Local Cluster](/beginner/02-local-cluster))
- kubectl configured and pointing at your kind cluster

## Step 1: Install Argo Events

Create the namespace and apply the install manifest:

```bash
kubectl create namespace argo-events
kubectl apply -n argo-events -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install.yaml

kubectl -n argo-events wait --for=condition=Ready pods --all --timeout=120s
```

This installs two controllers:

- **Argo Events controller** — reconciles `EventSource`, `Sensor`, and `EventBus` resources
- **EventBus controller** — provisions the event transport (Redis by default)

Verify the pods are running:

```bash
kubectl get pods -n argo-events
# NAME                                       READY   STATUS    RESTARTS   AGE
# controller-manager-xxxxx-xxxxx              1/1     Running   0          1m
```

## Step 2: Create EventBus

The **EventBus** is the transport layer that carries events between EventSources and Sensors. Argo Events provisions a Redis instance per EventBus.

Save as `eventbus.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
  namespace: argo-events
spec:
  redis:
    containerTemplate:
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 256Mi
```

Apply:

```bash
kubectl apply -f eventbus.yaml
kubectl get eventbus -n argo-events
# NAME      STATUS
# default   Active
```

## Step 3: Create EventSource (webhook)

An **EventSource** defines where events come from. We'll create a webhook listener that accepts HTTP POST requests.

Save as `event-source.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook
  namespace: argo-events
spec:
  service:
    ports:
      - port: 12000
        targetPort: 12000
  webhook:
    example:
      port: "12000"
      endpoint: /push
      method: POST
```

Apply and port-forward the service:

```bash
kubectl apply -f event-source.yaml
kubectl get eventsource -n argo-events
# NAME      AGE
# webhook   10s

kubectl port-forward -n argo-events svc/webhook-eventsource-svc 12000:12000 &
```

## Step 4: Test the webhook

Send a test event:

```bash
curl -X POST http://localhost:12000/push \
  -d '{"message":"hello argo"}' \
  -H "Content-Type: application/json"
```

Expected response: `202 Accepted` or `200 OK`.

Check the EventSource logs:

```bash
kubectl logs -n argo-events -l eventsource=webhook --tail=20
```

You should see the payload received and published onto the EventBus.

## Step 5: Create RBAC for the Sensor

The Sensor needs a ServiceAccount with permission to create Workflows — we'll wire that trigger in the [Pipeline](/argo-stack/04-pipeline) page. Create the RBAC now so it's ready.

Save as `rbac.yaml`:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: operate-workflow-sa
  namespace: argo-events
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: operate-workflow-role
  namespace: argo-events
rules:
  - apiGroups: ["argoproj.io"]
    resources: ["workflows", "workflowtemplates"]
    verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: operate-workflow-binding
  namespace: argo-events
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: operate-workflow-role
subjects:
  - kind: ServiceAccount
    name: operate-workflow-sa
    namespace: argo-events
```

Apply:

```bash
kubectl apply -f rbac.yaml
```

## Step 6: Create Sensor

A **Sensor** watches the EventBus for events matching its dependencies and fires triggers. For now we'll log the payload — we'll wire it to a Workflow trigger in the [Pipeline](/argo-stack/04-pipeline) page.

Save as `sensor.yaml`:

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
        name: log-trigger
        log:
          intervalSeconds: 1
```

Apply:

```bash
kubectl apply -f sensor.yaml
kubectl get sensor -n argo-events
# NAME             AGE
# webhook-sensor   10s
```

## Step 7: Test the full event flow

Send another webhook:

```bash
curl -X POST http://localhost:12000/push \
  -d '{"message":"hello argo again"}' \
  -H "Content-Type: application/json"
```

Check the Sensor logs:

```bash
kubectl logs -n argo-events -l sensor=webhook-sensor --tail=20
```

You should see the event payload logged by the Sensor's log trigger.

## Checkpoint

You built three resources and a working event pipeline:

- **EventBus** (`default`) — Redis-backed transport
- **EventSource** (`webhook`) — HTTP listener on port 12000
- **Sensor** (`webhook-sensor`) — receives events and logs them

Confirm the flow works:

```
curl → EventSource → EventBus → Sensor (log)
```

If the Sensor logs show your payload, the event pipeline is healthy and ready to trigger Workflows.

**Next:** [Continue to Argo Workflows →](/argo-stack/03-argo-workflows)
