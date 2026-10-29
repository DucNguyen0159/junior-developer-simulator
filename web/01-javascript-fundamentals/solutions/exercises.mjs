import assert from "node:assert/strict";

export function failedCount(events) {
  return events.filter((event) => event.success === false).length;
}

export function activeUsers(users) {
  return users.filter((user) => user.active === true);
}

export function withPrice(card, price) {
  return { ...card, price };
}

export function total(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}

export function labelFor(user) {
  return user?.name ?? "guest";
}

export function firstOver(prices, limit) {
  return prices.find((price) => price > limit) ?? null;
}

assert.equal(failedCount([{ success: false }, { success: 0 }, { success: true }]), 1);
const users = [{ active: true }, { active: false }];
assert.equal(activeUsers(users).length, 1);
assert.equal(users.length, 2);
const card = { city: "Irvine", price: 1 };
assert.equal(withPrice(card, 2).price, 2);
assert.equal(card.price, 1);
assert.equal(total([]), 0);
assert.equal(total([1, 2]), 3);
assert.equal(labelFor(null), "guest");
assert.equal(labelFor({ name: "" }), "");
assert.equal(firstOver([1, 4], 3), 4);
assert.equal(firstOver([1], 3), null);
console.log("exercise solutions ok");
