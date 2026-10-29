# Quiz answers

1. `fetch` does not throw on a 500. The branch that checks `response.ok` is easy to forget, and a test with `ok: false` locks it in.
2. `equal` is for primitives. `deepEqual` compares the contents of objects and arrays.
3. The product needs different UI for "please log in" and "you cannot do that." A test that accepts both lets a swap pass.
4. A test that keeps a bug from coming back. It uses the input that failed before.
5. `node --test file.test.mjs`.
