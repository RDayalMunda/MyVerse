import { StyleSheet, Switch, Text, View } from 'react-native';

import { AdminFormField } from '@/components/admin/admin-form-field';
import { useTheme } from '@/hooks/use-theme';

type NsfwPreferenceFieldProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function NsfwPreferenceField({
  value,
  onChange,
  disabled = false,
}: NsfwPreferenceFieldProps) {
  const { colors } = useTheme();

  return (
    <AdminFormField
      label="Show 18+ content"
      hint="Required to view projects marked as adult content."
    >
      <View
        style={[
          styles.switchRow,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <Text style={[styles.switchLabel, { color: colors.text }]}>
          Enable adult content
        </Text>
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.tint }}
        />
      </View>
    </AdminFormField>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
});
