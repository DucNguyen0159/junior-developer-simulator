# JavaScript fundamentals

Modern JS (ES6+). Run `node examples.mjs` and compare the printed lines with this page.

## 1. let, const, scope, hoisting

`let` and `const` are block scoped. `const` cannot be reassigned. Both exist in a temporal dead zone from the start of the block until the line that declares them. A function declaration is hoisted with its body. `var` is function scoped and hoisted as `undefined`. You will read `var` in old code. Do not write it.

| Keyword | Reassign | Redeclare in same scope | Scope | Before the line |
| --- | --- | --- | --- | --- |
| `const` | No | No | Block | ReferenceError |
| `let` | Yes | No | Block | ReferenceError |
| `var` | Yes | Yes | Function | `undefined` |
| `function foo() {}` | The name can be overwritten | No, in the same scope | Function | Callable |

`const` does not freeze an object. It freezes the binding.

```javascript
const user = { id: 1 };
user.id = 2;       // allowed
user = { id: 3 };  // TypeError
```

| Mistake | What happens | Fix |
| --- | --- | --- |
| `const` for a value you must reassign | Syntax/TypeError on the second assignment | Use `let` |
| Reading `let` above its line | `ReferenceError` | Declare first |
| Assuming `const user = {}` is immutable | Properties still change | Copy, or `Object.freeze` for a shallow freeze |
| `var` inside a loop, closure reads it later | Every closure sees the final value | `let` |

## 2. Primitives, objects, arrays

Primitives: `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`. Objects (including arrays and functions) are references.

| Expression | Result | Why |
| --- | --- | --- |
| `typeof "a"` | `"string"` | Primitive |
| `typeof 1` | `"number"` | `NaN` is also a number |
| `typeof null` | `"object"` | Historical bug. Test with `=== null` |
| `typeof undefined` | `"undefined"` | Missing value |
| `Array.isArray([])` | `true` | `typeof []` is `"object"` |

```javascript
const a = { n: 1 };
const b = a;
b.n = 2;
// a.n is 2. Same object.
```

| Mistake | Fix |
| --- | --- |
| `typeof null === "object"` treated as "this is an object" | `value !== null && typeof value === "object"` |
| `typeof [] === "array"` | That string does not exist. Use `Array.isArray` |

## 3. == versus ===, truthy and falsy

`===` checks value and type, with no coercion. `==` coerces first. Use `===` unless you mean `null` or `undefined` together (`value == null` is the one useful `==`).

| Expression | Result |
| --- | --- |
| `0 == false` | `true` |
| `0 === false` | `false` |
| `"" == false` | `true` |
| `"5" == 5` | `true` |
| `"5" === 5` | `false` |
| `null == undefined` | `true` |
| `null === undefined` | `false` |
| `NaN === NaN` | `false`. Use `Number.isNaN` |

Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy, including `"0"`, `"false"`, `[]`, and `{}`.

| Mistake | What happens |
| --- | --- |
| `if (count)` when `0` is valid | The zero case is skipped |
| `success == false` when `success` is `0` | `0 == false` is `true`, so a bad payload counts as failure |
| `user.name === undefined` to mean "no user" | A user object can exist with a missing name. Check `user == null` |

## 4. Functions, arrows, callbacks

| Form | `this` | `arguments` | Good for |
| --- | --- | --- | --- |
| `function f(a) {}` | Depends on the caller | Yes | Methods, when you need `this` |
| `const f = (a) => a + 1` | Lexical. No own `this` | No | Callbacks |
| `function f(a, b = 1) {}` | Same as a function | Yes | Default parameters |

A callback is a function you pass so someone else can call it later.

```javascript
function apply(n, fn) {
  return fn(n);
}
apply(2, (n) => n * 3); // 6
```

| Mistake | Fix |
| --- | --- |
| Arrow as a method that uses `this` | Use a method, or close over the value you need |
| Forgetting `return` inside `{}` | `(n) => n * 2` or `(n) => { return n * 2; }` |

## 5. Destructuring, spread, rest

