import assert from "node:assert/strict";

export function recordLoginFixed(store, userId, event) {
  store[userId] = { userId, ip: event.ip };
  return { ...store[userId] };
}

export function countFailuresFixed(events, windowMinutes, now) {
  const windowMs = windowMinutes * 60 * 1000;
  return events.filter((event) => event.success === false && now - event.ts <= windowMs && now - event.ts >= 0).length;
}

export async function loadSummaryFixed(fetchEvents, userId) {
  const events = await fetchEvents(userId);
  return { userId, count: events.length };
}

let token = 0;
let current = null;

export async function saveLatest(value, delay) {
  const mine = ++token;
  await new Promise((resolve) => setTimeout(resolve, delay));
  if (mine !== token) return current;
  current = value;
  return current;
}

const store = {};
const event = { ip: "1.1.1.1" };
recordLoginFixed(store, "a", event);
event.ip = "9.9.9.9";
recordLoginFixed(store, "b", { ip: "2.2.2.2" });
assert.equal(store.a.ip, "1.1.1.1");

const events = [
  { ts: 1_000, success: false },
  { ts: 50_000, success: 0 },
  { ts: 70_000, success: false },
];
const before = events.map((event) => event.ts);
assert.equal(countFailuresFixed(events, 1, 80_000), 1);
assert.deepEqual(events.map((event) => event.ts), before);

const summary = await loadSummaryFixed(async () => [{ id: 1 }, { id: 2 }], "a");
assert.deepEqual(summary, { userId: "a", count: 2 });

const first = saveLatest("old", 40);
const second = saveLatest("new", 5);
await first;
await second;
assert.equal(current, "new");
console.log("exercise solutions ok");
