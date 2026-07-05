---
title: Package with Helm
tier: advanced
platform: kubernetes
position: 2
---

# Package with Helm

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › Package with Helm

**Goal**

Create a Helm chart for the intermediate `web` Deployment, Service, and ConfigMap, parameterize with values, and install it on kind.

**Prerequisites**

- [Why Helm](./01-why-helm.md)

## Scaffold the chart

```bash
helm create web-chart
rm -rf web-chart/templates/*  # remove scaffolds
```

## Chart.yaml

`web-chart/Chart.yaml`:

```yaml
apiVersion: v2
name: web-chart
description: A production web app
type: application
version: 0.1.0
appVersion: "1.0"
```

## values.yaml

`web-chart/values.yaml`:

```yaml
replicaCount: 3

image:
  repository: nginx
  tag: stable
  pullPolicy: IfNotPresent

service:
  port: 80

config:
  message: "Hello from Helm!"

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi

probes:
  livenessPath: /
  readinessPath: /
```

## Templates

`web-chart/templates/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  message.txt: {{ .Values.config.message | quote }}
```

`web-chart/templates/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-svc
spec:
  selector:
    app: {{ .Release.Name }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
  type: ClusterIP
```

`web-chart/templates/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
        - name: web
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: 80
              name: http
          envFrom:
            - configMapRef:
                name: {{ .Release.Name }}-config
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          livenessProbe:
            httpGet:
              path: {{ .Values.probes.livenessPath }}
              port: http
          readinessProbe:
            httpGet:
              path: {{ .Values.probes.readinessPath }}
              port: http
```

## Install

```bash
helm install web-demo ./web-chart
# NAME: web-demo
# STATUS: deployed

kubectl get pods -l app=web-demo
# NAME                        READY   STATUS
# web-demo-7d9f6c8b9b-abc     1/1     Running
# web-demo-7d9f6c8b9b-def     1/1     Running
# web-demo-7d9f6c8b9b-ghi     1/1     Running

helm list
# NAME      NAMESPACE  REVISION  UPDATED                 STATUS
# web-demo  default    1         2026-07-05 12:00:00      deployed
```

## Upgrade with new values

```bash
helm upgrade web-demo ./web-chart --set replicaCount=5,config.message="Updated!"
# Watch pods scale up
kubectl get pods -l app=web-demo
```

## Rollback

```bash
helm rollback web-demo 1
# Back to 3 replicas and original message
```

## Checkpoint

```bash
helm install web-demo ./web-chart
# → deployed
curl localhost (after port-forward)
helm rollback web-demo 1  # if you upgraded
helm uninstall web-demo
```

**Next:** [Ingress controller](./03-ingress-controller.md) — expose the app with nginx-ingress on kind.
