# System context

This demo API is designed to run behind a trusted identity-aware reverse proxy.

The proxy authenticates the user, removes any client-supplied `x-user-id` header, and sets a verified user ID before forwarding the request to the application. The application itself remains responsible for authorization decisions based on the user's role.

The application has no legitimate requirement to contact private IP ranges, cloud metadata endpoints, or arbitrary customer-provided hosts.

