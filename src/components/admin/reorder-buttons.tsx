import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ReorderButtonsProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled?: boolean;
};

export function ReorderButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  disabled = false,
}: ReorderButtonsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        disabled={disabled || !canMoveUp}
        onPress={onMoveUp}
        style={({ pressed }) => [
          styles.button,
          { borderColor: colors.border, opacity: pressed || !canMoveUp ? 0.5 : 1 },
        ]}
        accessibilityLabel="Move up"
      >
        <Ionicons name="chevron-up" size={18} color={colors.text} />
      </Pressable>
      <Pressable
        disabled={disabled || !canMoveDown}
        onPress={onMoveDown}
        style={({ pressed }) => [
          styles.button,
          { borderColor: colors.border, opacity: pressed || !canMoveDown ? 0.5 : 1 },
        ]}
        accessibilityLabel="Move down"
      >
        <Ionicons name="chevron-down" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
