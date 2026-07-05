---
title: Production hardening
tier: advanced
platform: kubernetes
position: 10
---

# Production hardening

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › Production hardening

**Goal**

Harden the web app deployment with PodDisruptionBudget, topology spread constraints, horizontal autoscaling, and resource quotas.

**Prerequisites**

- [RBAC and security](./09-rbac-and-security.md)

## PodDisruptionBudget

A PDB ensures that voluntary disruptions (node drain, cluster upgrades) never take all replicas down at once:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web-demo
```

With `minAvailable: 2` and 3 replicas, at most 1 pod can be disrupted at a time. During a node drain, Kubernetes waits for a new pod to become ready before evicting the next.

```bash
kubectl apply -f web-pdb.yaml
kubectl get pdb
# NAME      MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
# web-pdb   2               N/A               1                     10s
```

## Topology Spread Constraints

Spread pods across failure domains so a single node outage doesn't take down the whole app:

```yaml
# In the Deployment spec:
spec:
  template:
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: web-demo
```

`maxSkew: 1` means the scheduler ensures no node has more than 1 extra pod compared to any other node. On a 3-node cluster with 3 replicas, each node gets exactly 1 pod.

## HorizontalPodAutoscaler

Automatically scale replicas based on CPU utilization:

```bash
# Install metrics-server first (required for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# On kind, add --kubelet-insecure-tls flag:
kubectl -n kube-system patch deployment metrics-server \
  --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-demo
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

```bash
kubectl apply -f web-hpa.yaml
kubectl get hpa -w
# NAME      REFERENCE             TARGETS   MINPODS   MAXPODS   REPLICAS
# web-hpa   Deployment/web-demo   0%/70%    3         10        3
```

Generate load to trigger scaling:

```bash
# In another terminal
kubectl run load-generator --image=busybox -- /bin/sh -c \
  "while true; do wget -q -O- http://web-demo-svc; done"

# Watch HPA scale up
kubectl get hpa -w
```

## ResourceQuota

Prevent a namespace from consuming all cluster resources:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: default-quota
spec:
  hard:
    requests.cpu: 4
    requests.memory: 8Gi
    limits.cpu: 8
    limits.memory: 16Gi
    persistentvolumeclaims: 5
    pods: 20
```

## Checkpoint

```bash
kubectl get pdb web-pdb
# MIN AVAILABLE = 2

kubectl get hpa web-hpa
# TARGETS shows CPU utilization

kubectl get resourcequota default-quota
# Hard limits enforced

# Simulate a node drain:
kubectl drain kind-worker --ignore-daemonsets --force
# PDB prevents more than 1 pod from being disrupted at a time
# Evicted pods reschedule on remaining nodes

kubectl uncordon kind-worker  # bring it back
```

**You've completed the Kubernetes Advanced tier.** The single Deployment from Beginner is now a production-shaped cluster with Helm packaging, Ingress + TLS, StatefulSets, GitOps with ArgoCD, Prometheus/Grafana monitoring, Loki logging, RBAC security, and production hardening with PDBs, topology spread, and autoscaling.
