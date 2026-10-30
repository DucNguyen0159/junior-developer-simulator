# Async and APIs

JavaScript keeps running while a request is in flight. The result arrives later as a promise. Run `node examples.mjs` and compare the printed lines with this page.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`.

## 1. Promises

### Concept

A promise is `pending`, then `fulfilled` or `rejected`. `.then`, `.catch`, and `.finally` each return a new promise. `Promise.all` rejects on the first rejection. `Promise.allSettled` reports each promise. Forgetting `return` inside `.then` makes the next `.then` see `undefined`.

### Terms

| Term | Meaning |
| --- | --- |
| Pending | The result is not in yet |
| Fulfilled | The promise has a value |
| Rejected | The promise has a reason |
| Settlement | Fulfilled or rejected |

### Methods

| Method | When it runs | What it returns |
| --- | --- | --- |
| `.then(fn)` | After fulfillment | A new promise of `fn`'s return value |
| `.catch(fn)` | After rejection | A new promise. It fulfills if `fn` does not throw |
| `.finally(fn)` | Either way | Passes the previous result through, unless `fn` throws |
| `Promise.all(list)` | When every promise settles, or at the first rejection | An array of values, or a rejection |
| `Promise.allSettled(list)` | When every promise settles | `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` for each |

### Examples

**Case: `return` inside `.then` passes the value on**

```javascript
const value = await Promise.resolve(1)
  .then((n) => {
    return n + 1;
  })
  .then((n) => n);
```

Result: `2`.

Why: the first `.then` returns `n + 1`. The next `.then` receives that number.

**Case: a missing `return` makes the next `.then` see `undefined`**

```javascript
const value = await Promise.resolve(1)
  .then((n) => {
    n + 1;
  })
  .then((n) => n);
```

Result: `undefined`.

Why: the first callback computes `n + 1` and then returns nothing. The next `.then` is called with `undefined`.

**Case: `Promise.all` rejects on the first rejection**

```javascript
let message = "fulfilled";
try {
  await Promise.all([
    Promise.resolve("a"),
    Promise.reject(new Error("nope")),
    Promise.resolve("c"),
  ]);
} catch (error) {
  message = error.message;
}
```

Result: `message` is `"nope"`.

Why: one rejection rejects the `Promise.all` call. The result is that error, not an array of the other values.

**Case: `Promise.allSettled` reports each promise**

```javascript
const settled = await Promise.allSettled([
  Promise.resolve("a"),
  Promise.reject(new Error("nope")),
]);
const statuses = settled.map((row) => row.status);
```

Result: `statuses` is `["fulfilled", "rejected"]`. `settled[1].reason.message` is `"nope"`.

Why: `allSettled` waits for every promise and keeps each outcome. One failure does not hide the others.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Forgetting `return` inside `.then` | The next `.then` receives `undefined` | `return` the value you want to pass on |
| `Promise.all` when one failure should not hide the others | The first rejection rejects the whole call | `Promise.allSettled` and read each `status` |
| Reading a field on the promise itself | The field is `undefined` because the value is still inside the promise | `.then` or `await` before you read the field |

### Tip

`.finally` runs either way and still passes the previous value through. `await Promise.resolve(2).finally(() => 9)` fulfills with `2`.

### Practice

Start from `Promise.resolve(3)`. Add `1` in a `.then`, and return it so the next `.then` receives the sum.

### Solution

```javascript
const value = await Promise.resolve(3)
  .then((n) => {
    return n + 1;
  })
  .then((n) => n);
