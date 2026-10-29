const shared = { userId: null, ip: null };
const byUser = {};

export function recordLogin(userId, event) {
  shared.userId = userId;
  shared.ip = event.ip;
  byUser[userId] = shared;
  return byUser[userId];
}

export function getLogin(userId) {
  return byUser[userId];
}

export function countFailures(events, windowMinutes, now) {
  events.sort((a, b) => a.ts - b.ts);
  return events.filter((event) => event.success == false && now - event.ts <= windowMinutes * 1000).length;
}

export function loadSummary(fetchEvents, userId) {
  let summary = null;
  fetchEvents(userId).then((events) => {
    summary = { userId, count: events.length };
  });
  return summary;
}
