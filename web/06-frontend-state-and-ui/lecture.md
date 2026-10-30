# Frontend state and UI

The browser draws what you describe. It is not the place that decides whether a user is allowed. It is the place that shows the decision.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`.

## 1. DOM

### Concept

The DOM is the browser's tree of elements. `document.querySelector` returns the first match, or `null`. Set user text and server alert text with `textContent`. `textContent` does not parse HTML. These calls need a browser. The exercises in this folder use plain functions so Node can run them.

### Terms

| Call | Result |
| --- | --- |
| `document.querySelector("#alert")` | The first match, or `null` |
| `el.textContent = message` | Replaces the text. Does not parse HTML |
| `el.innerHTML = message` | Parses HTML. Do not put user or server alert text here |
| `el.addEventListener("click", fn)` | Runs `fn` on click |
| `event.preventDefault()` | Stops a form's navigation |

### Methods

| Situation | What you do |
| --- | --- |
| The selector misses | Leave the element alone. The value is `null` |
| Alert text from the server | `textContent` |
| A form submit you handle in script | `preventDefault`, then validate |

### Examples

**Case: a missing element is `null`, and writing throws**

```javascript
const el = null;
let name = "set";
try {
  el.textContent = "Hi";
} catch (error) {
  name = error.name;
}
```

Result: `"TypeError"`.

Why: `querySelector` can be `null`. Reading or writing `textContent` on `null` throws. Check before you write.

**Case: `textContent` keeps the characters**

```javascript
function setMessage(el, message) {
  if (el == null) return { set: false };
  el.textContent = message;
  return { set: true, text: el.textContent };
}
const missed = setMessage(null, "Hi");
const set = setMessage({ textContent: "" }, "<b>Hi</b>");
```

Result: `missed` is `{ set: false }`. `set` is `{ set: true, text: "<b>Hi</b>" }`.

Why: the null check skips the write. The string `<b>Hi</b>` stays text. `innerHTML` is the call that parses tags. Alert text from the user or the server goes through `textContent`.

**Case: `preventDefault` marks the event**

```javascript
function onSubmit(event) {
  event.preventDefault();
  return event.defaultPrevented;
}
const event = {
  defaultPrevented: false,
  preventDefault() {
    this.defaultPrevented = true;
  },
};
const stopped = onSubmit(event);
```

Result: `true`.

Why: the form's navigation is stopped. The handler can validate and show an error instead.

**Case: a found element receives the server message as text**

```javascript
function setMessage(el, message) {
  if (el == null) return { set: false };
  el.textContent = message;
  return { set: true, text: el.textContent };
}
const view = setMessage({ textContent: "" }, "Could not load alerts.");
```

Result: `{ set: true, text: "Could not load alerts." }`.

Why: the message is the text of the element. The exercises call the same kind of plain function, so Node can run them without a browser.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `innerHTML` with an alert message from the server | The message is parsed as HTML | `textContent` |
| `querySelector` assumed to exist | `TypeError` when the element is missing | Check for `null` before writing |
| Skipping `preventDefault` on a submit you handle | The browser navigates away | Call `preventDefault`, then validate |

### Tip

If the exercise file is run with Node, it will pass you strings and objects. It will not pass you `document`.

### Practice

`setMessage(null, "Hi")` and `setMessage({ textContent: "" }, "Hi")` with the function from the cases.

### Solution

```javascript
function setMessage(el, message) {
  if (el == null) return { set: false };
  el.textContent = message;
  return { set: true, text: el.textContent };
}
const missed = setMessage(null, "Hi");
const set = setMessage({ textContent: "" }, "Hi");
```

Result: `missed` is `{ set: false }`. `set` is `{ set: true, text: "Hi" }`.

## 2. Components and props

### Concept

A component is a function of its inputs. Props are those inputs. The child reads them and does not reassign the parent's object. You can pass this assessment without writing Vue. If you see a Vue file: `ref` is a box, you read `.value` in script, the template unwraps it, and `v-if` is conditional rendering.

### Terms

| Idea | React | Vue 3 |
| --- | --- | --- |
| One component | `function Alert({ message }) { return <p>{message}</p>; }` | `<script setup>` plus a template |
| Inputs | Function arguments (props) | `defineProps` |
| Local state | `useState` | `ref` or `reactive` |
| Derived value | Compute it during render | `computed` |
| Show or hide | `condition ? <A /> : null` or `&&` | `v-if` |
| List | `items.map` with a stable `key` | `v-for` with `:key` |
| Parent to child | Props | Props |
| Child to parent | Callback prop | `emit` |

### Methods

| Rule | Plain-function form used in the exercises |
| --- | --- |
| Do not mutate a prop object | Return a new object |
| Vue `ref` | A box. Script uses `.value`. The template unwraps it |
| `v-if` | Render the node only when the condition is true |
| List identity | A stable id. An index sticks to the wrong row after a reorder |

### Examples

**Case: mutating a prop object changes the parent**

```javascript
function child(props) {
  props.user.city = "Tustin";
  return props.user.city;
}
const parent = { user: { city: "Irvine" } };
const city = child(parent);
```

Result: `city` is `"Tustin"`. `parent.user.city` is `"Tustin"`.

Why: `props.user` and `parent.user` are the same object. The child wrote through the parent's object.

**Case: a new object leaves the parent alone**

```javascript
function child(props) {
  return { ...props.user, city: "Tustin" };
}
const parent = { user: { city: "Irvine" } };
const returned = child(parent);
```

Result: `parent.user.city` is `"Irvine"`. `returned.city` is `"Tustin"`.

Why: the child returned a copy. The parent's object was not reassigned and its field was not written.

**Case: a Vue `ref` is a box**

```javascript
const count = { value: 0 };
function increment() {
  count.value += 1;
  return count.value;
}
const shownInScript = increment();
```

Result: `1`.

Why: in script you read the box through `.value`. A Vue template unwraps the same ref, so the template reads `1` without writing `.value`. `v-if` is a separate rule: it shows or hides a node.

**Case: `v-if` renders only when the condition is true**

```javascript
function show(ok, node) {
  if (!ok) return null;
  return node;
}
const hidden = show(false, { tag: "p" });
const visible = show(true, { tag: "p" });
```

Result: `hidden` is `null`. `visible` is `{ tag: "p" }`.

Why: `v-if` is conditional rendering. A false condition leaves the node out. A true condition renders it.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Mutating a prop object | The parent sees the change, or the next render overwrites you | Return a new object |
| `key={index}` when the list is reordered | State sticks to the wrong row | Use a stable id |
| Reading a Vue `ref` without `.value` in script | You change the box, not the number inside it | In script, read and write `.value` |

### Tip

The exercises stay plain functions so Node can run them. The React and Vue columns are the comparison for when you read a component file.

### Practice

Call `show(false, { tag: "p" })` and `child({ user: { city: "Irvine" } })` from the copy case. Say what the parent city is after the copy.

### Solution

```javascript
function show(ok, node) {
  if (!ok) return null;
  return node;
}
function child(props) {
  return { ...props.user, city: "Tustin" };
}
const parent = { user: { city: "Irvine" } };
const hidden = show(false, { tag: "p" });
const returned = child(parent);
```

Result: `hidden` is `null`. `parent.user.city` is `"Irvine"`. `returned.city` is `"Tustin"`.

## 3. State

### Concept

One piece of state should have one meaning. Use one `status` field: `loading`, `error`, or `ready`. Do not use two booleans. An unknown action returns the current state.

### Terms

| Status | Fields you may read |
| --- | --- |
| `loading` | None of the old list, unless you are deliberately keeping it |
| `error` | `message` |
| `ready` | `items` |

### Methods

| Action | Next state |
| --- | --- |
| `{ type: "loading" }` | `{ status: "loading" }` |
| `{ type: "error", message }` | `{ status: "error", message }` |
| `{ type: "ready", items }` | `{ status: "ready", items }` |
| Anything else | The same `current` object |

### Examples

**Case: loading replaces the previous state**

```javascript
function nextState(current, action) {
  if (action.type === "loading") return { status: "loading" };
  if (action.type === "error") return { status: "error", message: action.message };
  if (action.type === "ready") return { status: "ready", items: action.items };
  return current;
}
const next = nextState({ status: "ready", items: [{ code: "a" }] }, { type: "loading" });
```

Result: `{ status: "loading" }`.

Why: one status replaced the ready state. The next object has no `items` field.

**Case: error replaces the previous state**

```javascript
function nextState(current, action) {
  if (action.type === "loading") return { status: "loading" };
  if (action.type === "error") return { status: "error", message: action.message };
  if (action.type === "ready") return { status: "ready", items: action.items };
  return current;
}
const current = { status: "ready", items: [] };
const next = nextState(current, { type: "error", message: "nope" });
```

Result: `{ status: "error", message: "nope" }`. `next === current` is `false`.

Why: error is a new object. The old ready state is not merged in, so the UI cannot see both.

**Case: two booleans can both be true**

```javascript
function branch(state) {
  if (state.isLoading) return "loading";
  if (state.isError) return "error";
  return "ready";
}
const label = branch({ isLoading: true, isError: true });
```

Result: `"loading"`.

Why: both booleans are true. The first branch wins, and the error is hidden. One `status` field cannot be both `loading` and `error`.

**Case: an unknown action returns the current object**

```javascript
function nextState(current, action) {
  if (action.type === "loading") return { status: "loading" };
  if (action.type === "error") return { status: "error", message: action.message };
  if (action.type === "ready") return { status: "ready", items: action.items };
  return current;
}
const current = { status: "ready", items: [] };
const next = nextState(current, { type: "nope" });
```

Result: `next === current` is `true`. `next` is `{ status: "ready", items: [] }`.

Why: the action is not one of the three types. The function returns `current` unchanged.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `isLoading` and `isError` both true | The branch you wrote first wins, and it may be the wrong one | One `status`: `loading`, `error`, or `ready` |
| Storing alerts inside the user object and mutating it | A later render shows a half-updated user | Replace state with a new object from `nextState` |
| Falling through an unknown action into `ready` | A typo wipes the current screen | Return `current` |

### Tip

`loading` and `error` replace the previous state. They do not keep the old `items` beside the new status.

### Practice

`nextState({ status: "loading" }, { type: "ready", items: [] })`.

### Solution

```javascript
function nextState(current, action) {
  if (action.type === "loading") return { status: "loading" };
  if (action.type === "error") return { status: "error", message: action.message };
  if (action.type === "ready") return { status: "ready", items: action.items };
  return current;
}
const next = nextState({ status: "loading" }, { type: "ready", items: [] });
```

Result: `{ status: "ready", items: [] }`.

## 4. Forms

### Concept

Read the field, then validate, then submit. Show the error next to the field. Do not send the form when validation fails. The server still validates. The client check is so the user gets a fast message.

### Terms

| Check | Reject |
| --- | --- |
| Required text | `""` and whitespace |
| Choice | A value not in the allowed list |
| Number | `NaN`, or a number outside the range |

### Methods

| Call | Returns |
| --- | --- |
| `fieldError(value, allowed)` | `"Required"`, `"Choose a listed value"`, or `null` |
| `numberError(value, min, max)` | `"Not a number"`, `"Out of range"`, or `null` |
| `submit(value, allowed)` | `{ sent: false, error }` when `fieldError` returns a string |

### Examples

**Case: whitespace is required**

```javascript
function fieldError(value, allowed) {
  if (value.trim() === "") return "Required";
  if (!allowed.includes(value)) return "Choose a listed value";
  return null;
}
const error = fieldError("  ", ["US"]);
```

Result: `"Required"`.

Why: `trim()` is empty. The field was left blank.

**Case: a choice has to be in the list**

```javascript
function fieldError(value, allowed) {
  if (value.trim() === "") return "Required";
  if (!allowed.includes(value)) return "Choose a listed value";
  return null;
}
const error = fieldError("CA", ["US"]);
```

Result: `"Choose a listed value"`.

Why: `"CA"` is non-blank and it is not in `allowed`.

**Case: a listed value submits**

```javascript
function fieldError(value, allowed) {
  if (value.trim() === "") return "Required";
  if (!allowed.includes(value)) return "Choose a listed value";
  return null;
}
function submit(value, allowed) {
  const error = fieldError(value, allowed);
  if (error) return { sent: false, error };
  return { sent: true, error: null };
}
const blocked = submit("  ", ["US"]);
const sent = submit("US", ["US"]);
```

Result: `fieldError("US", ["US"])` is `null`. `blocked` is `{ sent: false, error: "Required" }`. `sent` is `{ sent: true, error: null }`.

Why: `null` means the field is valid, so the form can be sent. A string error means it is not sent.

**Case: `NaN` and a number outside the range**

```javascript
function numberError(value, min, max) {
  if (Number.isNaN(value)) return "Not a number";
  if (value < min || value > max) return "Out of range";
  return null;
}
const nan = numberError(NaN, 0, 10);
const high = numberError(11, 0, 10);
const zero = numberError(0, 0, 10);
```

Result: `nan` is `"Not a number"`. `high` is `"Out of range"`. `zero` is `null`.

Why: `Number.isNaN` catches `NaN`. `0` is inside `0..10`, so it is allowed.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Sending the form when `fieldError` returns a string | The user waits on a request the client already knows is bad | Return `{ sent: false, error }` |
| Treating `"   "` as a choice | A blank field passes the list check | `trim()` first and return `"Required"` |
| Using `value === NaN` | The check is never true | `Number.isNaN(value)` |

### Tip

The client message is for speed. The server still validates the same field.

### Practice

`fieldError("CA", ["US", "CA"])`.

### Solution

```javascript
function fieldError(value, allowed) {
  if (value.trim() === "") return "Required";
  if (!allowed.includes(value)) return "Choose a listed value";
  return null;
}
const error = fieldError("CA", ["US", "CA"]);
```

Result: `null`.

## 5. Rendering security alerts

### Concept

`alertView` turns state into a view model. `loading` returns `{ view: "loading" }`. `error` returns `{ view: "error", message }`. Otherwise copy `state.items`, sort high before medium with rank high = 2 and medium = 1, and do not mutate `state.items`. An empty copy returns `{ view: "empty" }`. A list item has only `code`, `severity`, and `message`. Drop `ip` and `userAgent`.

The UI copy is `"Checking your account…"` for loading, the error message as text, `"No unusual sign-in activity."` for empty, then severity then message for each list item.

### Terms

| View model | UI |
| --- | --- |
| `{ view: "loading" }` | `Checking your account…` |
| `{ view: "error", message }` | That message, as text |
| `{ view: "empty" }` | `No unusual sign-in activity.` |
| `{ view: "list", items }` | One block per alert: severity, then message |

### Methods

```javascript
function rank(severity) {
  return severity === "high" ? 2 : 1;
}

