const shared = { userId: null, ip: null, ts: null };

export function createStore() {
  return {};
}

export function recordLogin(store, userId, event) {
  shared.userId = userId;
  shared.ip = event.ip;
  shared.ts = event.ts;
  store[userId] = shared;
}

export function getLastLogin(store, userId) {
  return store[userId] ?? null;
}

export function countRecentFailures(events, windowMinutes, now) {
  events.sort((a, b) => a.ts - b.ts);
  return events.filter((event) => event.success == false && now - event.ts <= windowMinutes * 1000).length;
}

export function loadAccountSummary(fetchEvents, userId) {
  let summary = null;
  fetchEvents(userId).then((events) => {
    summary = { userId, count: events.length };
  });
  return summary;
}
