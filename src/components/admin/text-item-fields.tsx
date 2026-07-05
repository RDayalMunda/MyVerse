import { TextInput } from 'react-native';

import {
  AdminFormField,
  adminFormStyles,
  adminInputStyle,
} from '@/components/admin/admin-form-field';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS } from '@/lib/form-validation';

export type TextItemFieldsValue = {
  textContent: string;
  label: string;
};

type TextItemFieldsProps = {
  value: TextItemFieldsValue;
  onChange: (value: TextItemFieldsValue) => void;
  showValidation?: boolean;
  editable?: boolean;
};

export function TextItemFields({
  value,
  onChange,
  showValidation = false,
  editable = true,
}: TextItemFieldsProps) {
  const { colors } = useTheme();
  const contentError = showValidation && !value.textContent.trim();

  return (
    <>
      <AdminFormField label="Label" hint="Optional per-item label.">
        <TextInput
          style={[adminFormStyles.input, adminInputStyle(colors)]}
          value={value.label}
          onChangeText={(label) => onChange({ ...value, label })}
          placeholder="Optional label"
          placeholderTextColor={colors.textSecondary}
          editable={editable}
        />
      </AdminFormField>
      <AdminFormField
        label="Text *"
        hint={FIELD_HINTS.textContent}
        error={contentError ? 'Text content is required' : null}
      >
        <TextInput
          style={[
            adminFormStyles.input,
            adminFormStyles.textArea,
            adminInputStyle(colors, contentError),
          ]}
          value={value.textContent}
          onChangeText={(textContent) => onChange({ ...value, textContent })}
          placeholder="Write your text here..."
          placeholderTextColor={colors.textSecondary}
          multiline
          editable={editable}
        />
      </AdminFormField>
    </>
  );
}
