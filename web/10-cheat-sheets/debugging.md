# Debugging

1. Write the smallest input that shows the wrong output.
2. Name the function that owns that output.
3. Check shared objects, `==`, units, in-place `sort`, and missing `await`.
4. If two calls overlap, only the one that started last may write.

| You see | Look for |
| --- | --- |
| Wrong user | One object stored for many keys |
| Count too low or too high | `==`, ms vs minutes, off-by-one |
| `null` from an async function | Returned before `await` |
| Old data after a newer click | No request token |

Write four lines: symptom, cause, fix, check.
