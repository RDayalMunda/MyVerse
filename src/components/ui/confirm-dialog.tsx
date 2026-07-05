import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type ConfirmDialogAction = {
  label: string;
  variant?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmDialogAction[];
  onDismiss: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  actions,
  onDismiss,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.actions}>
            {actions.map((action, index) => {
              const isCancel = action.variant === 'cancel';
              const isDestructive = action.variant === 'destructive';

              return (
                <Pressable
                  key={`${action.label}-${index}`}
                  style={({ pressed }) => [
                    styles.actionButton,
                    isCancel
                      ? { borderColor: colors.border, borderWidth: 1 }
                      : isDestructive
                        ? { backgroundColor: colors.error }
                        : { backgroundColor: colors.tint },
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => action.onPress?.()}
                >
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color: isCancel
                          ? colors.text
                          : isDestructive
                            ? '#FFFFFF'
                            : '#FFFFFF',
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