```

Result: `4`.

## 2. async/await

### Concept

An `async` function returns a promise. `await` pauses that function, not the thread. Other JavaScript can run while the function waits. A rejected promise becomes a throw at the `await`. Wrap that `await` in `try/catch`.

### Terms

| Term | Meaning |
| --- | --- |
| `async` | This function always returns a promise |
| `await` | Pause this function until the promise settles |
| Thread | The rest of the program can keep running during that pause |

### Methods

| Form | What you get |
| --- | --- |
| `async function label() { return "Irvine"; }` | A promise of `"Irvine"` |
| `await promise` | The value, or a throw if the promise rejects |
| `try { await promise } catch (error) { }` | The rejection, inside this function |
| `Promise.all([a(), b()])` | Independent calls that start together |

### Examples

**Case: `await` pauses the function, and the caller continues**

```javascript
const order = [];
async function load() {
  order.push("start");
  await Promise.resolve();
  order.push("after await");
}
const pending = load();
order.push("outside");
await pending;
```

Result: `["start", "outside", "after await"]`.

Why: `await` paused `load`. It did not pause the thread. The caller pushed `"outside"` before `load` resumed.

**Case: an `async` function returns a promise**

```javascript
async function label() {
  return "Irvine";
}
const value = label();
const text = await value;
```

Result: `value` is a promise. `text` is `"Irvine"`.

Why: `return` inside `async` fulfills the promise. The string is available after `await`.

**Case: skipping `await` reads the promise, not the object**

```javascript
async function load() {
  const user = Promise.resolve({ name: "Ada" });
  return user.name;
}
const name = await load();
```

Result: `undefined`.

Why: `user` is a promise. The promise object has no `name` field. `await` has to happen before `.name`.

**Case: a rejection at `await` is a throw**

```javascript
async function load() {
  try {
    await Promise.reject(new Error("down"));
    return "ok";
  } catch (error) {
    return error.message;
  }
}
const message = await load();
```

Result: `"down"`.

Why: the rejected promise throws at `await`. The `catch` in the same function receives it. The `"ok"` line does not run.

**Case: independent calls can run together**

```javascript
const order = [];
async function pause(name) {
  order.push("start " + name);
  await Promise.resolve();
  order.push("end " + name);
}
await Promise.all([pause("a"), pause("b")]);
```

Result: `["start a", "start b", "end a", "end b"]`.

Why: both calls reach `await` before either resumes. Two `await` lines one after another would finish `a` before starting `b`: `["start a", "end a", "start b", "end b"]`. Use `Promise.all` when the calls do not depend on each other and any failure should reject the group.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `const data = fetch(url)` without `await` | `data` is a promise | `await` it before reading fields |
| `try/catch` around a call that is not awaited | That `catch` does not receive the rejection | `await` the promise inside the `try` |
| Sequential `await` when the calls are independent | Each call waits for the previous one to finish | `Promise.all` when any failure should stop the group |

### Tip

`await` is a pause in one function. Code after the call to that function still runs, until that caller awaits the returned promise.

### Practice

Write an `async` function that awaits `Promise.reject(new Error("down"))` inside `try/catch` and returns the error message.

### Solution

```javascript
async function load() {
  try {
    await Promise.reject(new Error("down"));
    return "ok";
  } catch (error) {
    return error.message;
  }
}
const message = await load();
```

Result: `"down"`.

## 3. fetch, methods, status

### Concept

`fetch` rejects on network failure and does NOT reject on HTTP 404 or 500. The promise fulfills with a response. Check `response.ok` or `response.status`. 401 means not logged in. 403 means logged in but not allowed.

### Terms

| Status | Meaning |
| --- | --- |
| 200 | Read or update worked |
| 201 | Created |
| 204 | Worked, and the body is empty |
| 400 | Bad input from the caller |
| 401 | Not logged in |
| 403 | Logged in, not allowed |
| 404 | No such resource |
| 500 | The server failed |

### Methods

| Method | Use | Typical success |
| --- | --- | --- |
| `GET` | Read | 200 |
| `POST` | Create | 201 |
| `PUT` | Replace | 200 |
| `PATCH` | Partial update | 200 |
| `DELETE` | Remove | 200 or 204 |

```javascript
async function getJson(fetchImpl) {
  const response = await fetchImpl();
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return response.json();
}
```

That helper is the check. `response.ok` is true for 200 through 299.

### Examples

**Case: a 200 response returns the JSON**

```javascript
async function getJson(fetchImpl) {
  const response = await fetchImpl();
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return response.json();
}
const user = await getJson(async () => ({
  ok: true,
  status: 200,
  json: async () => ({ id: "1" }),
}));
```

Result: `{ id: "1" }`.

Why: `ok` is true, so the function parses the body and returns it.

**Case: HTTP 500 fulfills, and the helper throws after the check**

```javascript
async function fakeFetch() {
  return { ok: false, status: 500 };
}
const response = await fakeFetch();

