# JavaScript fundamentals

Modern JS (ES6+). Run `node examples.mjs` and compare the printed lines with this page.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`.

## 1. let, const, scope, hoisting

### Concept

`let` and `const` are block scoped. `const` cannot be reassigned. Both exist in a temporal dead zone from the start of the block until the line that declares them. A function declaration is hoisted with its body. `var` is function scoped and hoisted as `undefined`. You will read `var` in old code. Do not write it. `const` does not freeze an object. It freezes the binding.

### Terms

| Keyword | Reassign | Redeclare in same scope | Scope | Before the line |
| --- | --- | --- | --- | --- |
| `const` | No | No | Block | `ReferenceError` |
| `let` | Yes | No | Block | `ReferenceError` |
| `var` | Yes | Yes | Function | `undefined` |
| `function foo() {}` | The name can be overwritten | No, in the same scope | Function | Callable |

### Methods

These are declarations, not methods.

| Form | What it does |
| --- | --- |
| `const user = { id: 1 }` | One binding. The object can still change |
| `let n = 0` | A binding you may reassign |
| `var n = 0` | Function scope. Avoid in new code |
| `function foo() {}` | The whole function is available above its line in that scope |

### Examples

**Case: `const` blocks a new binding and allows a new property**

```javascript
const user = { id: 1 };
user.id = 2;
console.log(user.id);
user = { id: 3 };
```

Result: the log prints `2`. The next line throws `TypeError`.

Why: the name `user` stays pointed at the same object. The field `id` is not the binding.

**Case: reading `let` too early**

```javascript
console.log(city);
let city = "Irvine";
```

Result: `ReferenceError`.

Why: the name exists for the block and cannot be read until the `let` line. This is not `undefined`. `var city` would have logged `undefined`.

**Case: a `var` loop shares one binding**

```javascript
const fns = [];
for (var i = 0; i < 3; i += 1) {
  fns.push(() => i);
}
console.log(fns.map((fn) => fn()));
```

Result: `[3, 3, 3]`.

Why: there is one `i`. Every function reads it after the loop. Change `var` to `let` and the result is `[0, 1, 2]`, because each pass has its own `i`.

**Case: a function declaration can be called above its line**

```javascript
console.log(label());
function label() {
  return "Irvine";
}
```

Result: `Irvine`.

Why: the declaration is hoisted with its body. `const label = function () {}` is not. Calling that form above its line throws.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `const` for a value you must reassign | `TypeError` on the second assignment | `let` |
| Reading `let` above its line | `ReferenceError` | Declare first |
| Assuming `const user = {}` is immutable | Properties still change | Copy, or `Object.freeze` for a shallow freeze |
| `var` inside a loop, closure reads it later | Every closure sees the final value | `let` |

### Tip

`const` means the name does not move. It does not mean the object is frozen.

### Practice

Bind `const card = { city: "Irvine" }`, change `city` to `Tustin`, and print it. Then say what `card = {}` does.

### Solution

```javascript
const card = { city: "Irvine" };
card.city = "Tustin";
console.log(card.city);
```

Result: `Tustin`. `card = {}` throws `TypeError`.

## 2. Primitives, objects, arrays

### Concept

Primitives are `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, and `symbol`. Objects, including arrays and functions, are references. Two names can point at one object. Assigning a property through either name changes that one object.

### Terms

| Term | Meaning |
| --- | --- |
| Primitive | Compared and copied by value |
| Reference | A name that points at an object |
| `typeof null` | `"object"`. A long-standing mistake in the language |
| `Array.isArray` | The array test. `typeof []` is `"object"` |

### Methods

| Expression | Result | Why |
| --- | --- | --- |
| `typeof "a"` | `"string"` | Primitive |
| `typeof 1` | `"number"` | `NaN` is also a number |
| `typeof null` | `"object"` | Historical bug. Test with `=== null` |
| `typeof undefined` | `"undefined"` | Missing value |
| `Array.isArray([])` | `true` | `typeof []` is `"object"` |

### Examples

**Case: two names, one object**

```javascript
const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n);
```

Result: `2`.

Why: `b = a` copies the reference, not the fields. `b.n = 2` writes the only object.

**Case: `typeof null`**

```javascript
console.log(typeof null);
console.log(null === null);
console.log(typeof []);
console.log(Array.isArray([]));
```

Result:

```text
object
true
object
true
```

