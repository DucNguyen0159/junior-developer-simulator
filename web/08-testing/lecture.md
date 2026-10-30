# Testing

A test is an input and one expected result. If the test still passes when you delete the behavior, it is not testing that behavior.

This repo uses Node's built-in runner. Do not install Vitest for this repo. The names match Vitest and Jest.

| This repo | Vitest or Jest |
| --- | --- |
| `node --test file.test.mjs` | `vitest run` or `jest` |
| `import { test } from "node:test"` | `test` or `it` from the runner |
| `import assert from "node:assert/strict"` | `expect(value)` |
| `assert.equal` | `toBe` for primitives |
| `assert.deepEqual` | `toEqual` for objects |
| `assert.rejects` | `await expect(promise).rejects` |

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`.

## 1. A unit test

### Concept

Arrange the smallest input. Act with one call. Assert one outcome. Read the assertion before the implementation. This repo uses `node --test`, `node:test`, and `node:assert/strict`. `assert.equal` is `toBe`. `assert.deepEqual` is `toEqual`. `assert.rejects` matches `expect().rejects`. A test that still passes when you delete the behavior is not testing it.

`fetch` does not throw on a 500. The branch that checks `response.ok` is easy to forget. A test with `ok: false` locks it in.

### Terms

| Part | Job |
| --- | --- |
| Name | The behavior, not the function name alone |
| Arrange | The smallest input |
| Act | One call |
| Assert | One outcome |

### Methods

| This repo | Same idea in Vitest or Jest |
| --- | --- |
| `node --test file.test.mjs` | `vitest run` or `jest` |
| `import { test } from "node:test"` | `test` or `it` |
| `assert.equal(actual, expected)` | `expect(actual).toBe(expected)` |
| `assert.deepEqual(actual, expected)` | `expect(actual).toEqual(expected)` |
| `await assert.rejects(fn, /500/)` | `await expect(fn()).rejects` |

### Examples

**Case: `assert.equal` checks a primitive**

```javascript
import assert from "node:assert/strict";

function isBlank(text) {
  return text.trim() === "";
}
assert.equal(isBlank("   "), true);
assert.equal(isBlank("a"), false);
```

Result: neither call throws.

Why: `assert.equal` is `toBe`. `"   "` trims to `""`, so the first assertion passes. The test calls `isBlank`. Deleting `isBlank` makes the test fail.

**Case: `assert.equal` on two objects throws**

```javascript
import assert from "node:assert/strict";

let name = "passed";
try {
  assert.equal({ id: "ada" }, { id: "ada" });
} catch (error) {
  name = error.name;
}
```

Result: `"AssertionError"`.

Why: `assert.equal` compares primitives and references. These are two objects. Equal contents still fail `toBe`.

**Case: `assert.deepEqual` compares the contents**

```javascript
import assert from "node:assert/strict";

assert.deepEqual({ id: "ada" }, { id: "ada" });
```

Result: the call does not throw.

Why: `assert.deepEqual` is `toEqual`. It compares the fields. Use it for objects and arrays. Use `assert.equal` for primitives.

**Case: `assert.rejects` locks the `ok: false` branch**

```javascript
import assert from "node:assert/strict";

async function getJson(fetchImpl) {
  const response = await fetchImpl();
  if (!response.ok) throw new Error(`request failed: ${response.status}`);
  return response.json();
}
await assert.rejects(
  () => getJson(async () => ({ ok: false, status: 500, json: async () => ({ id: "1" }) })),
  /500/,
);
```

Result: the assertion passes. The function throws an error whose message is `request failed: 500`.

Why: `fetch` fulfills on 500. This test arranges `ok: false` and asserts the throw. `assert.rejects` is the match for `expect().rejects`. If the `ok` check is deleted, `getJson` returns `{ id: "1" }` and this assertion fails.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Asserting `1 === 1` and never calling the function | The test passes after you delete the behavior | Call the function, then assert its result |
| `assert.equal` on objects | `AssertionError` for two equal shapes | `assert.deepEqual` |
| Installing Vitest for this repo | A second runner, while the files already use `node:test` | `node --test file.test.mjs` |

### Tip

The sample runner file is `sample.test.mjs`. The command for this repo is `node --test file.test.mjs`.

### Practice

`assert.deepEqual({ status: 401 }, { status: 401 })`. Say whether it throws.

### Solution

```javascript
import assert from "node:assert/strict";

