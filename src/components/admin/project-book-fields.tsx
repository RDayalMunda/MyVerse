import { TextInput } from 'react-native';

import {
  AdminFormField,
  adminFormStyles,
  adminInputStyle,
} from '@/components/admin/admin-form-field';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS } from '@/lib/form-validation';

export type ProjectBookFieldsValue = {
  title: string;
  description: string;
  summary: string;
};

type ProjectBookFieldsProps = {
  value: ProjectBookFieldsValue;
  onChange: (value: ProjectBookFieldsValue) => void;
  showValidation?: boolean;
  editable?: boolean;
};

export function ProjectBookFields({
  value,
  onChange,
  showValidation = false,
  editable = true,
}: ProjectBookFieldsProps) {
  const { colors } = useTheme();
  const titleError = showValidation && !value.title.trim();

  return (
    <>
      <AdminFormField
        label="Title *"
        hint={FIELD_HINTS.bookTitle}
        error={titleError ? 'Title is required' : null}
      >
        <TextInput
          style={[
            adminFormStyles.input,
            adminInputStyle(colors, titleError),
          ]}
          value={value.title}
          onChangeText={(title) => onChange({ ...value, title })}
          placeholder="My First Book"
          placeholderTextColor={colors.textSecondary}
          editable={editable}
        />
      </AdminFormField>
      <AdminFormField
        label="Description"
        hint="Optional. Short blurb for the catalog."
      >
        <TextInput
          style={[
            adminFormStyles.input,
            adminFormStyles.multiline,
            adminInputStyle(colors),
          ]}
          value={value.description}
          onChangeText={(description) => onChange({ ...value, description })}
          placeholder="Short blurb for the catalog"
          placeholderTextColor={colors.textSecondary}
          multiline
          editable={editable}
        />
      </AdminFormField>
      <AdminFormField
        label="Summary"
        hint="Optional. Longer summary for the book detail page."
      >
        <TextInput
          style={[
            adminFormStyles.input,
            adminFormStyles.multiline,
            adminInputStyle(colors),
          ]}
          value={value.summary}
          onChangeText={(summary) => onChange({ ...value, summary })}
          placeholder="Longer summary (optional)"
          placeholderTextColor={colors.textSecondary}
          multiline
          editable={editable}
        />
      </AdminFormField>
    </>
  );
}
