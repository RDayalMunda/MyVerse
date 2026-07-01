import { View } from 'react-native';

import { FormField } from '@/components/ui/form-field';
import {
  FIELD_HINTS,
  shouldShowFieldError,
  type AccountFieldErrors,
} from '@/lib/form-validation';

type AccountFormFieldsProps = {
  email: string;
  username: string;
  password: string;
  displayName: string;
  onEmailChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  errors: AccountFieldErrors;
  submitAttempted?: boolean;
  displayNameRequired?: boolean;
  editable?: boolean;
};

export function AccountFormFields({
  email,
  username,
  password,
  displayName,
  onEmailChange,
  onUsernameChange,
  onPasswordChange,
  onDisplayNameChange,
  errors,
  submitAttempted = false,
  displayNameRequired = false,
  editable = true,
}: AccountFormFieldsProps) {
  return (
    <View style={{ gap: 16 }}>
      <FormField
        label="Email *"
        hint={FIELD_HINTS.email}
        error={errors.email}
        showError={shouldShowFieldError(email, errors.email, submitAttempted)}
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
        editable={editable}
      />
      <FormField
        label="Username *"
        hint={FIELD_HINTS.username}
        error={errors.username}
        showError={shouldShowFieldError(username, errors.username, submitAttempted)}
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
        autoComplete="username"
        placeholder="johndoe"
        editable={editable}
      />
      <FormField
        label="Password *"
        hint={FIELD_HINTS.password}
        error={errors.password}
        showError={shouldShowFieldError(password, errors.password, submitAttempted)}
        value={password}
        onChangeText={onPasswordChange}
        autoCapitalize="none"
        autoComplete="new-password"
        secureTextEntry
        placeholder="Your password"
        editable={editable}
      />
      <FormField
        label={displayNameRequired ? 'Display name *' : 'Display name'}
        hint={
          displayNameRequired
            ? FIELD_HINTS.displayName
            : FIELD_HINTS.displayNameOptional
        }
        error={errors.displayName}
        showError={shouldShowFieldError(
          displayName,
          errors.displayName,
          submitAttempted,
        )}
        value={displayName}
        onChangeText={onDisplayNameChange}
        placeholder="John Doe"
        editable={editable}
      />
    </View>
  );
}
