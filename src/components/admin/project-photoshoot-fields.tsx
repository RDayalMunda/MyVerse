import { TextInput } from 'react-native';

import {
  AdminFormField,
  adminFormStyles,
  adminInputStyle,
} from '@/components/admin/admin-form-field';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS } from '@/lib/form-validation';

export type ProjectPhotoshootFieldsValue = {
  title: string;
  description: string;
  theme: string;
  location: string;
};

type ProjectPhotoshootFieldsProps = {
  value: ProjectPhotoshootFieldsValue;
  onChange: (value: ProjectPhotoshootFieldsValue) => void;
  showValidation?: boolean;
  editable?: boolean;
};

export function ProjectPhotoshootFields({
  value,
  onChange,
  showValidation = false,
  editable = true,
}: ProjectPhotoshootFieldsProps) {
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
          placeholder="Coastal Fashion Shoot"
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
        label="Theme"
        hint="Optional. e.g. Golden hour, Editorial."
      >
        <TextInput
          style={[adminFormStyles.input, adminInputStyle(colors)]}
          value={value.theme}
          onChangeText={(theme) => onChange({ ...value, theme })}
          placeholder="Golden hour"
          placeholderTextColor={colors.textSecondary}
          editable={editable}
        />
      </AdminFormField>
      <AdminFormField
        label="Location"
        hint="Optional. Where the shoot took place."
      >
        <TextInput
          style={[adminFormStyles.input, adminInputStyle(colors)]}
          value={value.location}
          onChangeText={(location) => onChange({ ...value, location })}
          placeholder="Malibu Pier"
          placeholderTextColor={colors.textSecondary}
          editable={editable}
        />
      </AdminFormField>
    </>
  );
}
