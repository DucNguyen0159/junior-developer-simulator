import assert from "node:assert/strict";

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

console.log("loading =>", alertView({ status: "loading" }));
console.log("empty =>", alertView({ status: "ready", items: [] }));
const list = alertView({
  status: "ready",
  items: [
    { code: "new-country", severity: "medium", message: "New country.", ip: "1.1.1.1" },
    { code: "impossible-travel", severity: "high", message: "Two countries.", ip: "2.2.2.2" },
  ],
});
console.log("list =>", list);
assert.equal(list.items[0].severity, "high");
assert.equal("ip" in list.items[0], false);
console.log("examples ok");
