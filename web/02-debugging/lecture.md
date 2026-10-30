# Debugging

A bug report is a symptom. Your job is the root cause, a fix, and a sentence someone else can check.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. The exercises are in `exercises.md`. Do not open `solutions/` first.

## 1. Read unfamiliar code

### Concept

Read in a fixed order before you change anything. Start from the input and the promised output. Find the function that owns that promise. Then find data shared across calls: module variables, caches, and objects. Ask what the caller can mutate after you store it, and what runs later: a promise, a timer, or an event. Do not start by rewriting the file.

### Terms

| Step | Question |
| --- | --- |
| 1 | What is the input and the promised output? |
| 2 | Which function owns that promise? |
| 3 | What data is shared across calls? |
| 4 | What can the caller mutate after you store it? |
| 5 | What runs later? |

### Methods

| Question | Where you look |
| --- | --- |
| Input and output | The exercise statement or the failing assert |
| Owner | The function whose return value is wrong |
| Shared data | `let` at the top of the file, a cache object, a module array |
| Later work | `await`, `.then`, `setTimeout` |

### Examples

**Case: the promised output is a per-user copy**

A function `snapshot(user)` should return a summary that stays put when the caller later edits `user`.

Result: if the summary changes after `user.city = "Tustin"`, the function stored the caller's object. That is the owner of the bug. Rewriting the printer does not fix it.

Why: step 4 asks what the caller can mutate. The answer is the object you stored.

**Case: a module variable is shared**

```javascript
let last = null;
function remember(user) {
  last = user;
  return last;
}
```

Result: `remember(ada)` then `remember(bea)` makes a later read of the first call's object show Bea's fields if both calls received the same object, and `last` is always the newest user.

Why: step 3 asks what is shared across calls. `last` is. Two users need two stored values, or a copy per call.

**Case: work that runs later**

```javascript
function load() {
  return Promise.resolve({ city: "Irvine" });
}
const result = load();
```

Result: `result` is a promise. `result.city` is `undefined` on this line.

Why: step 5 asks what runs later. The city arrives after this function returns. Reading it now is the bug, not the shape of the object.

**Case: do not rewrite first**

The file is 40 lines and one assert fails.

Result: replacing the file with a new design can make that assert pass and break the other four. The read order finds the one wrong line.

Why: the promised output tells you which line is on trial. The rest of the file may already match the other tests.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Rewriting the file before naming the output | You fix a guess | Write the expected output first |
| Searching for `TODO` instead of the failed value | You edit an unrelated comment | Start from the assert |
| Ignoring a module-level `let` | The second call overwrites the first | Step 3, before you touch the algorithm |

### Tip

Write one sentence: "Given this input, this function should return this value." If you cannot, you are not ready to edit.

### Practice

A report says the second user's city appears on the first user's card. Which of the five questions do you ask first about storage?

### Solution

Question 4: what can the caller mutate after you store it, and question 3: what is shared across calls. The usual cause is one stored object.

## 2. Reproduce

### Concept

A bug you cannot reproduce is a guess. Make the smallest input that shows the wrong output. Write it down before you change code. Include `0`, `""`, and `null` when the report says it works locally. Those are the values people leave out.

### Terms

| Term | Meaning |
| --- | --- |
| Reproduction | The smallest input that shows the wrong output |
| Guess | A fix you cannot show on that input |
| Boundary | `0`, empty string, `null`, and the exact limit from the report |

### Methods

| Report | First reproduction to try |
| --- | --- |
| "Wrong user" | Two users, in order, then read the first again |
| "Count is low" | A hand-counted list of 3 events |
| "Sometimes empty" | Call the async function and log the return value immediately |
| "Works locally" | The exact input from the report, including `0`, `""`, and `null` |

### Examples

**Case: two users, then read the first**

```javascript
const store = {};
function save(user) {
  store.current = user;
  return store.current;
}
const ada = { id: "ada", city: "Irvine" };
const first = save(ada);
save({ id: "bea", city: "Tustin" });
ada.city = "Tustin";
console.log(first.id, first.city);
```

