import assert from "node:assert/strict";

function show(label, value) {
  console.log(`${label} => ${JSON.stringify(value)}`);
  return value;
}

const user = { id: 1 };
user.id = 2;
show("const object property change", user.id);
assert.equal(user.id, 2);

show("typeof null", typeof null);
assert.equal(typeof null, "object");
assert.equal(Array.isArray([]), true);

const shared = { n: 1 };
const alias = shared;
alias.n = 2;
show("shared reference", shared.n);
assert.equal(shared.n, 2);

show("0 == false", 0 == false);
show("0 === false", 0 === false);
show("null == undefined", null == undefined);
show("null === undefined", null === undefined);
show("NaN === NaN", NaN === NaN);
assert.equal(0 == false, true);
assert.equal(0 === false, false);
assert.equal(Number.isNaN(NaN), true);

show("map", [1, 2, 3].map((n) => n * 2));
show("filter", [1, 2, 3].filter((n) => n > 1));
show("find", [1, 2, 3].find((n) => n > 1));
show("some", [1, 2, 3].some((n) => n > 5));
show("every", [1, 2, 3].every((n) => n > 0));
show("every empty", [].every(() => false));
show("reduce", [1, 2, 3].reduce((sum, n) => sum + n, 0));
assert.deepEqual([1, 2, 3].map((n) => n * 2), [2, 4, 6]);
assert.equal([].every(() => false), true);

show("?? with 0", 0 ?? 10);
show("|| with 0", 0 || 10);
assert.equal(0 ?? 10, 0);
assert.equal(0 || 10, 10);

const card = { city: "Irvine", meta: { beds: 3 } };
const copy = { ...card };
copy.city = "Tustin";
copy.meta.beds = 4;
show("shallow city", card.city);
show("shallow nested", card.meta.beds);
assert.equal(card.city, "Irvine");
assert.equal(card.meta.beds, 4);

const deep = structuredClone(card);
deep.meta.beds = 9;
show("structuredClone leaves original", card.meta.beds);
assert.equal(card.meta.beds, 4);

function parseCount(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("count must be a non-negative integer");
  }
  return n;
}

show("parseCount 3", parseCount("3"));
assert.throws(() => parseCount("-1"), /non-negative/);

console.log("examples ok");
