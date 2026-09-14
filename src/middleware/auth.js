export function authenticate(request, db) {
  const rawUserId = request.headers["x-user-id"];

  if (!rawUserId) {
    return null;
  }

  return (
    db
      .prepare("SELECT id, email, display_name, role FROM users WHERE id = ?")
      .get(Number(rawUserId)) ?? null
  );
}

