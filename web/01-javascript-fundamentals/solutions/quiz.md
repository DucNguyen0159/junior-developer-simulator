# Quiz answers

1. `const` prevents reassigning the name. Fields on the object can still change.
2. `typeof null` is `"object"`. Test with `value !== null && typeof value === "object"`, or `=== null` when you only care about null.
3. `true` and `false`.
4. `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.
5. `true`.
6. `5` and `0`.
7. Yes. Spread is shallow, so `nested` is the same object.
8. No. `await` it, or attach `.catch`.
