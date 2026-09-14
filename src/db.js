import { DatabaseSync } from "node:sqlite";

export function createDatabase() {
  const db = new DatabaseSync(":memory:");

  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE audit_logs (
      id INTEGER PRIMARY KEY,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    INSERT INTO users (id, email, display_name, role) VALUES
      (1, 'alice@example.test', 'Alice', 'user'),
      (2, 'bob@example.test', 'Bob', 'user'),
      (3, 'admin@example.test', 'Admin', 'admin');

    INSERT INTO audit_logs (id, actor_email, action, ip_address, created_at) VALUES
      (1, 'admin@example.test', 'EXPORT_USERS', '10.0.0.8', '2026-04-17T09:10:00Z'),
      (2, 'alice@example.test', 'UPDATE_PROFILE', '10.0.0.21', '2026-04-17T09:12:00Z');
  `);

  return db;
}