assert.deepEqual({ status: 401 }, { status: 401 });
```

Result: the call does not throw.

## 2. Edge cases

### Concept

Cover empty, the boundary on both sides, missing, a wrong type that coerces, and two items. `success: 0` is not a failure. In Python, `count: true` is a bool, and `isinstance(True, int)` is `True`. When the rule says within 10 minutes, exactly 10 minutes counts and one millisecond more does not.

### Terms

| Case | Example |
| --- | --- |
| Empty | `[]`, `""` |
| Boundary | Exactly 5 failures, exactly 10 minutes |
| Missing | `null` user, missing country |
| Wrong type that coerces | `success: 0`, `count: true` in Python |
| Two items | Two users, two countries |

### Methods

| Check | Passes when |
| --- | --- |
| `event.success === false` | The value is the boolean `false` |
| `gapMs <= 10 * 60 * 1000` | The gap is 10 minutes or less |
| `items.length === 0` | The list is empty |
| `isinstance(value, bool)` first | A Python `True` count is rejected |

### Examples

**Case: `success: 0` is not a failure**

```javascript
function isFailure(event) {
  return event.success === false;
}
const zero = isFailure({ success: 0 });
const failed = isFailure({ success: false });
```

Result: `zero` is `false`. `failed` is `true`.

Why: `0 == false` is true in JavaScript, and `0 === false` is false. The rule needs the boolean. An implementation that uses `==` treats `{ success: 0 }` as a failure. A test that expects `false` here fails if someone uses `==`.

**Case: exactly 10 minutes is inside, and one more millisecond is outside**

```javascript
function within10Minutes(gapMs) {
  return gapMs <= 10 * 60 * 1000;
}
const edge = within10Minutes(600000);
const over = within10Minutes(600001);
```

Result: `edge` is `true`. `over` is `false`.

Why: `10 * 60 * 1000` is `600000`. The boundary belongs to both sides of the test. Exactly 10 minutes counts. One millisecond more does not.

**Case: empty and missing**

```javascript
function isEmpty(items) {
  return items.length === 0;
}
function hasUser(user) {
  return user != null;
}
const empty = isEmpty([]);
const filled = isEmpty([1]);
const missing = hasUser(null);
```

Result: `empty` is `true`. `filled` is `false`. `missing` is `false`.

Why: `[]` and a `null` user are different edges. One test for each keeps the name pointed at one rule.

**Case: Python `True` is an int unless you reject bools first**

```python
def count_ok(value):
    if isinstance(value, bool) or not isinstance(value, int):
        return False
    return value >= 0

flag = count_ok(True)
zero = count_ok(0)
```

Result: `flag` is `False`. `zero` is `True`.

Why: `count: true` would pass a bare `isinstance(value, int)` check. The bool test is the edge. `0` stays valid.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Testing only the happy path | The boundary and the empty list stay untested | Add empty, both sides of the boundary, and missing |
| `success == false` | `{ success: 0 }` counts as a failure | `success === false` |
| One test that feeds two countries and five failures | A failure does not say which rule broke | One behavior per test |

### Tip

Exactly 5 failures is a boundary the same way exactly 10 minutes is. Test 4 and test 5, or test the window the scenario names, on both sides.

### Practice

`within10Minutes(600000)` and `isFailure({ success: 0 })`.

### Solution

```javascript
function within10Minutes(gapMs) {
  return gapMs <= 10 * 60 * 1000;
}
function isFailure(event) {
  return event.success === false;
}
const edge = within10Minutes(600000);
const zero = isFailure({ success: 0 });
```

Result: `edge` is `true`. `zero` is `false`.

## 3. A failing test

### Concept

Read the assertion before you read the implementation. The test is the spec. Change the code until this test passes. Then run the other tests. A fix that breaks an older test is a regression. A test that still passes when you delete the behavior is not testing it.

### Terms

| Failure text | What to do |
| --- | --- |
| `Expected 401, got 403` | Find the branch that picks the status |
| `Expected 1, got 2` | An extra item matched the filter |
| `Promise rejected` | Something threw. Read the error message |
| Test times out | A promise was never awaited or a timer never fired |

### Methods

| Step | Action |
| --- | --- |
| Read the assertion | The expected status or value is the spec |
| Find the branch | The line that returns the other status |
| Change the code | Keep the assertion |
| Re-run | The new test and the older tests |

### Examples

**Case: the missing-user branch returns 403**

```javascript
function guardStatus(user, allowed) {
  if (!user) return 403;
  if (!allowed) return 403;
  return 200;
}
const status = guardStatus(null, false);
```

Result: `403`.

Why: a test that asserts 401 fails with expected 401, got 403. The branch for a missing user is the one to change. The assertion stays.

**Case: the same input returns 401 after the fix**

```javascript
function guardStatus(user, allowed) {
  if (!user) return 401;
  if (!allowed) return 403;
  return 200;
}
const status = guardStatus(null, false);
```

Result: `401`.

Why: the code moved to the assertion. The test was the spec. Changing the assertion to expect 403 would have kept the bug.

**Case: an assertion that never calls the function still passes**

```javascript
import assert from "node:assert/strict";

