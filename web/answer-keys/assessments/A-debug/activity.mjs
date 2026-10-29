export function createStore() {
  return {};
}

export function recordLogin(store, userId, event) {
  store[userId] = { userId, ip: event.ip, ts: event.ts };
}

export function getLastLogin(store, userId) {
  const found = store[userId];
  return found ? { ...found } : null;
}

export function countRecentFailures(events, windowMinutes, now) {
  const windowMs = windowMinutes * 60 * 1000;
  return events.filter((event) => {
    const age = now - event.ts;
    return event.success === false && age >= 0 && age <= windowMs;
  }).length;
}

export async function loadAccountSummary(fetchEvents, userId) {
  const events = await fetchEvents(userId);
  return { userId, count: events.length };
}