function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}
```

`[...state.items]` is the copy. The sort runs on the copy.

### Examples

**Case: loading**

```javascript
function rank(severity) {
  return severity === "high" ? 2 : 1;
}
function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}
function render(viewModel) {
  if (viewModel.view === "loading") return "Checking your account…";
  if (viewModel.view === "error") return viewModel.message;
  if (viewModel.view === "empty") return "No unusual sign-in activity.";
  return viewModel.items.map((item) => item.severity + " " + item.message).join("\n");
}
const viewModel = alertView({ status: "loading" });
const text = render(viewModel);
```

Result: `viewModel` is `{ view: "loading" }`. `text` is `"Checking your account…"`.

Why: loading is the first branch. The UI shows the waiting sentence.

**Case: error shows the message as text**

```javascript
function rank(severity) {
  return severity === "high" ? 2 : 1;
}
function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}
function render(viewModel) {
  if (viewModel.view === "loading") return "Checking your account…";
  if (viewModel.view === "error") return viewModel.message;
  if (viewModel.view === "empty") return "No unusual sign-in activity.";
  return viewModel.items.map((item) => item.severity + " " + item.message).join("\n");
}
const viewModel = alertView({ status: "error", message: "Could not load alerts." });
const text = render(viewModel);
```

Result: `viewModel` is `{ view: "error", message: "Could not load alerts." }`. `text` is `"Could not load alerts."`.

Why: the error branch returns that message. The UI prints it as text, which is a `textContent` assignment, not `innerHTML`.

**Case: an empty ready list**

```javascript
function rank(severity) {
  return severity === "high" ? 2 : 1;
}
function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}
function render(viewModel) {
  if (viewModel.view === "loading") return "Checking your account…";
  if (viewModel.view === "error") return viewModel.message;
  if (viewModel.view === "empty") return "No unusual sign-in activity.";
  return viewModel.items.map((item) => item.severity + " " + item.message).join("\n");
}
const viewModel = alertView({ status: "ready", items: [] });
const text = render(viewModel);
```

Result: `viewModel` is `{ view: "empty" }`. `text` is `"No unusual sign-in activity."`.

Why: the copy is empty, so the view is empty. An empty list is not an error.

**Case: high sorts before medium, and `ip` stays off the list**

```javascript
function rank(severity) {
  return severity === "high" ? 2 : 1;
}
function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}
function render(viewModel) {
  if (viewModel.view === "loading") return "Checking your account…";
  if (viewModel.view === "error") return viewModel.message;
  if (viewModel.view === "empty") return "No unusual sign-in activity.";
  return viewModel.items.map((item) => item.severity + " " + item.message).join("\n");
}
const items = [
  { code: "new-country", severity: "medium", message: "New country.", ip: "1.1.1.1", userAgent: "x" },
  { code: "impossible-travel", severity: "high", message: "Two countries.", ip: "2.2.2.2" },
];
const before = items.map((item) => item.code).join(",");
const viewModel = alertView({ status: "ready", items });
const after = items.map((item) => item.code).join(",");
const text = render(viewModel);
```

Result: `before` and `after` are both `"new-country,impossible-travel"`. `viewModel.items[0]` is `{ code: "impossible-travel", severity: "high", message: "Two countries." }`. `viewModel.items[1]` is `{ code: "new-country", severity: "medium", message: "New country." }`. `text` is `"high Two countries.\nmedium New country."`. Neither item has `ip` or `userAgent`.

Why: rank high is 2 and rank medium is 1, so high sorts first. The sort runs on a copy, so `state.items` stays in the original order. The map keeps `code`, `severity`, and `message`. The UI prints severity, then the message.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Sorting `state.items` in place | The stored list changes order | Copy with `[...state.items]`, then sort |
| Rendering the event object | `ip` and `userAgent` reach the screen | Map to `code`, `severity`, and `message` |
| An empty list shown as an error | The user sees a failure for a quiet account | Return `{ view: "empty" }` and the empty sentence |

### Tip

Check `loading` and `error` before you read `state.items`. A loading state has no list to copy.

### Practice

`alertView({ status: "ready", items: [] })` and the UI sentence for that view.

### Solution

```javascript
function rank(severity) {
  return severity === "high" ? 2 : 1;
}
function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return {
    view: "list",
    items: items.map(({ code, severity, message }) => ({ code, severity, message })),
  };
}
const viewModel = alertView({ status: "ready", items: [] });
```

Result: `{ view: "empty" }`. The UI sentence is `"No unusual sign-in activity."`.

## Exercises

See `exercises.md`.

## Quiz

1. Why prefer `textContent` over `innerHTML` for an alert message?
2. What is a prop?
3. In Vue 3, what is the usual pair for React's `useState`?
4. Why is one `status` field safer than `isLoading` plus `isError`?
5. What should an alert list item contain?
