# Testing

A test is an input and one expected result. If the test still passes when you delete the behavior, it is not testing that behavior.

This repo uses Node's built-in runner so you do not install Jest. The names match Vitest and Jest closely.

| This repo | Vitest or Jest |
| --- | --- |
| `node --test file.test.mjs` | `vitest run` or `jest` |
| `import { test } from "node:test"` | `test` or `it` from the runner |
| `import assert from "node:assert/strict"` | `expect(value).toEqual(...)` |
| `assert.equal` | `toBe` for primitives |
| `assert.deepEqual` | `toEqual` for objects |
| `assert.rejects` | `await expect(promise).rejects.toThrow` |

## 1. A unit test

```javascript
import assert from "node:assert/strict";
import { test } from "node:test";
import { canAccess } from "./access.mjs";

test("a public page allows a signed-out user", () => {
  assert.equal(canAccess(null, { public: true }).allowed, true);
});
```

| Part | Job |
| --- | --- |
| Name | The behavior, not the function name alone |
| Arrange | The smallest input |
| Act | One call |
| Assert | One outcome |

## 2. Edge cases

| Case | Example |
| --- | --- |
| Empty | `[]`, `""` |
| Boundary | Exactly 5 failures, exactly 10 minutes |
| Missing | `null` user, missing country |
| Wrong type that coerces | `success: 0`, `count: true` in Python |
| Two items | Two users, two countries |

Test the boundary on both sides when the rule says "within 10 minutes."

## 3. A failing test

Read the assertion before you read the implementation. The test is the spec.

| Failure text | What to do |
| --- | --- |
| `Expected 401, got 403` | Find the branch that picks the status |
| `Expected 1, got 2` | An extra item matched the filter |
| `Promise rejected` | Something threw. Read the error message |
| Test times out | A promise was never awaited or a timer never fired |

Change the code until this test passes. Then run the other tests. A fix that breaks an older test is a regression.

## 4. Auth and permission tests

| Test | Expect |
| --- | --- |
| No user, private page | 401 |
| User without permission | 403 |
| User with permission | 200 |
| Public page, no user | 200 |
| Message text | Does not contain the IP or the password |

One test per row. A test that allows either 401 or 403 hides the bug.

## 5. Regression

A regression test is the input that failed in production, kept in the suite. After you debug assessment A, the test that caught the shared object should stay.

| Mistake | Fix |
| --- | --- |
| Changing the test to match the bug | The test was the spec. Change the code, unless the test itself is wrong |
| Asserting a private local variable | Assert the return value |
| One giant test with five asserts for five behaviors | Split them so the name tells you which rule broke |

## Exercises

See `exercises.md`. The sample runner file is `sample.test.mjs`.

## Quiz

1. Why does `fetch` style code need a test where `ok` is false?
2. What is the difference between `assert.equal` and `assert.deepEqual`?
3. Why is "returns 401 or 403" a weak test?
4. What is a regression test?
5. Which runner command does this repo use instead of installing Vitest?