Why: `typeof` is the wrong object test and the wrong array test. Use `value !== null && typeof value === "object"` for a plain object, and `Array.isArray` for an array.

**Case: primitives do not share a change**

```javascript
let a = "Irvine";
let b = a;
b = "Tustin";
console.log(a);
```

Result: `Irvine`.

Why: a string is a primitive. Reassigning `b` does not edit `a`.

**Case: `typeof` an array is not `"array"`**

```javascript
console.log(typeof []);
```

Result: `"object"`. The string `"array"` is never what `typeof` returns.

Why: arrays are objects. `Array.isArray([])` is `true`.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `typeof null === "object"` treated as "this is an object" | `null` passes | `value !== null && typeof value === "object"` |
| `typeof [] === "array"` | The comparison is false | `Array.isArray` |
| Copying an object with `const b = a` | Later writes show up on `a` | Copy the fields. Section 8 |

### Tip

If two variables surprise you by changing together, they are the same object.

### Practice

Show that `const b = a` with `a = { n: 1 }` makes `a.n` become `2` after `b.n = 2`.

### Solution

The first example in this section.

Result: `2`.

## 3. == versus ===, truthy and falsy

### Concept

`===` checks value and type, with no coercion. `==` coerces first. Use `===` unless you mean `null` or `undefined` together. `value == null` is the one useful `==`. Falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy, including `"0"`, `"false"`, `[]`, and `{}`. `NaN === NaN` is false. Use `Number.isNaN`.

### Terms

| Term | Meaning |
| --- | --- |
| Strict equality | `===`. No conversion |
| Loose equality | `==`. Conversion. Avoid, except `== null` |
| Falsy | Treated as false by `if` |
| Truthy | Everything that is not in the falsy list |

### Methods

| Expression | Result |
| --- | --- |
| `0 == false` | `true` |
| `0 === false` | `false` |
| `"" == false` | `true` |
| `"5" == 5` | `true` |
| `"5" === 5` | `false` |
| `null == undefined` | `true` |
| `null === undefined` | `false` |
| `NaN === NaN` | `false` |

### Examples

**Case: zero and false**

```javascript
console.log(0 == false);
console.log(0 === false);
console.log("" == false);
console.log("5" == 5);
console.log("5" === 5);
```

Result:

```text
true
false
true
true
false
```

Why: `==` turns `false` and `""` into `0`, and `"5"` into `5`. `===` does not. The second line is `0 === false`.

**Case: `if (count)` drops a real zero**

```javascript
function label(count) {
  if (count) return `${count} events`;
  return "none";
}
console.log(label(0));
console.log(label(2));
```

Result:

```text
none
2 events
```

Why: `0` is falsy. A count of zero is a real result. Test `count == null` when you mean "missing", or `count === 0` when you mean zero.

**Case: `== false` treats `0` as failure**

```javascript
const success = 0;
console.log(success == false);
console.log(success === false);
```

Result: `true`, then `false`.

Why: a payload that uses `0` for a numeric field is not the boolean `false`. `==` makes them match. A bad check then counts that payload as failure.

**Case: `NaN` and `== null`**

```javascript
console.log(NaN === NaN);
console.log(Number.isNaN(NaN));
console.log(null == undefined);
console.log(null === undefined);
console.log(0 == null);
```

Result:

```text
false
true
true
false
false
```

Why: `== null` is true for `null` and `undefined` only. It does not treat `0` as missing.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `if (count)` when `0` is valid | The zero case is skipped | Compare with `===` |
| `success == false` when `success` is `0` | `0 == false` is `true`, so a bad payload counts as failure | `===` |
| `user.name === undefined` to mean "no user" | A user object can exist with a missing name | `user == null` |
| `NaN === NaN` | Always false | `Number.isNaN` |

### Tip

If the legal value can be `0` or `""`, do not use it as an `if` test and do not compare it with `==`.

### Practice

Print `0 == false` and `0 === false`.

### Solution

```javascript
console.log(0 == false);
console.log(0 === false);
```

Result: `true`, then `false`.

## 4. Functions, arrows, callbacks

### Concept

A callback is a function you pass so someone else can call it later. A `function` declaration gets its `this` from the caller and has an `arguments` object. An arrow takes `this` from the surrounding scope and has no `arguments`. A one-expression arrow returns that expression. A block arrow returns `undefined` unless you write `return`.

### Terms

