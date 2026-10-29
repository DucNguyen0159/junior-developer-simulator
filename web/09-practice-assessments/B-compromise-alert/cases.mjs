import assert from "node:assert/strict";
import { test } from "node:test";

const MIN = 60 * 1000;

const MESSAGES = {
  "failed-then-success": "A sign-in succeeded after several recent failures.",
  "failed-attempts": "Several sign-in attempts failed recently.",
  "new-country": "A sign-in came from a country we have not seen on this account.",
  "impossible-travel": "Two recent sign-ins came from different countries in a short time.",
};

function codes(alerts) {
  return alerts.map((alert) => alert.code);
}

export function register(api) {
  test("empty input returns no alerts", () => {
    assert.deepEqual(api.detectCompromise(null, []), []);
    assert.deepEqual(api.detectCompromise({ knownCountries: [] }, null), []);
  });

  test("five failures in ten minutes warn once", () => {
    const logins = [0, 1, 2, 3, 4].map((minute) => ({
      ts: minute * MIN,
      success: false,
      country: "US",
      ip: "1.1.1.1",
    }));
    const alerts = api.detectCompromise({ knownCountries: ["US"] }, logins);
    assert.deepEqual(codes(alerts), ["failed-attempts"]);
    assert.equal(alerts[0].message, MESSAGES["failed-attempts"]);
    assert.equal(JSON.stringify(alerts).includes("1.1.1.1"), false);
  });

  test("failures spread further than ten minutes do not warn", () => {
    const logins = [0, 11, 22, 33, 44].map((minute) => ({
      ts: minute * MIN,
      success: false,
      country: "US",
    }));
    assert.deepEqual(api.detectCompromise({ knownCountries: ["US"] }, logins), []);
  });

  test("success after five recent failures is the high alert only", () => {
    const logins = [0, 1, 2, 3, 4].map((minute) => ({
      ts: minute * MIN,
      success: false,
      country: "US",
      ip: "9.9.9.9",
    }));
    logins.push({ ts: 9 * MIN, success: true, country: "CA", ip: "8.8.8.8" });
    const alerts = api.detectCompromise({ knownCountries: ["US"] }, logins);
    assert.deepEqual(codes(alerts), ["failed-then-success", "new-country"]);
    assert.equal(alerts[0].severity, "high");
    assert.equal(JSON.stringify(alerts).includes("8.8.8.8"), false);
  });

  test("a known country does not raise new-country", () => {
    const alerts = api.detectCompromise({ knownCountries: ["US"] }, [
      { ts: 0, success: true, country: "US", ip: "1.1.1.1" },
    ]);
    assert.deepEqual(alerts, []);
  });

  test("a blank country does not raise new-country", () => {
    const alerts = api.detectCompromise({ knownCountries: ["US"] }, [
      { ts: 0, success: true, country: "", ip: "1.1.1.1" },
    ]);
    assert.deepEqual(alerts, []);
  });

  test("two countries thirty minutes apart warn", () => {
    const alerts = api.detectCompromise({ knownCountries: ["US", "CA"] }, [
      { ts: 0, success: true, country: "US" },
      { ts: 30 * MIN, success: true, country: "CA" },
    ]);
    assert.deepEqual(codes(alerts), ["impossible-travel"]);
    assert.equal(alerts[0].message, MESSAGES["impossible-travel"]);
  });

  test("two countries just over thirty minutes apart do not warn", () => {
    const alerts = api.detectCompromise({ knownCountries: ["US", "CA"] }, [
      { ts: 0, success: true, country: "US" },
      { ts: 30 * MIN + 1, success: true, country: "CA" },
    ]);
    assert.deepEqual(alerts, []);
  });

  test("success value 0 is not a failure", () => {
    const logins = [0, 1, 2, 3, 4].map((minute) => ({
      ts: minute * MIN,
      success: 0,
      country: "US",
    }));
    assert.deepEqual(api.detectCompromise({ knownCountries: ["US"] }, logins), []);
  });
}
