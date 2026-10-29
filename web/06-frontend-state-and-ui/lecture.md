# Frontend state and UI

The browser draws what you describe. It is not the place that decides whether a user is allowed. It is the place that shows the decision.

## 1. DOM

The DOM is the browser's tree of elements.

| Call | Result |
| --- | --- |
| `document.querySelector("#alert")` | First match, or `null` |
| `el.textContent = "Hi"` | Replaces the text. Does not parse HTML |
| `el.innerHTML = "<b>Hi</b>"` | Parses HTML. Do not put user text here |
| `el.addEventListener("click", fn)` | Runs `fn` on click |
| `event.preventDefault()` | Stops a form's navigation |

| Mistake | Fix |
| --- | --- |
| `innerHTML` with an alert message from the server | `textContent`, unless you wrote the HTML yourself |
| `querySelector` assumed to exist | Check for `null` |

These calls need a browser. The exercises in this folder use plain functions so Node can run them.

## 2. Components and props

A component is a function of its inputs. Props are those inputs. The child does not change the parent's object.

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

You can pass this assessment without writing Vue. If you see a Vue file: `ref` is a box (`.value` in script), the template unwraps it, and `v-if` is conditional rendering.

| Mistake | What happens |
| --- | --- |
| Mutating a prop object | The parent sees the change, or the next render overwrites you |
| `key={index}` when the list is reordered | State sticks to the wrong row |

## 3. State

One piece of state should have one meaning.

| Status | Fields you may read |
| --- | --- |
| `loading` | None of the old list, unless you are deliberately keeping it |
| `error` | `message` |
| `ready` | `items` |

```javascript
function nextState(current, action) {
  if (action.type === "loading") return { status: "loading" };
  if (action.type === "error") return { status: "error", message: action.message };
  return { status: "ready", items: action.items };
}
```

| Mistake | What the UI does |
| --- | --- |
| `loading` and `error` booleans both true | The branch you wrote first wins, and it may be the wrong one |
| Storing alerts inside the user object and mutating it | A later render shows a half-updated user |

## 4. Forms

Read the field, then validate, then submit. Show the error next to the field.

| Check | Reject |
| --- | --- |
| Required text | `""` and whitespace |
| Choice | A value not in the allowed list |
| Number | `NaN`, or a number outside the range |

Do not send the form when validation fails. The server still validates. The client check is so the user gets a fast message.

## 5. Rendering security alerts

| View model | UI |
| --- | --- |
| `{ view: "loading" }` | "Checking your account…" |
| `{ view: "error", message }` | That message, as text |
| `{ view: "empty" }` | "No unusual sign-in activity." |
| `{ view: "list", items }` | One block per alert: severity, then message |

Sort high severity above medium. Do not render `ip`, `userAgent`, or raw event objects.

```javascript
function alertView(state) {
  if (state.status === "loading") return { view: "loading" };
  if (state.status === "error") return { view: "error", message: state.message };
  const items = [...state.items].sort((a, b) => rank(b.severity) - rank(a.severity));
  if (items.length === 0) return { view: "empty" };
  return { view: "list", items: items.map(({ code, severity, message }) => ({ code, severity, message })) };
}
```

| Mistake | Fix |
| --- | --- |
| Rendering the event object | Map it to the three display fields first |
| Empty list shown as an error | Use the empty view |

## Exercises

See `exercises.md`.

## Quiz

1. Why prefer `textContent` over `innerHTML` for an alert message?
2. What is a prop?
3. In Vue 3, what is the usual pair for React's `useState`?
4. Why is one `status` field safer than `isLoading` plus `isError`?
5. What should an alert list item contain?
