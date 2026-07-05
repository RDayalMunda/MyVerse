import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SaveFormLayoutProps = {
  children: ReactNode;
  saveLabel?: string;
  isSaving: boolean;
  isReady?: boolean;
  error?: string | null;
  onSave: () => void;
};

export function SaveFormLayout({
  children,
  saveLabel = 'Save changes',
  isSaving,
  isReady = true,
  error,
  onSave,
}: SaveFormLayoutProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          disabled={isSaving || !isReady}
          onPress={onSave}
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>{saveLabel}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  error: { fontSize: 14 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
