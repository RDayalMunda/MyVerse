import { toDateInputValue } from '@/lib/date-format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\/.+/;

export const FIELD_HINTS = {
  email: 'Must be a valid email address (e.g. you@example.com).',
  username:
    'At least 3 characters. Letters, numbers, and underscores only — no spaces.',
  password: 'At least 8 characters.',
  displayName: 'Your name as shown in the app.',
  displayNameOptional: 'Optional. Shown alongside the username.',
  stageName: 'Required. Your public performer or stage name.',
  bio: 'Required. A short biography about you.',
  heightCm: 'Whole number in centimeters (e.g. 170).',
  weightG: 'Whole number in grams (e.g. 65000).',
  likes: 'Type an item and press Enter to add.',
  location: 'Optional. City, region, or country.',
  skills: 'Optional. Type a skill and press Enter to add.',
  dateOfBirth: 'Optional. Tap to pick your date of birth.',
  cupSize: '1 to 4 characters (e.g. B, DD).',
  chestCm: 'Enter your chest measurement in centimeters.',
  waistCm: 'Enter your waist measurement in centimeters.',
  hipsCm: 'Enter your hip measurement in centimeters.',
  lengthLimpMm: 'Enter length when limp, in millimeters.',
  lengthErectMm: 'Enter length when erect, in millimeters.',
  girthMm: 'Enter girth measurement in millimeters.',
  loadCapacityMl: 'Enter load capacity in milliliters.',
  socialPlatform: 'Platform name (e.g. Instagram).',
  socialUrl: 'Must be a valid URL starting with http:// or https://.',
  bookTitle: 'Required. The title shown on the project card.',
  sectionLabel: 'Required. Label for this section or chapter.',
  textContent: 'Required. The text readers will see.',
  profilePhoto: 'JPEG, PNG, or WebP. Maximum 5 MB.',
} as const;

export function validateEmail(value: string, required = true): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return required ? 'Email is required' : null;
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address';
  }
  return null;
}

export function validateUsername(value: string, required = true): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return required ? 'Username is required' : null;
  }
  if (/\s/.test(value)) {
    return 'Username cannot contain spaces';
  }
  if (trimmed.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return 'Username may only contain letters, numbers, and underscores';
  }
  return null;
}

export function validatePassword(value: string, required = true): string | null {
  if (!value) {
    return required ? 'Password is required' : null;
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

export function validateDisplayName(
  value: string,
  required = true,
): string | null {
  if (!value.trim()) {
    return required ? 'Display name is required' : null;
  }
  return null;
}

export function validateRequiredText(
  value: string,
  label: string,
): string | null {
  if (!value.trim()) {
    return `${label} is required`;
  }
  return null;
}

export function validatePositiveInt(
  value: number,
  label: string,
): string | null {
  if (!Number.isInteger(value) || value < 1) {
    return `${label} must be a positive whole number`;
  }
  return null;
}

export function validateIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = toDateInputValue(trimmed);
  if (!normalized || !ISO_DATE_PATTERN.test(normalized)) {
    return 'Enter a valid date';
  }
  const parsed = Date.parse(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) {
    return 'Enter a valid date';
  }
  return null;
}

export function validateUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'URL is required';
  }
  if (!URL_PATTERN.test(trimmed)) {
    return 'Enter a valid URL starting with http:// or https://';
  }
  return null;
}

export function validateCupSize(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 4) {
    return 'Cup size must be 1 to 4 characters';
  }
  return null;
}

export type AccountFieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  displayName?: string;
};

export function validateAccountFields(
  fields: {
    email: string;
    username: string;
    password: string;
    displayName: string;
  },
  options: { requireDisplayName?: boolean } = {},
): AccountFieldErrors {
  const errors: AccountFieldErrors = {};
  const emailError = validateEmail(fields.email);
  if (emailError) errors.email = emailError;

  const usernameError = validateUsername(fields.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(fields.password);
  if (passwordError) errors.password = passwordError;

  const displayNameError = validateDisplayName(
    fields.displayName,
    options.requireDisplayName ?? false,
  );
  if (displayNameError) errors.displayName = displayNameError;

  return errors;
}

export function hasFieldErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/** Show inline error once the user has typed or tried to submit. */
export function shouldShowFieldError(
  value: string,
  error: string | undefined,
  submitAttempted: boolean,
): boolean {
  return Boolean(error && (submitAttempted || value.length > 0));
}
