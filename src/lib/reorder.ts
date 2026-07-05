export function moveItemUp<T extends { id: string }>(
  items: T[],
  index: number,
): T[] | null {
  if (index <= 0 || index >= items.length) {
    return null;
  }
  const next = [...items];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
}

export function moveItemDown<T extends { id: string }>(
  items: T[],
  index: number,
): T[] | null {
  if (index < 0 || index >= items.length - 1) {
    return null;
  }
  const next = [...items];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
}

export function idsInOrder<T extends { id: string }>(items: T[]): string[] {
  return items.map((item) => item.id);
}
