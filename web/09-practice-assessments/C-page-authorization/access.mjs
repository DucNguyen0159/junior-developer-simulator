export function canAccess(user, page) {
  if (page?.public) return { allowed: true, reason: "public" };
  if (user?.roles?.some((role) => role.name === "admin")) {
    return { allowed: true, reason: "admin" };
  }
  if (user && page?.permission && user.permissions?.includes(page.permission)) {
    return { allowed: true, reason: "permitted" };
  }
  return { allowed: false, reason: "forbidden" };
}

export function guard(user, page) {
  const decision = canAccess(user, page);
  return { status: decision.allowed ? 200 : 403, decision };
}

export function visiblePages(user, pages) {
  return pages.filter((page) => canAccess(user, page).allowed);
}
