import assert from "node:assert/strict";

export function fieldError(value, allowed) {
  if (value.trim() === "") return "Required";
  if (!allowed.includes(value)) return "Choose a listed value";
  return null;
}

function rank(severity) {
  return severity === "high" ? 2 : 1;
}

export function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}

export function nextState(current, action) {
  if (action.type === "loading") return { status: "loading" };
  if (action.type === "error") return { status: "error", message: action.message };
  if (action.type === "ready") return { status: "ready", items: action.items };
  return current;
}

assert.equal(fieldError("  ", ["US"]), "Required");
assert.equal(fieldError("CA", ["US"]), "Choose a listed value");
assert.equal(fieldError("US", ["US"]), null);
const items = [{ code: "a", severity: "medium", message: "m", ip: "1.1.1.1" }];
const view = alertView({ status: "ready", items });
assert.equal("ip" in view.items[0], false);
assert.equal(items[0].ip, "1.1.1.1");
assert.deepEqual(nextState({ status: "ready", items: [] }, { type: "error", message: "nope" }), {
  status: "error",
  message: "nope",
});
console.log("exercise solutions ok");
