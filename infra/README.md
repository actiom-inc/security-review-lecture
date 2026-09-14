# Infrastructure review fixture

This directory contains a production-like GCP Terraform fixture for the security-review lecture.

It is intentionally designed as review material and must not be applied to a real project.

Use it together with `docs/system-context.md` when reviewing the intended architecture and trust boundaries.

Suggested review scope:

- Cloud Run exposure and invocation controls
- IAM and service-account privileges
- Cloud SQL network exposure and resilience
- Secret handling
- Differences between the intended architecture and the Terraform configuration
- Security impact when combined with findings in `src/`
