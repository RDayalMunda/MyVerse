import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  showError?: boolean;
};

export function FormField({
  label,
  hint,
  error,
  showError = false,
  style,
  ...inputProps
}: FormFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: showError && error ? colors.error : colors.border,
          },
          style,
        ]}
        {...inputProps}
      />
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
      {showError && error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

type FormFieldWrapProps = {
  label: string;
  hint?: string;
  error?: string;
  showError?: boolean;
  children: ReactNode;
};

/** Wrap non-TextInput controls (e.g. pickers) with label, hint, and error. */
export function FormFieldWrap({
  label,
  hint,
  error,
  showError = false,
  children,
}: FormFieldWrapProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
      {showError && error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    fontSize: 13,
    fontWeight: '500',
  },
});
