import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { getLoginErrorMessage } from '@/types/api';

type LoginFormProps = {
  onSuccess: () => void;
  onContinueWithoutLogin: () => void;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm({ onSuccess, onContinueWithoutLogin }: LoginFormProps) {
  const { colors } = useTheme();
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const nextErrors: { email?: string; password?: string } = {};

    if (!isValidEmail(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    setError(null);
    if (!validate()) {
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

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: fieldErrors.email ? colors.error : colors.border,
              backgroundColor: colors.background,
            },
          ]}
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
        {fieldErrors.email ? (
          <Text style={[styles.fieldError, { color: colors.error }]}>
            {fieldErrors.email}
          </Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          secureTextEntry
          placeholder="Your password"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: fieldErrors.password ? colors.error : colors.border,
              backgroundColor: colors.background,
            },
          ]}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          onSubmitEditing={() => void handleSubmit()}
        />
        {fieldErrors.password ? (
          <Text style={[styles.fieldError, { color: colors.error }]}>
            {fieldErrors.password}
          </Text>
        ) : null}
      </View>

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
  fieldError: {
    fontSize: 13,
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