function unused() {
  return 401;
}
assert.equal(1, 1);
```

Result: the assertion passes.

Why: deleting `unused` leaves `assert.equal(1, 1)` green. The test does not test `unused`. A test that still passes when you delete the behavior is not testing it.

**Case: a rejected promise shows up as a failure until the test awaits it**

```javascript
import assert from "node:assert/strict";

async function load() {
  throw new Error("request failed: 500");
}
await assert.rejects(load, /500/);
```

Result: the assertion passes.

Why: `assert.rejects` waits for the rejection and matches `/500/`. A test that forgets to await a promise can time out or report an unhandled rejection instead of the status you meant to check.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Editing the assertion to match the bug | The suite goes green and the bug stays | Change the code. Keep the assertion unless the test itself is wrong |
| A test that does not call the function | It passes when the behavior is deleted | Arrange, act, assert on the real call |
| Ignoring an older failure after a fix | The new test passes and a regression lands | Run the whole file |

### Tip

`Expected 401, got 403` is a branch bug. Open the function that returns the status. Do not open the test to loosen it.

### Practice

`guardStatus({ id: "ada" }, false)` with the fixed function that returns 401, then 403, then 200.

### Solution

```javascript
function guardStatus(user, allowed) {
  if (!user) return 401;
  if (!allowed) return 403;
  return 200;
}
const status = guardStatus({ id: "ada" }, false);
```

Result: `403`.

## 4. Auth and permission tests

### Concept

One behavior per test. "401 or 403" is a weak test. The product needs a different UI for "please log in" and "you cannot do that." A test that accepts both lets a swap pass.

No user and a private page is 401. A user without the permission is 403. A user with the permission is 200. A public page and no user is 200. Messages must not contain the IP or the password.

### Terms

| Test | Expect |
| --- | --- |
| No user, private page | 401 |
| User without permission | 403 |
| User with permission | 200 |
| Public page, no user | 200 |
| Message text | Does not contain the IP or the password |

### Methods

| Assertion | What it locks |
| --- | --- |
| `assert.equal(status, 401)` | Signed out. 403 fails this test |
| `assert.equal(status, 403)` | Signed in, not allowed. 401 fails this test |
| `assert.equal(status, 200)` | Allowed, including a public page with no user |
| `message.includes(ip)` is false | The IP is not in the text |

### Examples

**Case: no user on a private page is 401**

```javascript
function statusFor(user, page) {
  if (page.public === true) return 200;
  if (!user) return 401;
  if (!user.permissions.includes(page.permission)) return 403;
  return 200;
}
const status = statusFor(null, { public: false, permission: "reports:read" });
```

Result: `401`.

Why: the page is private and there is no user. One assertion, `assert.equal(status, 401)`, names that behavior.

**Case: a user without the permission is 403, and with it is 200**

```javascript
function statusFor(user, page) {
  if (page.public === true) return 200;
  if (!user) return 401;
  if (!user.permissions.includes(page.permission)) return 403;
  return 200;
}
const denied = statusFor({ permissions: [] }, { public: false, permission: "reports:read" });
const allowed = statusFor(
  { permissions: ["reports:read"] },
  { public: false, permission: "reports:read" },
);
```

Result: `denied` is `403`. `allowed` is `200`.

Why: these are two behaviors. Two tests keep a swap of 403 and 200 from hiding inside one assertion.

**Case: a public page with no user is 200**

```javascript
function statusFor(user, page) {
  if (page.public === true) return 200;
  if (!user) return 401;
  if (!user.permissions.includes(page.permission)) return 403;
  return 200;
}
const status = statusFor(null, { public: true, permission: "reports:read" });
```

Result: `200`.

Why: public is checked before the user. A test that only covers private pages misses this.

**Case: "401 or 403" accepts a swap, and the message must stay clean**

```javascript
function accepts(status) {
  return status === 401 || status === 403;
}
function messageIsSafe(message, ip, password) {
  return !message.includes(ip) && !message.includes(password);
}
const either = accepts(401);
const swapped = accepts(403);
const clean = messageIsSafe(
  "A sign-in came from a country we have not seen on this account.",
  "1.1.1.1",
  "hash-of-secret",
);
const leaked = messageIsSafe("Failed from 1.1.1.1", "1.1.1.1", "hash-of-secret");
```

Result: `either` is `true`. `swapped` is `true`. `clean` is `true`. `leaked` is `false`.

Why: a test that allows either 401 or 403 stays green when the statuses are swapped. The clean sentence does not contain the IP or the password. A message that contains the IP fails `messageIsSafe`.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Asserting status is 401 or 403 | A swap of the two statuses still passes | One expected status per test |
| Checking only the signed-in denial | Public plus no user is untested | A separate test expects 200 |
| Asserting the message exists and not what it omits | An IP or a password can land in the sentence | Assert the text does not contain the IP or the password |

### Tip

Four status tests, four names: signed out, lacking permission, holding permission, public and signed out.

### Practice

`statusFor({ permissions: ["reports:read"] }, { public: false, permission: "reports:read" })`.

### Solution

```javascript
function statusFor(user, page) {
  if (page.public === true) return 200;
  if (!user) return 401;
  if (!user.permissions.includes(page.permission)) return 403;
  return 200;
}
const status = statusFor(
  { permissions: ["reports:read"] },
  { public: false, permission: "reports:read" },
);
```

Result: `200`.

## 5. Regression

### Concept

A regression test is the input that failed, kept in the suite. After you debug a shared object, the test that caught it stays. Do not change the test to match the bug. Assert the return value. One behavior per test.

### Terms

| Mistake | What it does to the suite |
| --- | --- |
| Changing the test to match the bug | The bug becomes the spec |
| Asserting a private local variable | The test breaks when you rename a local that the caller never sees |
| One giant test with five asserts for five behaviors | The name no longer says which rule broke |

### Methods

| Step | Action |
| --- | --- |
| Keep the input that failed | Same user object, same later edit |
| Assert the return value | The caller's city, not a local inside the function |
| Leave the assertion alone | Change the implementation to a copy |
| Split behaviors | One test, one rule |

### Examples

**Case: returning the same object fails the regression input**

```javascript
function snapshot(user) {
  return user;
}
const user = { city: "Irvine" };
const copy = snapshot(user);
user.city = "Tustin";
```

Result: `copy.city` is `"Tustin"`.

Why: the function stored the caller's object. The input that failed is this sequence: snapshot, then change `user.city`. The assertion that `copy.city` is `"Irvine"` fails. That assertion stays.

**Case: a copy keeps the city that was snapshotted**

```javascript
function snapshot(user) {
  return { ...user };
}
const user = { city: "Irvine" };
const copy = snapshot(user);
user.city = "Tustin";
```

Result: `copy.city` is `"Irvine"`.

Why: the fix copies the fields. The regression test is the same input, still expecting `"Irvine"`. Do not change the test to expect `"Tustin"`.

**Case: the assertion is on the return value**

```javascript
import assert from "node:assert/strict";

