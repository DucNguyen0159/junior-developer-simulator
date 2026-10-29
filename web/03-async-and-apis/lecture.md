# Async and APIs

JavaScript keeps running while a request is in flight. The result arrives later as a promise.

## 1. Promises

A promise is `pending`, then `fulfilled` or `rejected`.

| Method | When it runs | What it returns |
| --- | --- | --- |
| `.then(fn)` | After fulfillment | A new promise of `fn`'s return value |
| `.catch(fn)` | After rejection | A new promise. It fulfills if `fn` does not throw |
| `.finally(fn)` | Either way | Passes the previous result through |
| `Promise.all(list)` | When every promise settles | Array of values, or rejects on the first rejection |
| `Promise.allSettled(list)` | When every promise settles | `{ status, value }` or `{ status, reason }` for each |

```javascript
Promise.resolve(1).then((n) => n + 1); // fulfills with 2
```

| Mistake | What happens |
| --- | --- |
| Forgetting to `return` inside `.then` | The next `.then` receives `undefined` |
| `Promise.all` when one failure should not hide the others | One rejection rejects the whole call. Use `allSettled` to inspect each |

## 2. async/await

`async` functions return a promise. `await` pauses that function, not the thread.

```javascript
async function load(id, fetchUser) {
  const user = await fetchUser(id);
  return user.name;
}
```

A rejected promise becomes a throw at the `await`. Wrap it in `try/catch`.

| Mistake | Fix |
| --- | --- |
| `const data = fetch(url)` without `await` | `data` is a promise. `await` it |
| `try/catch` around a call that is not awaited | The rejection escapes |
| Sequential `await` in a loop when the calls are independent | `Promise.all` when any failure should stop the group |

## 3. fetch, methods, status

`fetch` rejects on network failure. It does **not** reject on HTTP 404 or 500. Check `response.ok` or `response.status`.

| Method | Use | Typical success |
| --- | --- | --- |
| `GET` | Read | 200 |
| `POST` | Create | 201 |
| `PUT` | Replace | 200 |
| `PATCH` | Partial update | 200 |
| `DELETE` | Remove | 200 or 204 |

| Status | Meaning | Who is wrong |
| --- | --- | --- |
| 200 | Read or update worked | — |
| 201 | Created | — |
| 204 | Worked, no body | — |
| 400 | Bad input | Caller |
| 401 | Not logged in | Caller |
| 403 | Logged in, not allowed | Caller |
| 404 | No such resource | Either, often a bad id |
| 500 | Server failed | Server |

```javascript
async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return response.json();
}
```

| Mistake | Fix |
| --- | --- |
| Treating 404 as a thrown network error | Check `response.ok` |
| Showing status 500 text to the user | Show a generic message. Log the status |

## 4. JSON

`JSON.stringify` drops `undefined` fields and functions. `JSON.parse` throws on invalid text. Keys are strings.

| Value | After a JSON round trip |
| --- | --- |
| `{ a: 1 }` | Same shape |
| `undefined` as a field | Field removed |
| `NaN` | `null` |

Validate after parse. Do not trust the shape.

```javascript
function isUser(value) {
  return value !== null && typeof value === "object" && typeof value.id === "string";
}
```

| Mistake | Fix |
| --- | --- |
| `data.name` when `data` is not an object | Validate, then read |
| `await response.json()` on an empty 204 | Check status before parsing |

## 5. Loading, success, error

Keep one state. Do not combine booleans that can disagree.

| State | Show |
| --- | --- |
| `{ status: "loading" }` | A waiting message. Do not show stale data as if it were final unless you mean to |
| `{ status: "error", message }` | The message. No stack trace |
| `{ status: "empty" }` | "No alerts" is not an error |
| `{ status: "ready", items }` | The list |

| Mistake | What the user sees |
| --- | --- |
| `error` and `items` both set, UI checks `items` first | A failure looks like success |
| Empty array treated as loading | A finished empty result spins forever |

## Exercises

See `exercises.md`.

## Quiz

1. Does `fetch` reject when the server returns 500?
2. What is the difference between 401 and 403?
3. What does `await` pause?
4. Why validate JSON before reading `.id`?
5. Why is an empty list different from an error?
