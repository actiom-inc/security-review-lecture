import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";

let baseUrl;
let server;

before(async () => {
  server = createServer(
    createApp({
      logger: () => {},
      fetchImpl: async (url) => ({
        status: 200,
        url,
        text: async () => "preview body",
      }),
    }),
  );

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health check returns ok", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("user search finds a matching user", async () => {
  const response = await fetch(
    `${baseUrl}/api/users/search?email=${encodeURIComponent("alice")}`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.users.length, 1);
  assert.equal(body.users[0].email, "alice@example.test");
});

test("user search treats SQL syntax as text", async () => {
  const payload = "' OR 1=1 --";
  const response = await fetch(
    `${baseUrl}/api/users/search?email=${encodeURIComponent(payload)}`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.users, []);
});

test("current user requires authentication", async () => {
  const response = await fetch(`${baseUrl}/api/me`);

  assert.equal(response.status, 401);
});

test("an administrator can read audit logs", async () => {
  const response = await fetch(`${baseUrl}/api/admin/audit-logs`, {
    headers: { "x-user-id": "3" },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.logs.length, 2);
});

test("preview endpoint returns an upstream response", async () => {
  const target = "https://example.test/public-page";
  const response = await fetch(
    `${baseUrl}/api/tools/fetch-preview?url=${encodeURIComponent(target)}`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.finalUrl, target);
  assert.equal(body.body, "preview body");
});
