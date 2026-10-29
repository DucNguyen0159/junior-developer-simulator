const TEN_MIN = 10 * 60 * 1000;
const THIRTY_MIN = 30 * 60 * 1000;

const MESSAGES = {
  "failed-then-success": "A sign-in succeeded after several recent failures.",
  "failed-attempts": "Several sign-in attempts failed recently.",
  "new-country": "A sign-in came from a country we have not seen on this account.",
  "impossible-travel": "Two recent sign-ins came from different countries in a short time.",
};

function isFailure(event) {
  return event.success === false;
}

function failuresBefore(events, endTs) {
  return events.filter((event) => {
    const age = endTs - event.ts;
    return isFailure(event) && age >= 0 && age <= TEN_MIN;
  }).length;
}

function countryOf(event) {
  return typeof event.country === "string" && event.country.length > 0 ? event.country : "";
}

export function detectCompromise(user, logins) {
  if (!Array.isArray(logins) || logins.length === 0) return [];
  const events = [...logins].sort((a, b) => a.ts - b.ts);
  const known = new Set(user?.knownCountries ?? []);
  const alerts = [];
  const successes = events.filter((event) => event.success === true);

  const failedThenSuccess = successes.some((event) => failuresBefore(events, event.ts) >= 5);
  if (failedThenSuccess) {
    alerts.push({
      code: "failed-then-success",
      severity: "high",
      message: MESSAGES["failed-then-success"],
    });
  } else if (events.some((event) => failuresBefore(events, event.ts) >= 5)) {
    alerts.push({
      code: "failed-attempts",
      severity: "medium",
      message: MESSAGES["failed-attempts"],
    });
  }

  const newCountry = successes.some((event) => {
    const country = countryOf(event);
    return country !== "" && !known.has(country);
  });
  if (newCountry) {
    alerts.push({
      code: "new-country",
      severity: "medium",
      message: MESSAGES["new-country"],
    });
  }

  let travel = false;
  for (let i = 0; i < successes.length && !travel; i += 1) {
    for (let j = i + 1; j < successes.length; j += 1) {
      const left = countryOf(successes[i]);
      const right = countryOf(successes[j]);
      const gap = Math.abs(successes[i].ts - successes[j].ts);
      if (left && right && left !== right && gap <= THIRTY_MIN) {
        travel = true;
        break;
      }
    }
  }
  if (travel) {
    alerts.push({
      code: "impossible-travel",
      severity: "high",
      message: MESSAGES["impossible-travel"],
    });
  }

  const rank = { high: 0, medium: 1 };
  alerts.sort((a, b) => rank[a.severity] - rank[b.severity] || a.code.localeCompare(b.code));
  return alerts;
}
