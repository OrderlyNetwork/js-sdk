/** Preserve the current article; after removal prefer its old next, then previous. */
export function resolveCardId<T extends string | number>(
  current: T | undefined,
  previous: T[],
  next: T[],
): T | undefined {
  if (current !== undefined && next.includes(current)) return current;
  const index = current === undefined ? -1 : previous.indexOf(current);
  if (index >= 0) {
    return (
      previous.slice(index + 1).find((id) => next.includes(id)) ??
      previous
        .slice(0, index)
        .reverse()
        .find((id) => next.includes(id)) ??
      next[0]
    );
  }
  return next[0];
}
