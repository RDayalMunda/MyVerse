import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ChipInputFieldProps = {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

function normalizeChip(value: string): string {
  return value.trim();
}

function hasChip(values: string[], candidate: string): boolean {
  const normalized = candidate.toLowerCase();
  return values.some((item) => item.toLowerCase() === normalized);
}

export function ChipInputField({
  label,
  hint,
  values,
  onChange,
  placeholder = 'Type and press Enter',
}: ChipInputFieldProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');

  function addChip(raw: string) {
    const next = normalizeChip(raw);
    if (!next || hasChip(values, next)) {
      setDraft('');
      return;
    }
    onChange([...values, next]);
    setDraft('');
  }

  function removeChip(index: number) {
    const next = [...values];
    next.splice(index, 1);
    onChange(next);
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      {values.length > 0 ? (
        <View style={styles.chipRow}>
          {values.map((item, index) => (
            <View
              key={`${item}-${index}`}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>{item}</Text>
              <Pressable
                accessibilityLabel={`Remove ${item}`}
                hitSlop={8}
                onPress={() => removeChip(index)}
              >
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={() => addChip(draft)}
        onKeyPress={(event) => {
          if (Platform.OS === 'web' && event.nativeEvent.key === 'Enter') {
            event.preventDefault?.();
            addChip(draft);
          }
        }}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      />

      {hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
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
});