| Form | `this` | `arguments` | Good for |
| --- | --- | --- | --- |
| `function f(a) {}` | Depends on the caller | Yes | Methods, when you need `this` |
| `const f = (a) => a + 1` | Lexical. No own `this` | No | Callbacks |
| `function f(a, b = 1) {}` | Same as a function | Yes | Default parameters |

### Methods

| Form | Result |
| --- | --- |
| `(n) => n * 2` | Returns the product |
| `(n) => { n * 2; }` | Returns `undefined` |
| `fn(n)` inside another function | The callback runs when that function says so |
| Default `b = 1` | Used when the argument is `undefined` |

### Examples

**Case: a callback runs later, inside `apply`**

```javascript
function apply(n, fn) {
  return fn(n);
}
console.log(apply(2, (n) => n * 3));
```

Result: `6`.

Why: `apply` does not multiply. It calls the function you passed.

**Case: a block arrow drops the value**

```javascript
const double = (n) => n * 2;
const broken = (n) => {
  n * 2;
};
console.log(double(4));
console.log(broken(4));
```

Result: `8`, then `undefined`.

Why: braces start a block. The block needs `return`.

**Case: an arrow does not get the method's `this`**

```javascript
const card = {
  city: "Irvine",
  arrow: () => this.city,
  method() {
    return this.city;
  },
};
console.log(card.method());
```

Result: `method` prints `Irvine`. `card.arrow()` does not read `card.city`. An arrow uses the `this` from outside the object, which is not `card`.

Why: use a method when the function must see the object before the dot.

**Case: a default does not replace `0`**

```javascript
function beds(n = 1) {
  return n;
}
console.log(beds());
console.log(beds(0));
```

Result: `1`, then `0`.

Why: the default runs only for `undefined`. `0` is a real argument.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Arrow as a method that uses `this` | `this` is not the object | A method, or close over the value you need |
| Forgetting `return` inside `{}` | The caller gets `undefined` | `(n) => n * 2` or `(n) => { return n * 2; }` |
| Calling the callback during render or setup | The work happens now | Pass the function. Call it at the later site |

### Tip

Pass `(n) => n * 3`. Do not pass the number `6` and expect the caller to know the formula.

### Practice

Write `apply(2, (n) => n * 3)` and state the result.

### Solution

The first example.

Result: `6`.

## 5. Destructuring, spread, rest

### Concept

Destructuring pulls fields or elements into local names. A default applies only when the value is `undefined`. `null` does not trigger it. Rest collects the leftovers and must be last. Spread expands an object or array into a new one. `{ ...card }` is a shallow copy. Nested objects are still shared.

### Terms

| Term | Meaning |
| --- | --- |
| Destructure | `const { city } = card` |
| Rename | `const { price: cost } = card` |
| Rest | `...rest` gathers what was not named |
| Spread | `...card` copies fields into a new object |
| Default | `beds = 0` when `beds` is `undefined` |

### Methods

| Form | Result |
| --- | --- |
| `const { city, beds = 0 } = card` | `city` from the object. `beds` is `0` if missing |
| `const [first, ...rest] = nums` | The head and an array of the tail |
| `const copy = { ...card, price: 11 }` | A new object. `price` is overwritten |
| Nested field on a shallow copy | Still the original nested object |

### Examples

**Case: a missing field uses the default, `null` does not**

```javascript
const card = { city: "Irvine", price: 10 };
const { city, beds = 0 } = card;
const { price: cost } = card;
console.log(city, beds, cost);
const other = { beds: null };
const { beds: count = 0 } = other;
console.log(count);
```

Result: `Irvine 0 10`, then `null`.

Why: `beds` is absent on `card`, so the default `0` applies. On `other`, `beds` is `null`, and `null` is a value, so the default does not run.

**Case: rest must be last**

```javascript
const nums = [1, 2, 3];
const [first, ...rest] = nums;
console.log(first);
console.log(rest);
```

Result: `1`, then `[2, 3]`.

Why: rest collects everything not already named. Putting a name after `...rest` does not compile.

**Case: spread overwrites and stays shallow**

```javascript
const card = { city: "Irvine", price: 10, meta: { beds: 3 } };
const copy = { ...card, price: 11 };
copy.meta.beds = 4;
console.log(copy.price);
console.log(card.price);
console.log(card.meta.beds);
```

Result: `11`, then `10`, then `4`.