Result: `ada Tustin`. `first` is the same object as `ada`, so the caller's later write shows up on the saved card. A reproduction that uses only Ada and never writes again looks fine.

Why: "wrong user" needs two calls and a second read. Here the second call replaces `store.current`, and the caller's edit of `ada` is visible through `first` because `save` did not copy.

**Case: a hand count of three**

Events: two failures and one success. The function returns `1`.

Result: your hand count is `3` or `2`, depending on the rule. The function's `1` is now a fact, not a feeling that the count is low.

Why: write the list down. Then you know which event disappeared.

**Case: log the return immediately**

```javascript
async function load() {
  return "Irvine";
}
console.log(load());
```

Result: the log is a `Promise`, not `"Irvine"`. The report "sometimes empty" was an unread promise.

Why: the immediate log is the reproduction. Waiting and looking at the page hides the order.

**Case: zero is the local input that was skipped**

```javascript
function label(count) {
  if (count) return String(count);
  return "none";
}
console.log(label(0));
```

Result: `none`.

Why: the local demo used `3`. The report used `0`. The reproduction is the report's input.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| One happy-path user | A shared-object bug stays hidden | Two users, then reread the first |
| Changing code before the input is written down | You cannot tell what the fix changed | Save the input first |
| Skipping `0` and `""` | The bug "works locally" | Use the report's values |

### Tip

The reproduction is a few lines you can run again after the fix. If it cannot be run, it is not a reproduction.

### Practice

Write the two-call reproduction for "the second user overwrites the first" in one sentence.

### Solution

Call the function with Ada, call it with Bea, then read Ada's result again. It should still describe Ada.

## 3. Logging and breakpoints

### Concept

Log the input and the return of the suspected function. Label the log. Log a field, or a copy, before a later line mutates the object. In the browser, `console.log(obj)` keeps a live preview: the panel updates when the object changes, so it does not prove what the object was at that line. A breakpoint shows every local at one moment. `debugger` is the same when you cannot click the line. Logging ten lines is noise.

### Terms

| Term | Meaning |
| --- | --- |
| Label | A string that says which line printed |
| Live preview | The browser object view updates after later mutations |
| Breakpoint | Pause and read every local |
| `debugger` | A breakpoint written in the file |

### Methods

| Tool | Use it when |
| --- | --- |
| `console.log(label, value)` | You need the value at one line |
| `console.table(rows)` | A list of similar objects |
| Breakpoint | You need every local at one moment |
| `JSON.stringify(obj)` | You need the object as it was at that line |

### Examples

**Case: a label on the return**

```javascript
function parse(text) {
  const n = Number(text);
  console.log("parse", text, n);
  return n;
}
parse("10px");
```

Result: `parse 10px NaN`.

Why: the label `parse` tells you which function printed. The input and the number are the whole story. A bare `NaN` later in the file does not.

**Case: the live preview lies**

```javascript
const card = { city: "Irvine" };
console.log(card);
card.city = "Tustin";
```

Result: in Node, the log usually shows `Irvine` because it prints immediately. In the browser, expanding the logged object can show `Tustin`.

Why: the preview is the object now, not the object then. Log `card.city` on the same line, or `JSON.stringify(card)`.

**Case: log before the mutation**

```javascript
function store(card) {
  console.log("stored", card.city);
  card.city = "edited";
  return card;
}
```

Result: the log is the city the caller passed. A log after the assignment shows `edited` and hides the input.

Why: log the field you care about at the moment you care about.

**Case: ten logs**

Logging every line of a 30-line function.

Result: the failing value is in the noise. You still do not know which line is wrong.

Why: log the input and the return of the suspected function. Add a third log only for the branch you are testing.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Logging an object after you mutate it | You see the new value and blame the wrong line | Log a copy, or log the field immediately |
| `console.log(obj)` then assuming the preview is the old value | In the browser the preview updates | `JSON.stringify`, or one field |
| An unlabeled log | You cannot tell which call printed | A label string |

