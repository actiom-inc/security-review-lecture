import { sendJson } from "../utils/http.js";

export function getAuditLogs(response, user, db) {
  if (!user) {
    sendJson(response, 401, { error: "Authentication required" });
    return;
  }

  const logs = db
    .prepare(
      `SELECT id, actor_email, action, ip_address, created_at
       FROM audit_logs
       ORDER BY created_at DESC`,
    )
    .all();

  sendJson(response, 200, { logs });
}