Why: `price` was written onto the new object. `meta` is the same object both names share.

**Case: array rest does not edit the source**

```javascript
const nums = [1, 2, 3];
const [first, ...rest] = nums;
rest.push(9);
console.log(nums);
```

Result: `[1, 2, 3]`.

Why: `rest` is a new array. Pushing onto it does not change `nums`.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `{ ...obj }` treated as a deep copy | Nested objects are still shared | Copy those too, or `structuredClone` |
| Default only expected to replace `null` | `null` stays | Test `null` yourself |
| Rest in the middle of a pattern | Syntax error | Rest last |

### Tip

After a spread, change a nested field and print the original. If the original changed, the copy was shallow.

### Practice

From `{ city: "Irvine", price: 10 }`, take `city` and a default `beds` of `0`. Print both.

### Solution

```javascript
const card = { city: "Irvine", price: 10 };
const { city, beds = 0 } = card;
console.log(city, beds);
```

Result: `Irvine 0`.

## 6. map, filter, find, some, every, reduce

### Concept

`map`, `filter`, `find`, `some`, `every`, and `reduce` return a new value. They do not change the array. `sort` and `splice` do. `map` keeps the length. `filter` may be shorter. `find` returns `undefined` when nothing matches. `every` on an empty array is `true`. `reduce` without an initial value throws on an empty array. `sort()` with no compare function sorts as strings, so `10` can come before `2`.

### Terms

| Term | Meaning |
| --- | --- |
| Callback | The function called for each item |
| Initial value | The second argument of `reduce`. The starting total |
| Vacuous truth | `every` on `[]` is `true` because no item failed |
| In-place sort | `sort` edits the array you called it on |

### Methods

| Method | Returns | Empty / no match |
| --- | --- | --- |
| `map(fn)` | New array, same length | `[]` |
| `filter(fn)` | New array of matches | `[]` |
| `find(fn)` | First match | `undefined` |
| `findIndex(fn)` | Index | `-1` |
| `some(fn)` | `true` if any pass | `false` |
| `every(fn)` | `true` if all pass | `true` for `[]` |
| `reduce(fn, init)` | One value | The init if the array is empty |

### Examples

**Case: map, filter, and find**

```javascript
console.log([1, 2, 3].map((n) => n * 2));
console.log([1, 2, 3].filter((n) => n > 1));
console.log([1, 2, 3].find((n) => n > 1));
console.log([1, 2, 3].find((n) => n > 5));
```

Result: `[2, 4, 6]`, `[2, 3]`, `2`, then `undefined`.

Why: `map` has one output per input. `filter` drops failures. `find` stops at the first success and returns `undefined` when there is none.

**Case: some, every, and an empty every**

```javascript
console.log([1, 2, 3].some((n) => n > 5));
console.log([1, 2, 3].every((n) => n > 0));
console.log([].every((n) => n > 0));
```

Result: `false`, `true`, `true`.

Why: `some` needs one success. `every` needs zero failures. An empty list has zero failures.

**Case: reduce**

```javascript
console.log([1, 2, 3].reduce((sum, n) => sum + n, 0));
```

Result: `6`.

Why: `0` is the start. Each step returns the next sum. `[].reduce((sum, n) => sum + n)` throws. `[].reduce((sum, n) => sum + n, 0)` returns `0`.

**Case: sort mutates and uses string order by default**

```javascript
const nums = [10, 2, 3];
console.log(nums.sort());
console.log(nums);
console.log([...nums].sort((a, b) => a - b));
```

Result: the first two logs are the same array in string order, with `10` before `2` and `3` depending on the string comparison (`"10" < "2"` is true, so `10` comes first: `[10, 2, 3]`). The copy with `(a, b) => a - b` is `[2, 3, 10]`. The original `nums` was already string-sorted by the first `sort`.

Why: `sort` edits the array. The default compare is text. Copy first when the caller still needs the old order.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `map` used for side effects, result ignored | You built an unused array | `for...of` |
| `reduce` with no initial value on an empty array | `TypeError` | Pass the initial value |
| `every` on `[]` assumed false | It is `true` | Treat empty as "nothing failed", or check length |
| `sort()` without a compare on numbers | String order. `10` before `2` | `(a, b) => a - b`, on a copy |

### Tip

If you do not use the array `map` returns, you wanted a loop.

### Practice

