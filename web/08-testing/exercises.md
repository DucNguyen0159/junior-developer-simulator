# Exercises

1. In your own `check.test.mjs`, write two `node:test` tests for a function `isBlank(text)` that is true for `""` and `"   "`, and false for `"a"`. Implement `isBlank` in the same file. Run `node --test your-file.test.mjs`.

2. Write `messageIsSafe(message, ip)` that returns true only when `message` does not include `ip`. Add a test where a bad message contains `1.1.1.1` and the function returns false.

3. A function `countFailures(events)` should ignore `{ success: 0 }`. Write the test first, then the function. The test fails if someone uses `==`.
