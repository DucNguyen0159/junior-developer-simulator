import assert from "node:assert/strict";
import { test } from "node:test";

export function register(api) {
  test("two users keep their own last login", () => {
    const store = api.createStore();
    const event = { ip: "1.1.1.1", ts: 1 };
    api.recordLogin(store, "a", event);
    event.ip = "9.9.9.9";
    api.recordLogin(store, "b", { ip: "2.2.2.2", ts: 2 });
    assert.equal(api.getLastLogin(store, "a").ip, "1.1.1.1");
    assert.equal(api.getLastLogin(store, "b").ip, "2.2.2.2");
  });

  test("the object returned by getLastLogin is a copy", () => {
    const store = api.createStore();
    api.recordLogin(store, "a", { ip: "1.1.1.1", ts: 1 });
    const view = api.getLastLogin(store, "a");
    view.ip = "nope";
    assert.equal(api.getLastLogin(store, "a").ip, "1.1.1.1");
  });

  test("missing user is null", () => {
    assert.equal(api.getLastLogin(api.createStore(), "missing"), null);
  });

  test("failure count uses minutes and strict false, and does not reorder", () => {
    const events = [
      { ts: 1_000, success: false },
      { ts: 70_000, success: false },
      { ts: 90_000, success: 0 },
    ];
    const order = events.map((event) => event.ts);
    assert.equal(api.countRecentFailures(events, 1, 120_000), 1);
    assert.deepEqual(events.map((event) => event.ts), order);
  });

  test("a failure exactly one minute old counts", () => {
    const events = [{ ts: 60_000, success: false }];
    assert.equal(api.countRecentFailures(events, 1, 120_000), 1);
  });

  test("summary waits for the fetch", async () => {
    let finished = false;
    const summary = await api.loadAccountSummary(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      finished = true;
      return [{ userId: "a" }, { userId: "a" }];
    }, "a");
    assert.equal(finished, true);
    assert.deepEqual(summary, { userId: "a", count: 2 });
  });
}