### Tip

One labeled log of the input and one of the return beat a page of unlabeled objects.

### Practice

Log `Number("10px")` with the label `parse` so the line is obvious.

### Solution

```javascript
console.log("parse", Number("10px"));
```

Result: `parse NaN`.

## 4. Trace execution order

### Concept

Write the order of lines for one call. Include code that runs after the current function returns. Synchronous code finishes before a `.then` callback. `await` pauses that function only. The lines after the call, in the caller, keep going.

### Terms

| Term | Meaning |
| --- | --- |
| Synchronous | Runs before the function returns |
| `.then` | A callback after the current turn |
| Order | The sequence you write down, not the sequence you hope for |

### Methods

| Tool | What you write |
| --- | --- |
| Line numbers | The order they actually run |
| A mark after `Promise.resolve().then` | "not yet" on the next line |
| `await` in the caller | The caller stops. Other callers do not |

### Examples

**Case: the callback is later**

```javascript
let label = "none";
Promise.resolve("ada").then((name) => {
  label = name;
});
console.log(label);
```

Result: `none`.

Why: the log runs in this turn. The `.then` callback runs after it. A second log after a real wait would show `ada`.

**Case: two synchronous lines stay in order**

```javascript
console.log("a");
console.log("b");
```

Result:

```text
a
b
```

Why: nothing yielded. The trace is the source order.

**Case: `await` in one function does not freeze the next call**

```javascript
async function load(name) {
  await Promise.resolve();
  console.log(name);
}
load("ada");
load("bea");
console.log("called");
```

Result:

```text
called
ada
bea
```

Why: both `load` calls hit `await` and return a promise. `called` prints before either name. Then the callbacks run in the order they were scheduled.

**Case: a trace that skips the callback**

You write "line 1, line 2, return the name" for a function that sets the name inside `.then`.

Result: the trace is wrong. The return happens before the name is set.

Why: a line inside `.then` gets its own step, after the return.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Reading top to bottom across `.then` as if it were one stack | You think `label` is already `ada` | Put the callback after the current function in the trace |
| Assuming `await` stops the process | Other calls still run | Trace each call separately |
| Forgetting the line after the call | You miss work that used the promise too early | Include the caller's next line |

### Tip

If a value is still the default on the next line, the assignment is in a callback you have not reached.

### Practice

In the `label = "none"` example, what does the `console.log` print?

### Solution

`none`. The assignment to `ada` has not run.

## 5. Root cause

### Concept

The root cause is the line and the reason. "The cache is wrong" is a symptom. A cause you can check names the comparison, the shared object, the missing `await`, or the missing request id.

### Terms

| Term | Meaning |
| --- | --- |
| Symptom | What the user sees |
| Root cause | The line and why that line produces the symptom |
| Check | An input that failed before the fix and passes after |

### Methods

| Symptom | A root cause worth naming |
| --- | --- |
| Second user overwrites the first | One object was stored for every user |
| Count includes bad rows | `==` coerced `0` to `false` |
| Summary is `null` | The function returned before `await` |
| Old request wins | A slower response wrote state with no request id |

### Examples

**Case: one object for every user**

`cache.user = user` inside a function called for Ada and then Bea.

Result: the cache's user is Bea. Ada's card reads Bea's city if it reads `cache.user`.

Why: the line stores a reference in one slot. The cause is that line, not "the cache is wrong."

**Case: `==` and a zero**

```javascript
const row = { success: 0 };
console.log(row.success == false);
```

Result: `true`. A filter that treats that as "failed" includes a row the product did not call a failure.

Why: the cause is `==`, not "the count is high."

**Case: return before `await`**

```javascript
async function summary(load) {
  const pending = load();
  return pending.name;
}
```

Result: `undefined` or a throw, because `pending` is a promise and `name` is not on it yet.

