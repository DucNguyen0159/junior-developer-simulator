import assert from "node:assert/strict";

export function isBlank(text) {
  return text.trim() === "";
}

export function messageIsSafe(message, ip) {
  return !message.includes(ip);
}

export function countFailures(events) {
  return events.filter((event) => event.success === false).length;
}

assert.equal(isBlank("   "), true);
assert.equal(isBlank("a"), false);
assert.equal(messageIsSafe("A sign-in failed.", "1.1.1.1"), true);
assert.equal(messageIsSafe("From 1.1.1.1", "1.1.1.1"), false);
assert.equal(countFailures([{ success: false }, { success: 0 }]), 1);
console.log("exercise solutions ok");
