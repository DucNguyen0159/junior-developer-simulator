import assert from "node:assert/strict";

const store = {};
const shared = { userId: null, ip: null };

function recordBuggy(userId, event) {
  shared.userId = userId;
  shared.ip = event.ip;
  store[userId] = shared;
}

recordBuggy("a", { ip: "1.1.1.1" });
recordBuggy("b", { ip: "2.2.2.2" });
console.log("buggy last login for a =>", store.a.ip);
assert.equal(store.a.ip, "2.2.2.2");

function recordFixed(box, userId, event) {
  box[userId] = { userId, ip: event.ip };
}

const fixed = {};
recordFixed(fixed, "a", { ip: "1.1.1.1" });
recordFixed(fixed, "b", { ip: "2.2.2.2" });
console.log("fixed last login for a =>", fixed.a.ip);
assert.equal(fixed.a.ip, "1.1.1.1");

let label = "none";
await Promise.resolve("ada").then((name) => {
  label = name;
});
console.log("after await =>", label);
assert.equal(label, "ada");

let latest = 0;
const writes = [];

async function load(id, delay, value) {
  const token = ++latest;
  await new Promise((resolve) => setTimeout(resolve, delay));
  if (token !== latest) return;
  writes.push(value);
}

await Promise.all([load(1, 30, "old"), load(2, 5, "new")]);
console.log("newest write wins =>", writes);
assert.deepEqual(writes, ["new"]);
console.log("examples ok");
