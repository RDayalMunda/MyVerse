import { TextInput } from 'react-native';

import {
  AdminFormField,
  adminFormStyles,
  adminInputStyle,
} from '@/components/admin/admin-form-field';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS } from '@/lib/form-validation';

export type SectionFieldsValue = {
  label: string;
  description: string;
};

type SectionFieldsProps = {
  value: SectionFieldsValue;
  onChange: (value: SectionFieldsValue) => void;
  showValidation?: boolean;
  editable?: boolean;
  descriptionHint?: string;
};

export function SectionFields({
  value,
  onChange,
  showValidation = false,
  editable = true,
  descriptionHint = 'Optional section description.',
}: SectionFieldsProps) {
  const { colors } = useTheme();
  const labelError = showValidation && !value.label.trim();

  return (
    <>
      <AdminFormField
        label="Label *"
        hint={FIELD_HINTS.sectionLabel}
        error={labelError ? 'Section label is required' : null}
      >
        <TextInput
          style={[
            adminFormStyles.input,
            adminInputStyle(colors, labelError),
          ]}
          value={value.label}
          onChangeText={(label) => onChange({ ...value, label })}
          placeholder="Chapter 1"
          placeholderTextColor={colors.textSecondary}
          editable={editable}
        />
      </AdminFormField>
      <AdminFormField label="Description" hint={descriptionHint}>
        <TextInput
          style={[
            adminFormStyles.input,
            adminFormStyles.multiline,
            adminInputStyle(colors),
          ]}
          value={value.description}
          onChangeText={(description) => onChange({ ...value, description })}
          placeholder="Optional section description"
          placeholderTextColor={colors.textSecondary}
          multiline
          editable={editable}
        />
      </AdminFormField>
    </>
  );
}
