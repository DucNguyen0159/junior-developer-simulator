# Debugging

A bug report is a symptom. Your job is the root cause, a fix, and a sentence someone else can check.

## 1. Read unfamiliar code

Read in this order:

| Step | Question |
| --- | --- |
| 1 | What is the input and the promised output? |
| 2 | Which function owns that promise? |
| 3 | What data is shared across calls (module variables, caches, objects)? |
| 4 | What can the caller mutate after you store it? |
| 5 | What runs later (promise, timer, event)? |

Do not start by rewriting the file.

## 2. Reproduce

A bug you cannot reproduce is a guess. Make the smallest input that shows the wrong output. Write it down before you change code.

| Report | First reproduction to try |
| --- | --- |
| "Wrong user" | Two users, in order, then read the first again |
| "Count is low" | A hand-counted list of 3 events |
| "Sometimes empty" | Call the async function and log the return value immediately |
| "Works locally" | The exact input from the report, including `0`, `""`, and `null` |

## 3. Logging and breakpoints

| Tool | Use it when |
| --- | --- |
| `console.log(label, value)` | You need the value at one line. Label it. Log objects before a later line mutates them |
| `console.table(rows)` | A list of similar objects |
| Breakpoint | You need every local at one moment |
| `debugger` | Same, when you cannot click a line |

Log the input and the return of the suspected function. Logging ten lines is noise.

| Mistake | Fix |
| --- | --- |
| Logging an object after you mutate it | Log a copy, or log the field you care about immediately |
| `console.log(obj)` then assuming the preview is the old value | In the browser the preview updates. Log `JSON.stringify` or one field |

## 4. Trace execution order

Write the order of lines for one call. Include code that runs after the current function returns.

```javascript
let label = "none";
Promise.resolve("ada").then((name) => {
  label = name;
});
// label is still "none" here
```

Synchronous code finishes before a `.then` callback.

## 5. Root cause

| Symptom | A root cause worth naming |
| --- | --- |
| Second user overwrites the first | One object was stored for every user |
| Count includes bad rows | `==` coerced `0` to `false` |
| Summary is `null` | The function returned before `await` |
| Old request wins | A slower response wrote state with no request id |

The root cause is the line and the reason. "The cache is wrong" is a symptom.

## 6. Common JavaScript bugs

| Bug | What you see | Check |
| --- | --- | --- |
| Shared reference | Later write changes an earlier result | Was the object copied before it was stored? |
| Shallow copy | Nested field still changes | Was only the top level copied? |
| `==` | `0` or `""` matches `false` | Should this be `===`? |
| Off-by-one window | Recent events excluded or old ones included | Are units ms or minutes? Is the end exclusive? |
| `sort` in place | The caller's array changes order | Was a copy sorted? |
| Missing `await` | Return value is a promise or `null` | Is the caller reading the value too early? |
| Stale async | An older call finishes last | Is there a request id or an aborted flag? |

## 7. Race conditions

A race is two operations whose result depends on which one finishes last.

```javascript
let latest = 0;

async function load(id, fetchUser) {
  const token = ++latest;
  const user = await fetchUser(id);
  if (token !== latest) return null;
  return user;
}
```

The slower call still finishes. It must not write. Return `null` or ignore the result. Do not cancel work you cannot cancel unless the API supports `AbortController`. Ignoring the stale result is enough for this assessment.

This is the same shape as a late logout finishing after a new login. The fix is "only the newest request may write," not "make the server faster."

| Mistake | What happens |
| --- | --- |
| Setting state in every `.then` | The slower request wins |
| A boolean `loading` with two overlapping calls | The first to finish clears loading while the second is still running |

## 8. Incomplete reports

You will not get a stack trace. Extract what you can:

| Phrase in the report | Working hypothesis | What would disprove it |
| --- | --- | --- |
| "Sometimes" | Order or timing | One user, one call, still wrong |
| "Another user's data" | Shared object or wrong id | Two users, distinct copies, still wrong |
| "After the cache" | Cache key or stored reference | Bug happens with the cache disabled |
| "Count seems low" | Filter, units, or `==` | Hand count matches the function |

Write the hypothesis, the check, and the result. That is the explanation you submit.

## 9. Write the explanation

Use four lines:

1. Symptom: what the user sees.
2. Cause: the line and why it is wrong.
3. Fix: what you changed.
4. Check: the input that failed before and passes now.

| Mistake | Fix |
| --- | --- |
| "Fixed the logic" | Name the comparison, the copy, or the missing `await` |
| Describing only the new code | Say what was wrong |

## Exercises

See `exercises.md`.

## Quiz

1. What is the difference between a symptom and a root cause?
2. Why log a field instead of trusting a live object preview?
3. What does a `.then` callback run relative to the lines after `Promise.resolve().then(...)`?
4. Two loads overlap. Why can the slower one show the wrong user?
5. What four lines belong in a written bug explanation?
