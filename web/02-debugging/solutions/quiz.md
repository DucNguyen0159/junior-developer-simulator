# Quiz answers

1. The symptom is what the user sees. The root cause is the specific line and the reason that line produces the symptom.
2. A browser object preview can update after later mutations, so the log looks like it always had the new value.
3. The lines after `Promise.resolve().then(...)` run first. The callback runs after the current synchronous code finishes.
4. Both calls write the same place. If the older request finishes last, its result replaces the newer one.
5. Symptom, cause, fix, and the input you used to check.