Why: the cause is the missing `await`. The symptom is a null summary.

**Case: no request id**

Two calls, the slower one writes `label` last.

Result: the screen shows the older user.

Why: the cause is the write that does not check which call is newest. "The server is slow" is not the cause.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Naming the cache, the count, or the screen | You restated the symptom | Name the line |
| A cause you cannot show | The next person cannot check it | Tie it to the reproduction |
| Fixing a nearby line that is ugly but correct | The bug remains | Stay on the line that produces the bad value |

### Tip

Finish the sentence: "This line is wrong because ___." If the blank is "it doesn't work," you do not have the cause yet.

### Practice

The second user overwrites the first. Write the cause in one sentence.

### Solution

One object was stored for every user, so the second call's fields replaced the first user's fields.

## 6. Common JavaScript bugs

### Concept

The same few bugs show up in unfamiliar files. Check them in order: shared reference, shallow copy, `==`, off-by-one window, in-place `sort`, missing `await`, stale async. Each one has a visible result.

### Terms

| Bug | What you see | Check |
| --- | --- | --- |
| Shared reference | Later write changes an earlier result | Was the object copied before it was stored? |
| Shallow copy | Nested field still changes | Was only the top level copied? |
| `==` | `0` or `""` matches `false` | Should this be `===`? |
| Off-by-one window | Recent events excluded or old ones included | Are units ms or minutes? Is the end exclusive? |
| `sort` in place | The caller's array changes order | Was a copy sorted? |
| Missing `await` | Return value is a promise or `null` | Is the caller reading the value too early? |
| Stale async | An older call finishes last | Is there a request id or an aborted flag? |

### Methods

| Check | The question |
| --- | --- |
| Copy | Does the stored object `===` the caller's object? |
| Units | Is the window `minutes * 60 * 1000` or a bare `minutes` compared with milliseconds? |
| End | Is `now` included or excluded? |
| Identity | Does the write compare a token to the latest token? |

### Examples

**Case: a 10-minute window in the wrong unit**

```javascript
const now = 1_000_000;
const tenMinutes = 10 * 60 * 1000;
const eventAt = now - 60 * 1000;
console.log(eventAt > now - 10);
console.log(eventAt > now - tenMinutes);
```

Result: `false`, then `true`. An event from one minute ago is outside a 10-millisecond window and inside a 10-minute window.

Why: the symptom is "count is low" or "count is high." The cause is the unit.

**Case: an exclusive end**

```javascript
const now = 1000;
const happened = 1000;
console.log(happened < now);
console.log(happened <= now);
```

Result: `false`, then `true`. An event at exactly `now` is dropped by `<` and kept by `<=`.

Why: write the boundary event down. One millisecond decides it.

**Case: sort in place**

```javascript
function ordered(nums) {
  return nums.sort((a, b) => a - b);
}
const input = [3, 1];
console.log(ordered(input));
console.log(input);
```

Result: both logs are `[1, 3]`.

Why: `sort` edited `input`. The caller sees the new order. Return `[...nums].sort(...)`.

**Case: shallow copy**

`const copy = { ...event }` and then `event.meta.ip` changes.

Result: `copy.meta.ip` changes too.

Why: the top object is new. `meta` is shared. The check is "was only the top level copied?"

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Treating every wrong count as a filter bug | The window unit is wrong | Check ms versus minutes |
| Copying and still sharing `meta` | The nested field moves | Copy the nested object, or `structuredClone` |
| `sort` on the argument | The caller's array changes | Sort a copy |

### Tip

Walk the table once before you invent a new theory. Most of these bugs are in it.

### Practice

`now` is milliseconds and the window is 10 minutes. What do you subtract?

### Solution

`10 * 60 * 1000`. Subtracting `10` keeps a 10-millisecond window.

## 7. Race conditions

### Concept

