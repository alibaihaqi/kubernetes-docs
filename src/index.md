---
layout: home

hero:
  name: "Kubernetes Documentation"
  tagline: Part of the Learning Docs hub.
  actions:
    - theme: brand
      text: Introduction
      link: /introduction/
    - theme: alt
      text: Getting Started
      link: /introduction/getting-started
    - theme: alt
      text: Hub
      link: https://alibaihaqi.github.io/learning-docs/

features:
  - title: Beginner tier
    details: Deploy one app to a local kind cluster — Pod, Deployment, Service, and port-forward, end to end.
    link: /beginner/
  - title: Intermediate tier
    details: Production-shape the beginner Deployment — ConfigMap env, liveness/readiness probes, resource limits, rolling update, and scaling.
    link: /intermediate/
  - title: Advanced tier
    details: Full production cluster — Helm, Ingress, cert-manager TLS, StatefulSets, GitOps with ArgoCD, Prometheus/Grafana, Loki logging, RBAC, and hardening.
    link: /advanced/
  - title: Argo Stack
    details: Event-driven GitOps pipeline — Argo Events triggers Argo Workflows triggers ArgoCD sync. Webhook-to-deploy on kind, all local.
    link: /argo-stack/
---
