# System context

This repository models a small public Web API and a production-like GCP deployment for security-review training.

The runnable demo uses an in-memory SQLite database so that the application can be started locally without cloud resources. The Terraform under `infra/` represents the intended production deployment: Cloud Run for the API and Cloud SQL for PostgreSQL.

## Intended request path

Users must reach the API through a trusted identity-aware reverse proxy managed outside this Terraform module.

```text
Internet
  |
  v
Trusted identity-aware reverse proxy
  |
  v
Cloud Run API
  |
  v
Cloud SQL
```

The reverse proxy authenticates the user, removes any client-supplied `x-user-id` header, and injects a verified user ID before forwarding the request. Direct access to the Cloud Run backend is not an intended access path.

The application itself remains responsible for authorization. In particular, routes under `/api/admin/` are intended to be accessible only to users whose role is `admin`.

## Outbound access

The preview feature is intended to retrieve public HTTPS pages for display to the user. The application has no legitimate requirement to contact private IP ranges, loopback addresses, link-local addresses, cloud metadata endpoints, or arbitrary internal services.

## Data and permissions

The production database contains user account data and audit logs. It is not intended to be directly reachable from the public Internet.

The Cloud Run runtime identity is intended to have only the permissions required to run the application. The application has no legitimate requirement for project-wide resource modification privileges.

Application secrets must not be committed to the repository or stored as plaintext defaults in Terraform configuration.

> Training note: the infrastructure in `infra/` is a review fixture only. Do not apply it to a real GCP project.
