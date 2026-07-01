import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormField } from '@/components/ui/form-field';
import { useTheme } from '@/hooks/use-theme';
import {
  FIELD_HINTS,
  shouldShowFieldError,
  validateEmail,
  validatePassword,
} from '@/lib/form-validation';
import { useAuthStore } from '@/stores/auth-store';
import { getLoginErrorMessage } from '@/types/api';

type LoginFormProps = {
  onSuccess: () => void;
  onContinueWithoutLogin: () => void;
};

export function LoginForm({ onSuccess, onContinueWithoutLogin }: LoginFormProps) {
  const { colors } = useTheme();
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fieldErrors = useMemo(() => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    return {
      email: emailError ?? undefined,
      password: passwordError ?? undefined,
    };
  }, [email, password]);

  async function handleSubmit() {
    setError(null);
    setSubmitAttempted(true);

    if (fieldErrors.email || fieldErrors.password) {
      return;
    }

    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(getLoginErrorMessage(err));
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Sign in to access your account
      </Text>

      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}

      <FormField
        label="Email"
        hint={FIELD_HINTS.email}
        error={fieldErrors.email}
        showError={shouldShowFieldError(email, fieldErrors.email, submitAttempted)}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />

      <FormField
        label="Password"
        hint={FIELD_HINTS.password}
        error={fieldErrors.password}
        showError={shouldShowFieldError(password, fieldErrors.password, submitAttempted)}
        autoCapitalize="none"
        autoComplete="password"
        secureTextEntry
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
        onSubmitEditing={() => void handleSubmit()}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.tint, opacity: pressed || isLoading ? 0.85 : 1 },
        ]}
        onPress={() => void handleSubmit()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>

      <Pressable onPress={onContinueWithoutLogin} disabled={isLoading}>
        <Text style={[styles.link, { color: colors.tint }]}>
          Continue without signing in
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: -8,
  },
  errorBanner: {
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});