```javascript
const card = { city: "Irvine", price: 10 };
const { city, beds = 0 } = card;     // beds is 0
const { price: cost } = card;        // rename
const nums = [1, 2, 3];
const [first, ...rest] = nums;       // 1 and [2, 3]
const copy = { ...card, price: 11 }; // new object
```

Rest collects the leftovers. Spread expands them. Rest must be last.

| Mistake | Fix |
| --- | --- |
| `{...obj}` treated as a deep copy | Nested objects are still shared. Copy those too, or structuredClone |
| Default only for `undefined` | `null` does not trigger a default |

## 6. map, filter, find, some, every, reduce

None of these mutate the array. `sort` and `splice` do.

| Method | Returns | Empty / no match |
| --- | --- | --- |
| `map(fn)` | New array, same length | `[]` |
| `filter(fn)` | New array of matches | `[]` |
| `find(fn)` | First match | `undefined` |
| `findIndex(fn)` | Index | `-1` |
| `some(fn)` | `true` if any pass | `false` |
| `every(fn)` | `true` if all pass | `true` for `[]` |
| `reduce(fn, init)` | One value | The init if the array is empty |

```javascript
[1, 2, 3].map((n) => n * 2);                 // [2, 4, 6]
[1, 2, 3].filter((n) => n > 1);              // [2, 3]
[1, 2, 3].find((n) => n > 1);                // 2
[1, 2, 3].some((n) => n > 5);                // false
[1, 2, 3].every((n) => n > 0);               // true
[1, 2, 3].reduce((sum, n) => sum + n, 0);    // 6
```

| Mistake | Fix |
| --- | --- |
| `map` used for side effects, result ignored | Use `for...of` |
| `reduce` with no initial value on an empty array | Pass the initial value |
| `every` on `[]` assumed false | It is `true` |
| `sort()` without a compare on numbers | Default sort is string order. Use `(a, b) => a - b` |

## 7. Optional chaining and nullish coalescing

`user?.name` is `undefined` if `user` is `null` or `undefined`. It does not skip other falsy values.

`??` uses the right side only for `null` or `undefined`. `||` also replaces `0` and `""`.

```javascript
const price = 0;
price ?? 10; // 0
price || 10; // 10
```

| Mistake | Fix |
| --- | --- |
| `value || fallback` when `0` is valid | `??` |
| `arr?.[0]` assumed to throw on an empty array | It returns `undefined` |

## 8. Copying and mutation

| Goal | Tool | Depth |
| --- | --- | --- |
| New array, same items | `[...arr]` or `arr.slice()` | Shallow |
| New object, same fields | `{ ...obj }` | Shallow |
| Sort without touching the original | `[...arr].sort(...)` | Shallow |
| True deep copy of JSON-safe data | `structuredClone(value)` | Deep |

```javascript
const card = { city: "Irvine", meta: { beds: 3 } };
const copy = { ...card };
copy.city = "Tustin";
copy.meta.beds = 4;
// card.city is "Irvine"
// card.meta.beds is 4
```

| Mistake | Fix |
| --- | --- |
| Storing the caller's object in a cache | Store `{ ...event }` |
| `sort` on the input array | Copy first |

## 9. Errors

```javascript
function parseCount(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("count must be a non-negative integer");
  }
  return n;
}
```

`try/catch` catches a `throw` in that synchronous block. It does not catch a rejection you forgot to `await`. `finally` runs either way.

| Mistake | Fix |
| --- | --- |
| Empty `catch` | Handle it or rethrow |
| `catch (e) { return e }` and the caller treats it as success | Return a result object, or rethrow |
| `Number("10px")` is `NaN`, and `NaN < 0` is false | `Number.isInteger` or `Number.isFinite` |

## Exercises

See `exercises.md`. Do them before `solutions/`.

## Quiz

1. What does `const` prevent, and what does it still allow on an object?
2. Why is `typeof null` a bad object test?
3. What is `0 == false`, and what is `0 === false`?
4. Name every falsy value.
5. What does `every` return for `[]`?
6. `price` is `0`. What do `price || 5` and `price ?? 5` return?
7. After `const b = { ...a }` and `b.nested.n = 1`, does `a.nested.n` change?
8. Does `try/catch` catch a promise you did not `await`?
