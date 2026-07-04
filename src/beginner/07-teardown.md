---
title: Teardown
---

# Teardown

When you're done, remove the resources and turn off the local cluster so it
stops consuming CPU and memory.

## Delete the workload

```bash
kubectl delete -f service.yaml -f deployment.yaml
kubectl delete pod web --ignore-not-found   # if the page-03 Pod still exists
```

## Delete the cluster

```bash
kind delete cluster --name learn
```

## Confirm it is gone

```bash
kubectl get nodes   # error / no cluster — expected
```

You should see an error like `Unable to connect to the server` — that means
the cluster is fully removed.

Leaving the cluster running is fine while you experiment, but delete it when you
finish — a stopped cluster is the tidy end state for this tier.

---

You have completed the Kubernetes beginner tier. You ran a Pod, promoted it to a
managed Deployment, exposed it with a Service, and reached the app from your
laptop — all on a local cluster that cost nothing to run.
