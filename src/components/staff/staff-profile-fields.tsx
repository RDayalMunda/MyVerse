import { useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ChipInputField } from '@/components/ui/chip-input-field';
import { DateOfBirthField } from '@/components/ui/date-of-birth-field';
import {
  FIELD_HINTS,
  shouldShowFieldError,
  validateUrl,
} from '@/lib/form-validation';
import {
  genderLabel,
  getStaffProfileFieldErrors,
  type StaffProfileFieldErrors,
} from '@/lib/staff-validation';
import { STAFF_GENDERS, type StaffGender, type StaffProfileInput } from '@/types/staff';

type StaffProfileFieldsProps = {
  value: StaffProfileInput;
  onChange: (value: StaffProfileInput) => void;
  showStageName?: boolean;
  showBio?: boolean;
  requireStageName?: boolean;
  requireBio?: boolean;
  showValidation?: boolean;
};

export function StaffProfileFields({
  value,
  onChange,
  showStageName = true,
  showBio = true,
  requireStageName = false,
  requireBio = false,
  showValidation = false,
}: StaffProfileFieldsProps) {
  const { colors } = useTheme();
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialUrlTouched, setSocialUrlTouched] = useState(false);

  const fieldErrors = useMemo(
    () =>
      getStaffProfileFieldErrors(value, { requireStageName, requireBio }),
    [value, requireStageName, requireBio],
  );

  const socialUrlError =
    socialUrlTouched && socialUrl.trim()
      ? validateUrl(socialUrl)
      : undefined;

  function update<K extends keyof StaffProfileInput>(
    key: K,
    fieldValue: StaffProfileInput[K],
  ) {
    onChange({ ...value, [key]: fieldValue });
  }

  function showError(
    fieldKey: keyof StaffProfileFieldErrors,
    textValue: string,
  ): boolean {
    const error = fieldErrors[fieldKey];
    return shouldShowFieldError(textValue, error, showValidation);
  }

  function addSocialLink() {
    const platform = socialPlatform.trim();
    const url = socialUrl.trim();
    const urlError = validateUrl(url);
    setSocialUrlTouched(true);
    if (!platform || urlError) return;
    update('socialLinks', [...(value.socialLinks ?? []), { platform, url }]);
    setSocialPlatform('');
    setSocialUrl('');
    setSocialUrlTouched(false);
  }

  function removeSocialLink(index: number) {
    const links = [...(value.socialLinks ?? [])];
    links.splice(index, 1);
    update('socialLinks', links);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {showStageName ? (
        <Field
          label={requireStageName ? 'Stage name *' : 'Stage name'}
          hint={FIELD_HINTS.stageName}
          error={fieldErrors.stageName}
          showError={showError('stageName', value.stageName ?? '')}
          colors={colors}
        >
          <TextInput
            value={value.stageName ?? ''}
            onChangeText={(text) => update('stageName', text)}
            placeholder="Your stage name"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              inputStyle(colors, showError('stageName', value.stageName ?? '')),
            ]}
          />
        </Field>
      ) : null}

      {showBio ? (
        <Field
          label={requireBio ? 'Bio *' : 'Bio'}
          hint={FIELD_HINTS.bio}
          error={fieldErrors.bio}
          showError={showError('bio', value.bio ?? '')}
          colors={colors}
        >
          <TextInput
            value={value.bio ?? ''}
            onChangeText={(text) => update('bio', text)}
            placeholder="Tell us about yourself"
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[
              styles.input,
              styles.multiline,
              inputStyle(colors, showError('bio', value.bio ?? '')),
            ]}
          />
        </Field>
      ) : null}

      <Field
        label="Gender *"
        hint="Required. Additional fields appear based on your selection."
        colors={colors}
      >
        <View style={styles.chipRow}>
          {STAFF_GENDERS.map((gender) => (
            <Pressable
              key={gender}
              onPress={() => update('gender', gender)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    value.gender === gender ? colors.tint : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: value.gender === gender ? '#FFFFFF' : colors.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {genderLabel(gender)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>

      <NumberField
        label="Height (cm) *"
        hint={FIELD_HINTS.heightCm}
        value={value.heightCm}
        onChange={(n) => update('heightCm', n)}
        error={fieldErrors.heightCm}
        showError={showError('heightCm', value.heightCm ? String(value.heightCm) : '')}
        colors={colors}
        placeholder="170"
      />

      <NumberField
        label="Weight (grams) *"
        hint={FIELD_HINTS.weightG}
        value={value.weightG}
        onChange={(n) => update('weightG', n)}
        error={fieldErrors.weightG}
        showError={showError('weightG', value.weightG ? String(value.weightG) : '')}
        colors={colors}
        placeholder="65000"
      />

      <ChipInputField
        label="Likes"
        hint={FIELD_HINTS.likes}
        values={value.likes ?? []}
        onChange={(likes) => update('likes', likes)}
        placeholder="Add an interest"
      />

      <Field label="Location" hint={FIELD_HINTS.location} colors={colors}>
        <TextInput
          value={value.location ?? ''}
          onChangeText={(text) => update('location', text)}
          placeholder="City, country"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, inputStyle(colors)]}
        />
      </Field>

      <ChipInputField
        label="Skills"
        hint={FIELD_HINTS.skills}
        values={value.skills ?? []}
        onChange={(skills) => update('skills', skills)}
        placeholder="Add a skill"
      />

      <DateOfBirthField
        label="Date of birth"
        hint={FIELD_HINTS.dateOfBirth}
        value={value.dateOfBirth ?? ''}
        onChange={(dateOfBirth) => update('dateOfBirth', dateOfBirth)}
        error={fieldErrors.dateOfBirth}
        showError={showError('dateOfBirth', value.dateOfBirth ?? '')}
      />

      {value.gender === 'FEMALE' ? (
        <>
          <NumberField
            label="Chest (cm) *"
            hint={FIELD_HINTS.chestCm}
            value={value.chestCm}
            onChange={(n) => update('chestCm', n)}
            error={fieldErrors.chestCm}
            showError={showError('chestCm', value.chestCm ? String(value.chestCm) : '')}
            colors={colors}
          />
          <NumberField
            label="Waist (cm) *"
            hint={FIELD_HINTS.waistCm}
            value={value.waistCm}
            onChange={(n) => update('waistCm', n)}
            error={fieldErrors.waistCm}
            showError={showError('waistCm', value.waistCm ? String(value.waistCm) : '')}
            colors={colors}
          />
          <NumberField
            label="Hips (cm) *"
            hint={FIELD_HINTS.hipsCm}
            value={value.hipsCm}
            onChange={(n) => update('hipsCm', n)}
            error={fieldErrors.hipsCm}
            showError={showError('hipsCm', value.hipsCm ? String(value.hipsCm) : '')}
            colors={colors}
          />
          <Field
            label="Cup size *"
            hint={FIELD_HINTS.cupSize}
            error={fieldErrors.cupSize}
            showError={showError('cupSize', value.cupSize ?? '')}
            colors={colors}
          >
            <TextInput
              value={value.cupSize ?? ''}
              onChangeText={(text) => update('cupSize', text)}
              placeholder="B"
              placeholderTextColor={colors.textSecondary}
              maxLength={4}
              style={[
                styles.input,
                inputStyle(colors, showError('cupSize', value.cupSize ?? '')),
              ]}
            />
          </Field>
        </>
      ) : null}

      {value.gender === 'MALE' ? (
        <>
          <NumberField
            label="Length limp (mm) *"
            hint={FIELD_HINTS.lengthLimpMm}
            value={value.lengthLimpMm}
            onChange={(n) => update('lengthLimpMm', n)}
            error={fieldErrors.lengthLimpMm}
            showError={showError('lengthLimpMm', value.lengthLimpMm ? String(value.lengthLimpMm) : '')}
            colors={colors}
          />
          <NumberField
            label="Length erect (mm) *"
            hint={FIELD_HINTS.lengthErectMm}
            value={value.lengthErectMm}
            onChange={(n) => update('lengthErectMm', n)}
            error={fieldErrors.lengthErectMm}
            showError={showError('lengthErectMm', value.lengthErectMm ? String(value.lengthErectMm) : '')}
            colors={colors}
          />
          <NumberField
            label="Girth (mm) *"
            hint={FIELD_HINTS.girthMm}
            value={value.girthMm}
            onChange={(n) => update('girthMm', n)}
            error={fieldErrors.girthMm}
            showError={showError('girthMm', value.girthMm ? String(value.girthMm) : '')}
            colors={colors}
          />
          <NumberField
            label="Load capacity (ml) *"
            hint={FIELD_HINTS.loadCapacityMl}
            value={value.loadCapacityMl}
            onChange={(n) => update('loadCapacityMl', n)}
            error={fieldErrors.loadCapacityMl}
            showError={showError('loadCapacityMl', value.loadCapacityMl ? String(value.loadCapacityMl) : '')}
            colors={colors}
          />
        </>
      ) : null}

      <Field label="Social links" hint="Optional. Add platform name and full URL." colors={colors}>
        {(value.socialLinks ?? []).map((link, index) => (
          <View key={`${link.platform}-${index}`} style={[styles.socialRow, { borderColor: colors.border }]}>
            <Text style={[styles.socialText, { color: colors.text }]}>
              {link.platform}: {link.url}
            </Text>
            <Pressable onPress={() => removeSocialLink(index)}>
              <Text style={{ color: colors.error, fontWeight: '600' }}>Remove</Text>
            </Pressable>
          </View>
        ))}
        <TextInput
          value={socialPlatform}
          onChangeText={setSocialPlatform}
          placeholder="Platform (e.g. Instagram)"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, inputStyle(colors)]}
        />
        <Text style={[styles.inlineHint, { color: colors.textSecondary }]}>
          {FIELD_HINTS.socialPlatform}
        </Text>
        <TextInput
          value={socialUrl}
          onChangeText={setSocialUrl}
          onBlur={() => setSocialUrlTouched(true)}
          placeholder="https://..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="url"
          style={[
            styles.input,
            inputStyle(colors, Boolean(socialUrlError)),
          ]}
        />
        <Text style={[styles.inlineHint, { color: colors.textSecondary }]}>
          {FIELD_HINTS.socialUrl}
        </Text>
        {socialUrlError ? (
          <Text style={[styles.fieldError, { color: colors.error }]}>{socialUrlError}</Text>
        ) : null}
        <Pressable onPress={addSocialLink} style={[styles.addLink, { borderColor: colors.border }]}>
          <Text style={{ color: colors.tint, fontWeight: '600' }}>Add link</Text>
        </Pressable>
      </Field>
    </ScrollView>
  );
}

