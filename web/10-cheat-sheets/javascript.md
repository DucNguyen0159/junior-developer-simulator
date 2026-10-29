# JavaScript

| Need | Use |
| --- | --- |
| No coercion | `===` |
| Null or undefined | `value == null` or `value ?? fallback` |
| Keep `0` and `""` | `??`, not `\|\|` |
| Real failure flag | `success === false` |
| Array is array | `Array.isArray` |
| Copy top level | `{ ...obj }`, `[...arr]` |
| Copy nested | `structuredClone` |
| Don't mutate input | Copy before `sort` |
| First match | `find`, then `?? null` if you don't want `undefined` |
| Sum | `reduce((sum, n) => sum + n, 0)` |
| Any / all | `some` / `every`. `every` on `[]` is `true` |

Falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.
