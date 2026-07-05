---
title: StatefulSet and PVC
tier: advanced
platform: kubernetes
position: 5
---

# StatefulSet and PVC

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Advanced › StatefulSet and PVC

**Goal**

Deploy PostgreSQL as a StatefulSet with a PersistentVolumeClaim so data survives pod restarts.

**Prerequisites**

- [cert-manager TLS](./04-cert-manager-tls.md)

## Why StatefulSet

A `Deployment` is for stateless apps — all pods are interchangeable. Stateful workloads need:

- **Stable network identity** — each pod has a fixed name (`pg-0`, `pg-1`)
- **Stable storage** — each pod gets its own PersistentVolume that follows it on reschedule
- **Ordered startup** — `pg-0` starts first, then `pg-1`, etc.

`StatefulSet` provides all three.

## PersistentVolume

On kind, create a PVC that provisions from the default storage class:

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pg-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

## StatefulSet

Create `postgres-statefulset.yaml`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:17-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: app
            - name: POSTGRES_PASSWORD
              value: secret
            - name: POSTGRES_DB
              value: appdb
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
              subPath: pgdata
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
            limits:
              cpu: 1
              memory: 512Mi
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
```

`volumeClaimTemplates` creates a unique PVC for each replica. `subPath: pgdata` avoids permission issues with the postgres container's `data` directory.

## Headless Service

StatefulSets need a headless Service (no ClusterIP) for DNS-based pod identity:

```yaml
# postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432
```

## Apply

```bash
kubectl apply -f postgres-service.yaml -f postgres-statefulset.yaml

kubectl get pods -w
# postgres-0  0/1  Init:0/1
# postgres-0  0/1  PodInitializing
# postgres-0  1/1  Running

kubectl get pvc
# NAME               STATUS   VOLUME
# data-postgres-0    Bound    pvc-xxxxx

kubectl exec postgres-0 -- psql -U app -d appdb -c "SELECT 1"
#  ?column?
# ----------
#         1
```

## Data persistence test

```bash
kubectl exec postgres-0 -- psql -U app -d appdb \
  -c "CREATE TABLE ping (ts timestamptz); INSERT INTO ping VALUES (now());"

kubectl delete pod postgres-0
# StatefulSet recreates it

kubectl exec postgres-0 -- psql -U app -d appdb -c "SELECT * FROM ping;"
# ts
# 2026-07-05 12:00:00+00  ← data survived!
```

## Checkpoint

```bash
kubectl get statefulset
# NAME       READY   AGE
# postgres   1/1     2m

kubectl get pvc
# data-postgres-0   Bound

kubectl exec postgres-0 -- psql -U app -d appdb -c "\dt"
#         List of relations
# Schema | Name | Type  | Owner
# ...
```

**Next:** [GitOps with ArgoCD](./06-gitops-with-argocd.md) — declarative cluster state from Git.