function Field({
  label,
  hint,
  error,
  showError = false,
  children,
  colors,
}: {
  label: string;
  hint?: string;
  error?: string;
  showError?: boolean;
  children: ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      {children}
      {hint ? (
        <Text style={[styles.inlineHint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
      {showError && error ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  error,
  showError = false,
  colors,
  placeholder,
}: {
  label: string;
  hint?: string;
  value?: number;
  onChange: (n: number) => void;
  error?: string;
  showError?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  placeholder?: string;
}) {
  const textValue = value ? String(value) : '';

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      showError={showError}
      colors={colors}
    >
      <TextInput
        value={textValue}
        onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, inputStyle(colors, showError && Boolean(error))]}
      />
    </Field>
  );
}

function inputStyle(
  colors: ReturnType<typeof useTheme>['colors'],
  hasError = false,
) {
  return {
    backgroundColor: colors.surface,
    borderColor: hasError ? colors.error : colors.border,
    color: colors.text,
  };
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  socialText: {
    flex: 1,
    fontSize: 13,
  },
  addLink: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
});

export function emptyStaffProfileInput(): StaffProfileInput {
  return {
    stageName: '',
    bio: '',
    gender: 'PREFER_NOT_TO_DISCLOSE' as StaffGender,
    heightCm: 0,
    weightG: 0,
    likes: [],
    skills: [],
    socialLinks: [],
  };
}
