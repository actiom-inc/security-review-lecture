import { sendJson } from "../utils/http.js";

export function searchUsers(response, url, db) {
  const email = url.searchParams.get("email") ?? "";
  const query = db.prepare(`
    SELECT id, email, display_name
    FROM users
    WHERE email LIKE ?
    ORDER BY id
  `);

  const users = query.all(`%${email}%`);
  sendJson(response, 200, { users });
}

export function getCurrentUser(response, user) {
  if (!user) {
    sendJson(response, 401, { error: "Authentication required" });
    return;
  }

  sendJson(response, 200, { user });
}
