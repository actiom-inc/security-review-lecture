export function logRequest(request, logger = console.log) {
  logger(
    JSON.stringify({
      method: request.method,
      url: request.url,
      authorization: request.headers.authorization,
      userId: request.headers["x-user-id"],
      at: new Date().toISOString(),
    }),
  );
}

