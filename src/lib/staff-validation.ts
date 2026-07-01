import type { StaffGender, StaffProfileInput } from '@/types/staff';
import {
  validateCupSize,
  validateIsoDate,
  validatePositiveInt,
} from '@/lib/form-validation';

export {
  validateEmail,
  validateUsername,
  validatePassword,
  validateDisplayName,
} from '@/lib/form-validation';

export function validateStaffProfileBody(
  profile: StaffProfileInput,
  options: { requireStageName?: boolean; requireBio?: boolean } = {},
): string | null {
  const { requireStageName = false, requireBio = false } = options;

  if (requireStageName && !profile.stageName?.trim()) {
    return 'Stage name is required';
  }
  if (requireBio && !profile.bio?.trim()) {
    return 'Bio is required';
  }
  if (!profile.gender) {
    return 'Gender is required';
  }
  const heightError = validatePositiveInt(profile.heightCm, 'Height');
  if (heightError) return heightError;
  const weightError = validatePositiveInt(profile.weightG, 'Weight');
  if (weightError) return weightError;
  if (!Array.isArray(profile.likes)) {
    return 'Likes must be a list';
  }

  if (profile.dateOfBirth?.trim()) {
    const dateError = validateIsoDate(profile.dateOfBirth);
    if (dateError) return dateError;
  }

  if (profile.gender === 'FEMALE') {
    const chestError = validatePositiveInt(profile.chestCm ?? 0, 'Chest');
    if (chestError) return chestError;
    const waistError = validatePositiveInt(profile.waistCm ?? 0, 'Waist');
    if (waistError) return waistError;
    const hipsError = validatePositiveInt(profile.hipsCm ?? 0, 'Hips');
    if (hipsError) return hipsError;
    const cupError = validateCupSize(profile.cupSize ?? '');
    if (cupError) return cupError;
  }

  if (profile.gender === 'MALE') {
    const maleFields: Array<[keyof StaffProfileInput, string]> = [
      ['lengthLimpMm', 'Length (limp)'],
      ['lengthErectMm', 'Length (erect)'],
      ['girthMm', 'Girth'],
      ['loadCapacityMl', 'Load capacity'],
    ];
    for (const [field, label] of maleFields) {
      const val = profile[field] as number | undefined;
      const fieldError = validatePositiveInt(val ?? 0, label);
      if (fieldError) return fieldError;
    }
  }

  return null;
}

export function genderLabel(gender: StaffGender): string {
  switch (gender) {
    case 'MALE':
      return 'Male';
    case 'FEMALE':
      return 'Female';
    case 'PREFER_NOT_TO_DISCLOSE':
      return 'Prefer not to disclose';
  }
}

export type StaffProfileFieldErrors = Partial<
  Record<
    | keyof StaffProfileInput
    | 'dateOfBirth'
    | 'socialUrl',
    string
  >
>;

export function getStaffProfileFieldErrors(
  profile: StaffProfileInput,
  options: { requireStageName?: boolean; requireBio?: boolean } = {},
): StaffProfileFieldErrors {
  const { requireStageName = false, requireBio = false } = options;
  const errors: StaffProfileFieldErrors = {};

  if (requireStageName && !profile.stageName?.trim()) {
    errors.stageName = 'Stage name is required';
  }
  if (requireBio && !profile.bio?.trim()) {
    errors.bio = 'Bio is required';
  }

  const heightError = validatePositiveInt(profile.heightCm, 'Height');
  if (heightError) errors.heightCm = heightError;

  const weightError = validatePositiveInt(profile.weightG, 'Weight');
  if (weightError) errors.weightG = weightError;

  if (profile.dateOfBirth?.trim()) {
    const dateError = validateIsoDate(profile.dateOfBirth);
    if (dateError) errors.dateOfBirth = dateError;
  }

  if (profile.gender === 'FEMALE') {
    const chestError = validatePositiveInt(profile.chestCm ?? 0, 'Chest');
    if (chestError) errors.chestCm = chestError;
    const waistError = validatePositiveInt(profile.waistCm ?? 0, 'Waist');
    if (waistError) errors.waistCm = waistError;
    const hipsError = validatePositiveInt(profile.hipsCm ?? 0, 'Hips');
    if (hipsError) errors.hipsCm = hipsError;
    const cupError = validateCupSize(profile.cupSize ?? '');
    if (cupError) errors.cupSize = cupError;
  }

  if (profile.gender === 'MALE') {
    const maleFields: Array<[keyof StaffProfileInput, string]> = [
      ['lengthLimpMm', 'Length (limp)'],
      ['lengthErectMm', 'Length (erect)'],
      ['girthMm', 'Girth'],
      ['loadCapacityMl', 'Load capacity'],
    ];
    for (const [field, label] of maleFields) {
      const val = profile[field] as number | undefined;
      const fieldError = validatePositiveInt(val ?? 0, label);
      if (fieldError) errors[field] = fieldError;
    }
  }

  return errors;
}
