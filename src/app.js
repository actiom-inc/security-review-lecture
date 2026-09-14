import { createDatabase } from "./db.js";
import { authenticate } from "./middleware/auth.js";
import { logRequest } from "./middleware/requestLogger.js";
import { getAuditLogs } from "./routes/admin.js";
import { fetchPreview } from "./routes/preview.js";
import { getCurrentUser, searchUsers } from "./routes/users.js";
import { sendJson } from "./utils/http.js";

export function createApp({
  db = createDatabase(),
  fetchImpl = globalThis.fetch,
  logger = console.log,
} = {}) {
  return async function app(request, response) {
    logRequest(request, logger);

    const url = new URL(request.url, "http://localhost");
    const user = authenticate(request, db);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/users/search") {
        searchUsers(response, url, db);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/me") {
        getCurrentUser(response, user);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/audit-logs") {
        getAuditLogs(response, user, db);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/tools/fetch-preview") {
        await fetchPreview(response, url, fetchImpl);
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      sendJson(response, 500, {
        error: "Internal server error",
        detail: error.message,
      });
    }
  };
}

