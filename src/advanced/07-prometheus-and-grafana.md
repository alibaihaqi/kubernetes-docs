---
title: Prometheus and Grafana
tier: advanced
platform: kubernetes
position: 7
---

# Prometheus and Grafana

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › Prometheus and Grafana

**Goal**

Install the Prometheus stack (kube-prometheus-stack) with Helm to collect cluster metrics and visualize them in Grafana dashboards.

**Prerequisites**

- [GitOps with ArgoCD](./06-gitops-with-argocd.md)

## Install the kube-prometheus-stack

This chart bundles Prometheus, Alertmanager, Grafana, and node exporters:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --create-namespace \
  --namespace monitoring
```

## Verify

```bash
kubectl -n monitoring get pods
# NAME                                                     READY   STATUS
# alertmanager-monitoring-kube-prometheus-alertmanager-0   2/2     Running
# monitoring-grafana-7d9f6c8b9b-abc                       3/3     Running
# monitoring-kube-prometheus-operator-5d8849f7b7-def      1/1     Running
# monitoring-kube-state-metrics-7d9f6c8b9b-ghi            1/1     Running
# monitoring-prometheus-node-exporter-5d8849f7b7-jkl      1/1     Running
# prometheus-monitoring-kube-prometheus-prometheus-0       2/2     Running

kubectl -n monitoring get svc
# monitoring-grafana       ClusterIP  10.96.0.1    80/TCP
# monitoring-prometheus    ClusterIP  10.96.0.2    9090/TCP
```

## Access Prometheus

```bash
kubectl -n monitoring port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090 &
open http://localhost:9090
```

Query: `rate(http_requests_total[5m])`

## Access Grafana

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80 &

# Get the admin password
kubectl -n monitoring get secret monitoring-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d
# Default: prom-operator
```

Open `http://localhost:3000`, login as `admin`.

Built-in dashboards:
- **Kubernetes / Compute Resources / Cluster** — CPU/memory by namespace
- **Kubernetes / Networking / Cluster** — network I/O
- **Node Exporter / USE Method / Node** — node-level utilization

## Add a custom panel

1. Click **+** → **Dashboard** → **Add visualization**
2. Query: `sum(rate(container_cpu_usage_seconds_total{namespace="default"}[5m])) by (pod)`
3. Save as "CPU by Pod"

## ServiceMonitor for custom apps

To have Prometheus scrape your web app, add a ServiceMonitor:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: web-demo
  endpoints:
    - port: http
      interval: 15s
```

## Checkpoint

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80 &
open http://localhost:3000
# → Grafana login page
# Built-in dashboards show cluster metrics
```

**Next:** [Logging with Loki](./08-logging-with-loki.md) — structured log aggregation.
