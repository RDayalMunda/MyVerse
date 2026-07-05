import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

export type OptionSheetItem = {
  id: string;
  label: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  badge?: string;
  trailing?: 'check' | 'chevron' | 'soon' | 'none';
};

type OptionSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: OptionSheetItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function OptionSheet({
  visible,
  onClose,
  title,
  subtitle,
  options,
  selectedId,
  onSelect,
}: OptionSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  function handleSelect(option: OptionSheetItem) {
    if (option.disabled) {
      return;
    }
    onSelect(option.id);
    onClose();
  }

  function renderTrailing(option: OptionSheetItem) {
    const trailing =
      option.trailing ??
      (option.id === selectedId ? 'check' : option.disabled ? 'soon' : 'chevron');

    switch (trailing) {
      case 'check':
        return (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={colors.tint}
          />
        );
      case 'soon':
        return (
          <Text style={[styles.soonBadge, { color: colors.textSecondary }]}>
            Soon
          </Text>
        );
      case 'none':
        return null;
      case 'chevron':
      default:
        return (
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        );
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: insets.bottom + 16,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHandle}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}

          {options.map((option) => (
            <Pressable
              key={option.id}
              disabled={option.disabled}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    option.id === selectedId ? colors.tint : colors.border,
                  opacity: option.disabled ? 0.55 : pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => handleSelect(option)}
            >
              {option.icon ? (
                <View
                  style={[styles.optionIcon, { backgroundColor: colors.background }]}
                >
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={option.disabled ? colors.textSecondary : colors.tint}
                  />
                </View>
              ) : null}
              <View style={styles.optionText}>
                <View style={styles.labelRow}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  {option.badge ? (
                    <View style={[styles.badge, { borderColor: colors.border }]}>
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {option.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {option.description ? (
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {renderTrailing(option)}
            </Pressable>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  soonBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
