function permissionsFor(user) {
  const set = new Set(user?.permissions ?? []);
  for (const role of user?.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}

export function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}

export function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}

export function visiblePages(user, pages) {
  return pages.filter((page) => canAccess(user, page).allowed);
}