Sum `[1, 2, 3]` with `reduce` and an initial `0`.

### Solution

```javascript
console.log([1, 2, 3].reduce((sum, n) => sum + n, 0));
```

Result: `6`.

## 7. Optional chaining and nullish coalescing

### Concept

`user?.name` is `undefined` if `user` is `null` or `undefined`. It does not skip other falsy values. A present user with a missing name is also `undefined`, and that is a different situation from a missing user only if you check the user first. `??` uses the right side only for `null` or `undefined`. `||` also replaces `0` and `""`.

### Terms

| Term | Meaning |
| --- | --- |
| Optional chaining | `?.` stops on `null` or `undefined` |
| Nullish | Only `null` and `undefined` |
| `??` | Default for nullish |
| `\|\|` | Default for any falsy value |

### Methods

| Expression | When the left side is `0` | When the left side is `null` |
| --- | --- | --- |
| `price ?? 10` | `0` | `10` |
| `price \|\| 10` | `10` | `10` |
| `user?.name` | Not about numbers | `undefined` if `user` is null |

### Examples

**Case: zero is kept by `??` and replaced by `||`**

```javascript
const price = 0;
console.log(price ?? 10);
console.log(price || 10);
```

Result: `0`, then `10`.

Why: `0` is not nullish. It is falsy. A price of zero is data.

**Case: optional chaining does not throw**

```javascript
const user = null;
console.log(user?.name);
console.log(user.name);
```

Result: the first log is `undefined`. The second throws `TypeError`.

Why: `?.` checks the base before the read.

**Case: empty string**

```javascript
const city = "";
console.log(city ?? "Irvine");
console.log(city || "Irvine");
```

Result: an empty line, then `Irvine`.

Why: `""` is not nullish, so `??` keeps it. `||` treats it as missing.

**Case: an empty array index**

```javascript
const arr = [];
console.log(arr?.[0]);
```

Result: `undefined`. It does not throw.

Why: the array exists, so `?.` reads index `0`. That slot is empty. Optional chaining does not mean "this index exists."

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `value \|\| fallback` when `0` is valid | The zero is replaced | `??` |
| `arr?.[0]` assumed to throw on an empty array | It returns `undefined` | Check the length if empty is an error |
| `user?.name` used to mean "no user" | A user with no name looks the same | Check `user == null` first |

### Tip

Say which missing values are real data. `0` and `""` are data. `null` is absence.

### Practice

`price` is `0`. Print `price || 5` and `price ?? 5`.

### Solution

```javascript
const price = 0;
console.log(price || 5);
console.log(price ?? 5);
```

Result: `5`, then `0`.

## 8. Copying and mutation

### Concept

A shallow copy makes a new container and keeps the same inner objects. A deep copy duplicates the nested values too. `structuredClone` deep-copies JSON-safe data. Spreading or `slice` does not. `sort` edits the array you call it on, so sort a copy when the caller still needs the old order. Storing the caller's object in a cache stores their later edits too.

### Terms

| Goal | Tool | Depth |
| --- | --- | --- |
| New array, same items | `[...arr]` or `arr.slice()` | Shallow |
| New object, same fields | `{ ...obj }` | Shallow |
| Sort without touching the original | `[...arr].sort(...)` | Shallow |
| True deep copy of JSON-safe data | `structuredClone(value)` | Deep |

### Methods

| Call | What changes |
| --- | --- |
| `copy.city = "Tustin"` on a shallow copy | The copy's own field |
| `copy.meta.beds = 4` | The shared nested object, so the original changes |
| `[...arr].sort(...)` | The copy's order. The input array stays |
| `structuredClone(card)` | A new `meta` object too |

### Examples

**Case: the top field is copied, the nested object is not**

```javascript
const card = { city: "Irvine", meta: { beds: 3 } };
const copy = { ...card };
copy.city = "Tustin";
copy.meta.beds = 4;
console.log(card.city);
console.log(card.meta.beds);
```

Result: `Irvine`, then `4`.

Why: `city` was overwritten on the new object. `meta` was not copied. Both names point at it.

**Case: `structuredClone` splits the nested object**

```javascript
const card = { city: "Irvine", meta: { beds: 3 } };
const copy = structuredClone(card);
copy.meta.beds = 4;
console.log(card.meta.beds);
```

Result: `3`.

Why: the clone has its own `meta`. This works for plain data. It does not clone functions.

