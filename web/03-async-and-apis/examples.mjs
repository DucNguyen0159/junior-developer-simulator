import assert from "node:assert/strict";

async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return response.json();
}

const ok = await getJson("/users/1", async () => ({
  ok: true,
  status: 200,
  json: async () => ({ id: "1" }),
}));
console.log("ok =>", ok);
assert.deepEqual(ok, { id: "1" });

await assert.rejects(
  () => getJson("/missing", async () => ({ ok: false, status: 404, json: async () => ({}) })),
  /404/,
);
console.log("404 throws => request failed: 404");

function view(state) {
  if (state.status === "loading") return "loading";
  if (state.status === "error") return "error";
  if (state.items.length === 0) return "empty";
  return "list";
}

console.log("empty =>", view({ status: "ready", items: [] }));
assert.equal(view({ status: "ready", items: [] }), "empty");
assert.equal(view({ status: "error", message: "nope", items: [] }), "error");
console.log("examples ok");
