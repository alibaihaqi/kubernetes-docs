---
title: Reach the app
---

# Reach the app

The Service's `ClusterIP` is only reachable from inside the cluster. To reach
it from your laptop you use `kubectl port-forward`, which tunnels a local port
to the Service.

## Forward a local port

```bash
kubectl port-forward service/web 8080:8080
```

Leave this command running in its terminal. It forwards `localhost:8080` on your
machine to port `8080` on the `web` Service.

## Send a request

Open a second terminal and run:

```bash
curl localhost:8080   # the nginx welcome HTML
```

You should receive the nginx welcome page HTML, confirming the full path works:

```
curl → localhost:8080 → kubectl tunnel → Service web :8080 → Pod :80 → nginx
```

> **Checkpoint:** `curl localhost:8080` returns HTML containing
> `Welcome to nginx!`.

Press `Ctrl+C` in the first terminal to stop the port-forward when you are done.

Next: [07 Teardown](./07-teardown.md)
