---
title: Wrap-up
tier: intermediate
platform: kubernetes
---

# Wrap-up

[Hub](https://alibaihaqi.github.io/learning-docs/) › [Kubernetes](./) › 07

## What you built

You took the beginner `web` Deployment from "it runs" to "it runs well":

| Page | Change | Effect |
|---|---|---|
| 02 ConfigMap | `GREETING` in `web-config` | Config without image rebuild |
| 03 Probes | `readinessProbe` + `livenessProbe` | Traffic routing + auto-restart |
| 04 Resources | `requests` + `limits` | Scheduler accuracy + OOM protection |
| 05 Rolling update | `nginx:1.27` → `nginx:1.27.1` | Zero-downtime image change |
| 06 Scaling | 1 → 4 → 2 replicas | Redundancy + load balancing |

Each addition is independent. In a real cluster you'd apply all of them
together from the start — this tier walked through them one at a time to make
each concept visible.

## Tear down

When you're done experimenting, turn off the local cluster. This is the same
teardown as the beginner tier:

```bash
kubectl delete -f service.yaml -f deployment.yaml -f configmap.yaml
kind delete cluster --name learn
```

Confirm the cluster is gone:

```bash
kubectl get nodes   # error / no cluster — expected
```

## Next steps

- Explore **Horizontal Pod Autoscaler** (`kubectl autoscale`) to scale based on
  CPU load rather than a fixed replica count.
- Try **Ingress** to expose multiple Services through a single load-balancer
  instead of port-forward.
- Look at **Namespaces** to isolate workloads on the same cluster.
