---
title: Logging with Loki
tier: advanced
platform: kubernetes
position: 8
---

# Logging with Loki

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › Logging with Loki

**Goal**

Deploy the Loki stack (Loki + Promtail) for log aggregation, query logs via LogQL in Grafana, and add structured JSON logging to the web app.

**Prerequisites**

- [Prometheus and Grafana](./07-prometheus-and-grafana.md)

## Why Loki

Traditional logging (ELK) indexes the _content_ of every log line, which is expensive. Loki indexes only _metadata_ (pod, namespace, container) and stores the raw log in compressed objects. It integrates natively with Grafana.

## Install Loki + Promtail

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Minimal Loki (single-binary, no S3/GCS)
helm install loki grafana/loki \
  --create-namespace \
  --namespace logging \
  --set deploymentMode=SingleBinary \
  --set loki.commonConfig.replication_factor=1

# Promtail (log collector, runs as DaemonSet on every node)
helm install promtail grafana/promtail \
  --namespace logging \
  --set config.lokiAddress=http://loki:3100/loki/api/v1/push
```

Wait for pods:

```bash
kubectl -n logging get pods
# NAME                          READY   STATUS
# loki-0                         1/1     Running
# promtail-7d9f6c8b9b-abc       1/1     Running
# promtail-7d9f6c8b9b-def       1/1     Running
```

## Add Loki as a Grafana datasource

```bash
# Get the Loki service URL
kubectl -n logging get svc loki
# NAME   TYPE        CLUSTER-IP   PORT(S)
# loki   ClusterIP   10.96.0.5   3100/TCP
```

In Grafana web UI:
1. **Connections** → **Data sources** → **Add**
2. Select **Loki**
3. URL: `http://loki.logging:3100`
4. **Save & Test**

## Query logs with LogQL

In Grafana's Explore view (Loki data source):

```
{app="web-demo"} |= "error"
```

This returns all log lines containing "error" from pods with label `app=web-demo`.

More LogQL examples:

```
# Errors per minute
rate({app="web-demo"} |= "error"[5m])

# Count by level
sum by (level) (count_over_time({namespace="default"} | json [1m]))
```

## Structured JSON logging

Update the web app to emit structured JSON logs:

```yaml
# In the Deployment's container env:
env:
  - name: LOG_FORMAT
    value: json
```

Or for nginx, add a ConfigMap with JSON log format:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-log-config
data:
  log_format.json: |
    log_format json escape=json
      '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"method":"$request_method",'
        '"path":"$request_uri",'
        '"status":$status,'
        '"body_bytes":$body_bytes_sent,'
        '"referer":"$http_referer",'
        '"user_agent":"$http_user_agent"'
      '}';
```

## Checkpoint

```bash
kubectl -n logging port-forward svc/loki 3100:3100 &
curl http://localhost:3100/ready
# → ready

# In Grafana: Explore → Loki → {app="web-demo"}
# Shows log lines with timestamps in real-time
```

**Next:** [RBAC and security](./09-rbac-and-security.md) — fine-grained access control and Pod Security Standards.
