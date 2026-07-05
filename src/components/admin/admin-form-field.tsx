import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type AdminFormFieldProps = {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
};

export function AdminFormField({
  label,
  hint,
  error,
  children,
}: AdminFormFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>{error}</Text>
      ) : null}
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function adminInputStyle(
  colors: ReturnType<typeof useTheme>['colors'],
  hasError = false,
) {
  return {
    color: colors.text,
    borderColor: hasError ? colors.error : colors.border,
    backgroundColor: colors.background,
  };
}

export const adminFormStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  textArea: {
    minHeight: 160,
    textAlignVertical: 'top' as const,
  },
});

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '500',
  },
});