**Case: sort a copy**

```javascript
const nums = [3, 1, 2];
const sorted = [...nums].sort((a, b) => a - b);
console.log(nums);
console.log(sorted);
```

Result: `[3, 1, 2]`, then `[1, 2, 3]`.

Why: the spread builds a new array before `sort` edits it.

**Case: storing the caller's object**

```javascript
const event = { city: "Irvine" };
const cache = event;
event.city = "Tustin";
console.log(cache.city);
```

Result: `Tustin`.

Why: the cache holds the same object the caller kept. Store `{ ...event }` when the snapshot must stay.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Storing the caller's object in a cache | A later write changes the cached result | Store `{ ...event }` |
| `sort` on the input array | The caller's array changes order | Copy first |
| A shallow copy treated as deep | Nested fields still change | `structuredClone` for plain data |

### Tip

Copy at the boundary where data enters your function. Do not copy on every line inside it.

### Practice

Copy `{ city: "Irvine", meta: { beds: 3 } }` with a spread, set `copy.meta.beds` to `4`, and print the original beds.

### Solution

The first example.

Result: the original `meta.beds` is `4`.

## 9. Errors

### Concept

`throw` leaves the function until a `catch`, or crashes the program. `try/catch` catches a `throw` in that synchronous block. It does not catch a rejection you forgot to `await`. `finally` runs either way. `Number("10px")` is `NaN`. `NaN < 0` is false, so a range check alone accepts it. `Number.isInteger` rejects `NaN` and non-integers.

### Terms

| Term | Meaning |
| --- | --- |
| `throw` | Stop this function and look for `catch` |
| `catch` | Handles that throw |
| `finally` | Runs after `try`, whether it threw or not |
| Rejection | A promise failure. Invisible to `try` unless you `await` |

### Methods

| Call | Result |
| --- | --- |
| `Number("10px")` | `NaN` |
| `Number.isInteger(NaN)` | `false` |
| `Number.isInteger(1.5)` | `false` |
| `Number.isInteger(2)` | `true` |
| `try/catch` around `await` | The rejection is caught |
| `try/catch` around a bare promise | The rejection is not caught |

### Examples

**Case: a bad count throws**

```javascript
function parseCount(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("count must be a non-negative integer");
  }
  return n;
}
console.log(parseCount("3"));
```

Result: `3`. `parseCount("10px")` throws, because `Number("10px")` is `NaN` and `Number.isInteger(NaN)` is false. `parseCount("-1")` throws because of `n < 0`.

Why: `NaN < 0` is false, so the integer test has to be there. Otherwise `"10px"` would slip through a `< 0` check.

**Case: catch prints the message**

```javascript
try {
  parseCount("nope");
  console.log("continued");
} catch (error) {
  console.log(error.message);
}
```

Result: `count must be a non-negative integer`. `continued` does not print.

Why: `throw` jumps to `catch`. The lines after the throw in `try` do not run.

**Case: `finally` runs on success and on failure**

```javascript
function run(text) {
  try {
    return parseCount(text);
  } finally {
    console.log("done");
  }
}
console.log(run("2"));
```

Result: `done`, then `2`.

Why: `finally` runs before the caller receives the return value. It also runs when `parseCount` throws.

**Case: `try` does not catch a forgotten `await`**

```javascript
function fail() {
  return Promise.reject(new Error("nope"));
}
try {
  const value = fail();
  console.log(value instanceof Promise);
} catch (error) {
  console.log("caught");
}
```

Result: `true`. `caught` does not print. The rejection is still unhandled unless something awaits `value`.

Why: `fail()` returned a promise. It did not throw in this turn. `await fail()` inside the `try` would print `caught`.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Empty `catch` | The error disappears | Handle it or rethrow |
| `catch (e) { return e }` and the caller treats it as success | A failure looks like data | Return a result object, or rethrow |
| `Number("10px")` checked only with `< 0` | `NaN < 0` is false, so the value is accepted | `Number.isInteger` or `Number.isFinite` |
| `try/catch` with no `await` | The rejection escapes | `await` inside the `try` |

### Tip

A `catch` that returns the error makes the failure look like a normal return. The caller has to know to check.

### Practice

`parseCount("3")` returns a number. `parseCount("-1")` throws. State both.

### Solution

`parseCount("3")` returns `3`. `parseCount("-1")` throws `Error: count must be a non-negative integer`.

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