async function getJson(fetchImpl) {
  const next = await fetchImpl();
  if (!next.ok) throw new Error(`request failed: ${next.status}`);
  return next.json();
}
let message = "no throw";
try {
  await getJson(async () => ({ ok: false, status: 404, json: async () => ({}) }));
} catch (error) {
  message = error.message;
}
```

Result: `fakeFetch` fulfills. `response.ok` is `false` and `response.status` is `500`. The later `getJson` call throws, and `message` is `"request failed: 404"`.

Why: `fetch` fulfills on 500 and on 404. The throw comes from the `ok` check inside `getJson`, using that call's status. It is not a network rejection.

**Case: a network failure rejects**

```javascript
async function fakeFetch() {
  throw new TypeError("Failed to fetch");
}
let name = "fulfilled";
try {
  await fakeFetch();
} catch (error) {
  name = error.name;
}
```

Result: `"TypeError"`.

Why: there is no response object. `response.ok` is not available. This is the path where `fetch` rejects.

**Case: 401 and 403 are different callers**

```javascript
function statusLabel(status) {
  if (status === 401) return "not logged in";
  if (status === 403) return "logged in, not allowed";
  return "other";
}
const missing = statusLabel(401);
const forbidden = statusLabel(403);
```

Result: `missing` is `"not logged in"`. `forbidden` is `"logged in, not allowed"`.

Why: 401 means the caller has no session. 403 means the server knows who they are and they are still not allowed.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Treating 404 or 500 as a thrown network error | `fetch` fulfills. `ok` is false | Check `response.ok` before using the body |
| Showing status 500 text to the user | The user sees server details | Show a generic message. Log the status |
| Returning 403 when the caller is not logged in | The client cannot tell "please log in" from "not allowed" | 401 for not logged in. 403 for logged in but not allowed |

### Tip

`response.ok` is the branch that is easy to forget, because the promise already fulfilled. A later test with `ok: false` locks that branch in.

### Practice

Call a fake fetch that returns `{ ok: false, status: 500 }`. Read `ok` and `status` without throwing inside the fake fetch.

### Solution

```javascript
async function fakeFetch() {
  return { ok: false, status: 500 };
}
const response = await fakeFetch();
```

Result: `response.ok` is `false`. `response.status` is `500`. The promise fulfilled.

## 4. JSON

### Concept

`JSON.stringify` drops `undefined` fields and functions. `NaN` becomes `null`. `JSON.parse` throws on invalid text. Keys are strings. Validate the value after parse, then read fields. Do not `await response.json()` on an empty 204.

### Terms

| Value | After `JSON.stringify` |
| --- | --- |
| `{ a: 1 }` | `'{"a":1}'` |
| A field whose value is `undefined` | The field is removed |
| `NaN` | `null` |
| A function field | The field is removed |

### Methods

| Call | Result |
| --- | --- |
| `JSON.stringify(value)` | A string, or `undefined` if the value itself is `undefined` |
| `JSON.parse(text)` | The value, or a throw on invalid text |
| `response.json()` | A promise of the parsed body. The body must be JSON |
| Status 204 | Success with no body. Skip `response.json()` |

### Examples

**Case: `undefined` fields drop out, and `NaN` becomes `null`**

```javascript
const text = JSON.stringify({
  a: 1,
  b: undefined,
  c: NaN,
  d: function () {},
});
```

Result: `'{"a":1,"c":null}'`.

Why: `b` is `undefined`, so the field is omitted. `d` is a function, so it is omitted. `NaN` is not valid JSON, so it becomes `null`.

**Case: invalid text throws**

```javascript
let name = "parsed";
try {
  JSON.parse("{");
} catch (error) {
  name = error.name;
}
```

Result: `"SyntaxError"`.

Why: `JSON.parse` throws on invalid text. It does not return `null` or `undefined`.

**Case: `null` has no `.id`**

```javascript
let name = "read";
try {
  const data = JSON.parse("null");
  const id = data.id;
  name = String(id);
} catch (error) {
  name = error.name;
}
```

Result: `"TypeError"`.

Why: parsed JSON can be any value. Reading `.id` on `null` throws. A number `id` is the wrong type even when the read works. Validate, then read.

**Case: an empty 204 is not parsed**

```javascript
async function read(response) {
  if (response.status === 204) return null;
  return response.json();
}
let jsonCalled = false;
const value = await read({
  status: 204,
  json: async () => {
    jsonCalled = true;
    return {};
  },
});
```

Result: `value` is `null`. `jsonCalled` is `false`.

Why: a 204 body is empty. `response.json()` is for a JSON body. Check the status and skip the parse.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `data.id` when `data` is `null` | `TypeError` | Validate the shape, then read |
| `await response.json()` on an empty 204 | The parse throws | Return before parsing when the status is 204 |
| Expecting an `undefined` field to survive `JSON.stringify` | The field is gone on the other side | Send `null`, or treat a missing field as missing after parse |

### Tip

Check the type you need. `typeof value.id === "string"` rejects a missing id and a numeric id.

### Practice

Parse nothing until you have checked the status. For status 204, return `null`. For status 200, return `response.json()`.

### Solution

```javascript
async function read(response) {
  if (response.status === 204) return null;
  return response.json();
}
const value = await read({
  status: 204,
  json: async () => ({ id: "1" }),
});
```

Result: `null`. `json` is not called.

## 5. Loading, success, error

### Concept

The UI has four states: loading, error, empty, and ready. In the state object, loading is `{ status: "loading" }`, error is `{ status: "error", message }`, and ready is `{ status: "ready", items }`. Empty is a ready state whose `items` array is empty. Empty is not an error. Check the error status before the list. Do not let `items` win over error.

### Terms

| State | What the UI shows |
| --- | --- |
| `loading` | A waiting message |
| `error` | The message. No stack trace |
| `empty` | A finished result with nothing to show. "No alerts" is not an error |
| `ready` | The list, when `items` has rows |

### Methods

| Check | View |
| --- | --- |
| `state.status === "loading"` | `"loading"` |
| `state.status === "error"` | `"error"` |
| `state.status === "ready"` and `items.length === 0` | `"empty"` |
| `state.status === "ready"` and `items.length > 0` | `"list"` |

### Examples

**Case: loading**

```javascript
function view(state) {
  if (state.status === "loading") return "loading";
  if (state.status === "error") return "error";
  if (state.items.length === 0) return "empty";
  return "list";
}
const label = view({ status: "loading" });
```

Result: `"loading"`.

Why: the status is enough. There is no list to read yet.

**Case: an error that still holds items stays an error**

```javascript
function view(state) {
  if (state.status === "loading") return "loading";
  if (state.status === "error") return "error";
  if (state.items.length === 0) return "empty";
  return "list";
}
const label = view({ status: "error", message: "nope", items: [{ id: "1" }] });
```

Result: `"error"`.

Why: the error check runs before the list check. Items do not win over error.

**Case: a ready empty list is empty, not an error**

```javascript
function view(state) {
  if (state.status === "loading") return "loading";
  if (state.status === "error") return "error";
  if (state.items.length === 0) return "empty";
  return "list";
}
const label = view({ status: "ready", items: [] });
```

Result: `"empty"`.

Why: the request succeeded and there is nothing to show. An empty list is a successful result. An error means the request did not succeed.

**Case: checking `items` first hides the error**

```javascript
function badView(state) {
  if (state.items && state.items.length) return "list";
  if (state.status === "error") return "error";
  return "other";
}
const label = badView({ status: "error", message: "nope", items: [{ id: "1" }] });
```

Result: `"list"`.

Why: the items check won. The user sees rows and misses the failure. Check `status === "error"` first.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `error` and `items` both set, and the UI checks `items` first | A failure looks like a list | Check `status === "error"` before `items` |
| An empty array treated as an error | A finished empty result shows an error | Return `"empty"` for ready and `items.length === 0` |
| An empty array treated as loading | A finished empty result spins | `ready` with `[]` is the empty state |

### Tip

One `status` field has one meaning. Two booleans can both be true, and the branch you wrote first is the one the user sees.

### Practice

`view({ status: "ready", items: [{ id: "1" }] })` should return `"list"`. Use the same order of checks as the cases above.

### Solution

```javascript
function view(state) {
  if (state.status === "loading") return "loading";
  if (state.status === "error") return "error";
  if (state.items.length === 0) return "empty";
  return "list";
}
const label = view({ status: "ready", items: [{ id: "1" }] });
```

Result: `"list"`.

## Exercises

See `exercises.md`.

## Quiz

1. Does `fetch` reject when the server returns 500?
2. What is the difference between 401 and 403?
3. What does `await` pause?
4. Why validate JSON before reading `.id`?
5. Why is an empty list different from an error?
