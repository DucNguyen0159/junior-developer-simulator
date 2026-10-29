import assert from "node:assert/strict";

export function statusMeaning(code) {
  if (code === 200 || code === 201) return "ok";
  if (code === 400 || code === 401 || code === 403 || code === 404) return "client";
  if (code === 500) return "server";
  return "other";
}

export async function readUser(fetchImpl, url) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  const data = await response.json();
  if (data === null || typeof data !== "object" || typeof data.id !== "string") {
    throw new Error("invalid user");
  }
  return data;
}

export function viewFor(state) {
  if (state.status === "loading") return "loading";
  if (state.status === "error") return "error";
  if (state.items.length === 0) return "empty";
  return "list";
}

export async function newestUser(fetchUser, ids) {
  let user = null;
  for (const id of ids) {
    user = await fetchUser(id);
  }
  return user;
}

assert.equal(statusMeaning(401), "client");
assert.equal(statusMeaning(201), "ok");
const user = await readUser(async () => ({ ok: true, status: 200, json: async () => ({ id: "a" }) }), "/u");
assert.equal(user.id, "a");
await assert.rejects(() => readUser(async () => ({ ok: false, status: 500, json: async () => ({}) }), "/u"));
assert.equal(viewFor({ status: "error", message: "x", items: [{ id: 1 }] }), "error");
assert.deepEqual(await newestUser(async (id) => ({ id }), ["a", "b"]), { id: "b" });
console.log("exercise solutions ok");