function snapshot(user) {
  return { ...user };
}
const user = { city: "Irvine" };
const copy = snapshot(user);
user.city = "Tustin";
assert.equal(copy.city, "Irvine");
```

Result: the assertion passes. `user.city` is `"Tustin"`.

Why: the test reads `copy`, which is the return value. It does not read a local variable inside `snapshot`.

**Case: two behaviors need two assertions' worth of names**

```javascript
function guardStatus(user, allowed) {
  if (!user) return 401;
  if (!allowed) return 403;
  return 200;
}
const signedOut = guardStatus(null, false);
const denied = guardStatus({ id: "ada" }, false);
```

Result: `signedOut` is `401`. `denied` is `403`.

Why: these are two rules. One test named "401 or 403" would stay green if the branches swapped only when you assert a single `||` check. Split them so the name tells you which rule broke. A regression test keeps each input that failed.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Changing the test to match the bug | The suite describes the broken behavior | The test was the spec. Change the code, unless the test itself is wrong |
| Asserting a private local variable | A rename fails the test while the return value is still right | Assert the return value |
| One giant test with five asserts for five behaviors | The failure name is the whole scenario | Split them so the name tells you which rule broke |

### Tip

Keep the input that failed in production. The fix is a change to the function. The expected line stays.

### Practice

Run the copy `snapshot` on `{ city: "Irvine" }`, then set `user.city` to `"Tustin"`. Read `copy.city`.

### Solution

```javascript
function snapshot(user) {
  return { ...user };
}
const user = { city: "Irvine" };
const copy = snapshot(user);
user.city = "Tustin";
```

Result: `copy.city` is `"Irvine"`.

## Exercises

See `exercises.md`. The sample runner file is `sample.test.mjs`.

## Quiz

1. Why does `fetch` style code need a test where `ok` is false?
2. What is the difference between `assert.equal` and `assert.deepEqual`?
3. Why is "returns 401 or 403" a weak test?
4. What is a regression test?
5. Which runner command does this repo use instead of installing Vitest?