A race is two operations whose result depends on which one finishes last. The slower call still finishes. It must not write. Return `null` or ignore the result. Do not cancel work you cannot cancel unless the API supports `AbortController`. Ignoring the stale result is enough. This is the same shape as a late logout finishing after a new login. The fix is "only the newest request may write," not "make the server faster."

### Terms

| Term | Meaning |
| --- | --- |
| Race | The result depends on finish order |
| Token | A number captured at the start of a call |
| Latest | The token of the newest call |
| Stale | A call whose token is no longer latest |

### Methods

| Piece | Role |
| --- | --- |
| `++latest` | Take a token and record it as newest |
| `await` | The gap where another call can start |
| `token !== latest` | This result is stale. Do not write |
| `return null` | The caller can ignore it |

### Examples

**Case: the slower call must not write**

```javascript
let latest = 0;
async function load(id, fetchUser) {
  const token = ++latest;
  const user = await fetchUser(id);
  if (token !== latest) return null;
  return user;
}
```

Result: start Ada with a slow `fetchUser`, then Bea with a fast one. Bea's token is `2`. Ada's fetch resolves later, her token is `1`, and she returns `null`. The caller that only stores non-null results keeps Bea.

Why: both fetches finish. The `if` is what stops the old user from being written.

**Case: writing in every `.then`**

```javascript
let label = "none";
function show(name, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      label = name;
      resolve(name);
    }, delay);
  });
}
```

Result: `show("ada", 30)` then `show("bea", 10)` leaves `label` as `ada` if you read it after both timers. Bea painted first. Ada painted last and won.

Why: every completion writes. There is no token.

**Case: a boolean `loading`**

Two overlapping calls share `loading`. The first to finish sets `loading` to false.

Result: the UI says it is done while the second call is still running. A third render can show the first call's data.

Why: one boolean cannot represent two in-flight calls. A token can.

**Case: you cannot cancel, so you ignore**

`fetchUser` has no `AbortController`.

Result: the slow request still spends its time. The screen does not have to show it. `return null` is the fix in this assessment.

Why: cancelling is optional. Not writing the stale result is the requirement.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Setting state in every `.then` | The slower request wins | Compare the token to `latest` |
| A boolean `loading` with two overlapping calls | The first to finish clears loading while the second is still running | Count the calls, or ignore stale results |
| Speeding up the server as the fix | The slower call can still finish last | Only the newest request may write |

### Tip

Capture the token before the `await`. Check it after the `await`. The gap between those two lines is the race.

### Practice

In the `load` example, Ada's token is `1`, Bea starts and finishes, then Ada's fetch returns. What does Ada's call return?

### Solution

`null`. `latest` is `2`, and Ada's token is `1`.

## 8. Incomplete reports

### Concept

You will not get a stack trace. Extract a hypothesis from the words in the report, name the check that would disprove it, and write the result of that check. "Sometimes" points at order or timing. "Another user's data" points at a shared object or a wrong id. "After the cache" points at a cache key or a stored reference. "Count seems low" points at a filter, the units, or `==`.

### Terms

| Phrase in the report | Working hypothesis | What would disprove it |
| --- | --- | --- |
| "Sometimes" | Order or timing | One user, one call, still wrong |
| "Another user's data" | Shared object or wrong id | Two users, distinct copies, still wrong |
| "After the cache" | Cache key or stored reference | Bug happens with the cache disabled |
| "Count seems low" | Filter, units, or `==` | Hand count matches the function |

### Methods

| Step | What you write |
| --- | --- |
| Hypothesis | One sentence from the phrase |
| Check | The input that would disprove it |
| Result | What that input did |

### Examples

**Case: "sometimes"**

```text
Hypothesis: finish order.
Check: one user, one call.
```

Result: one user and one call produce the right card every time. The hypothesis stands. Two overlapping calls show the bug. If one user and one call are already wrong, timing is not the cause.

Why: the disproof is in the table. Run it before you add a request id.

**Case: "another user's data"**

```text
Hypothesis: one stored object.
Check: two users, distinct copies, then read the first user again.
```

