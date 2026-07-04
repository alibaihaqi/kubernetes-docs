---
title: Kubernetes Beginner — one app on a local cluster
tier: beginner
platform: kubernetes
---

# Kubernetes Beginner

[Hub](https://alibaihaqi.github.io/learning-docs/) › Kubernetes › Beginner

## What you'll build

A running web app on a local Kubernetes cluster. You install `kubectl` and
`kind`, create a one-node cluster, and go from a single Pod to a Deployment
managed by Kubernetes, exposed by a Service, reachable from your machine with
`kubectl port-forward` + `curl`. The last page tears the cluster down. The app
is the public `nginx` image — no registries, no secrets.

## The ladder

1. [01 What is Kubernetes](./01-what-is-kubernetes.md)
2. [02 Local cluster with kind](./02-local-cluster.md)
3. [03 A Pod](./03-pod.md)
4. [04 A Deployment](./04-deployment.md)
5. [05 A Service](./05-service.md)
6. [06 Reach the app](./06-reach-the-app.md)
7. [07 Teardown](./07-teardown.md)
