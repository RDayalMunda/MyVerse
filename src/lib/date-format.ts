const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** API ISO or date-only → YYYY-MM-DD for form inputs. */
export function toDateInputValue(value?: string | null): string {
  if (!value?.trim()) {
    return '';
  }
  const trimmed = value.trim();
  const dateOnly = trimmed.match(DATE_ONLY_PATTERN);
  if (dateOnly) {
    return trimmed;
  }
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return '';
  }
  const date = new Date(parsed);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Form YYYY-MM-DD → API date string (date-only). */
export function toApiDateValue(value?: string | null): string | undefined {
  const normalized = toDateInputValue(value);
  return normalized || undefined;
}

/** ISO or date-only → locale display string. */
export function formatDateForDisplay(value?: string | null): string | undefined {
  const inputValue = toDateInputValue(value);
  if (!inputValue) {
    return undefined;
  }
  const match = inputValue.match(DATE_ONLY_PATTERN);
  if (!match) {
    return undefined;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Parse YYYY-MM-DD to Date at UTC midnight. */
export function dateInputToUtcDate(value: string): Date | null {
  const normalized = toDateInputValue(value);
  if (!normalized) {
    return null;
  }
  const match = normalized.match(DATE_ONLY_PATTERN);
  if (!match) {
    return null;
  }
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}