Result: you store a copy per user and the bug disappears. If distinct copies still show the other user's city, the id used in the lookup is wrong. That disproof moves you to the next hypothesis.

Why: do not keep the shared-object theory after the copies are distinct and the bug remains.

**Case: "after the cache"**

```text
Hypothesis: the cache key ignores the user id, or the cache stores a reference.
Check: disable the cache and call once.
```

Result: with the cache disabled, a single call is correct. The bug is in the cache. If the bug remains with the cache disabled, stop looking at the cache.

Why: the phrase "after the cache" is a hint, not a verdict.

**Case: "count seems low"**

```text
Hand count: 3 events.
Function: 1.
```

Result: the hand count does not match. Look at the filter, the window units, and `==`. If the hand count matches, the report's "low" is a misunderstanding of the rule, and you say so.

Why: write both numbers. The gap between them is the bug.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Treating the phrase as the cause | You "fix" the cache when the cache is off and the bug remains | Run the disproof |
| A hypothesis with no check | You cannot finish the explanation | Add the input that would prove you wrong |
| Inventing a stack trace | The report did not include one | Use the words you have |

### Tip

A hypothesis is finished only when you can say what would disprove it.

### Practice

The report says "sometimes the list is empty." What is the first disproof to try?

### Solution

One user, one call. If that is already empty, the cause is not timing. If that call is fine, overlap the calls.

## 9. Write the explanation

### Concept

Use four lines. Symptom: what the user sees. Cause: the line and why it is wrong. Fix: what you changed. Check: the input that failed before and passes now. "Fixed the logic" is not a fix line. Name the comparison, the copy, or the missing `await`.

### Terms

| Line | Contents |
| --- | --- |
| Symptom | What the user sees |
| Cause | The line and why it is wrong |
| Fix | What you changed |
| Check | The input that failed and now passes |

### Methods

| Bad line | What is missing |
| --- | --- |
| "Fixed the logic" | The comparison, the copy, or the `await` |
| Only the new code | What was wrong |
| A check you did not run | The proof |

### Examples

**Case: a complete note**

```text
Symptom: Bea's city appears on Ada's card.
Cause: cache.current = user stores the caller's object.
Fix: store { ...user } for each id.
Check: save Ada, save Bea, read Ada. The city is Irvine.
```

Result: someone else can run the check without reading your mind. The city on Ada's card stays Irvine.

Why: someone else can run the check without reading your mind.

**Case: "fixed the logic"**

```text
Fix: Fixed the logic.
```

Result: the reader does not know whether you changed `==`, the copy, or the `await`. The note fails.

Why: name the change.

**Case: only the new code**

```text
The function now copies the user.
```

Result: the reader does not know the old line stored a reference. The symptom is missing too.

Why: the new code is the fix line. It is not the whole note.

**Case: a check that matches the report**

```text
Report: two users.
Check written: one user, city Irvine.
```

Result: that check could have passed before the fix. It does not support the note.

Why: the check is the reproduction from section 2.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| "Fixed the logic" | Nobody can review it | Name the comparison, the copy, or the missing `await` |
| Describing only the new code | The cause is missing | Say what was wrong |
| A check that never failed | It does not show the fix | Use the input from the report |

### Tip

If you delete the cause line and the note still makes sense, you described the feature, not the bug.

### Practice

Write the four lines for a count that included rows where `success == false` matched `success: 0`.

### Solution

Symptom: the failure count is high.

Cause: `success == false` is true when `success` is `0`.

Fix: compare with `===`.

Check: a row `{ success: 0 }` is not counted as a failure. A row `{ success: false }` still is.

## Exercises

See `exercises.md`.

## Quiz

1. What is the difference between a symptom and a root cause?
2. Why log a field instead of trusting a live object preview?
3. What does a `.then` callback run relative to the lines after `Promise.resolve().then(...)`?
4. Two loads overlap. Why can the slower one show the wrong user?
5. What four lines belong in a written bug explanation?
