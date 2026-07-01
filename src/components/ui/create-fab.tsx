import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

export type CreateFabOption = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: Href;
  comingSoon?: boolean;
};

type CreateFabProps = {
  accessibilityLabel: string;
  sheetTitle: string;
  sheetSubtitle: string;
  options: CreateFabOption[];
};

export function CreateFab({
  accessibilityLabel,
  sheetTitle,
  sheetSubtitle,
  options,
}: CreateFabProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSelect(option: CreateFabOption) {
    if (option.comingSoon || !option.href) {
      return;
    }
    setMenuOpen(false);
    router.push(option.href);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.tint,
            bottom: insets.bottom + 16,
            opacity: pressed ? 0.9 : 1,
            shadowColor: colors.text,
          },
        ]}
        onPress={() => setMenuOpen(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
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
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {sheetTitle}
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              {sheetSubtitle}
            </Text>

            {options.map((option) => (
              <Pressable
                key={option.id}
                disabled={option.comingSoon}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: option.comingSoon ? 0.55 : pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => handleSelect(option)}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.background }]}>
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={option.comingSoon ? colors.textSecondary : colors.tint}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {option.comingSoon ? (
                  <Text style={[styles.soonBadge, { color: colors.textSecondary }]}>
                    Soon
                  </Text>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                )}
              </Pressable>
            ))}

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/** Extra bottom padding when a tab shows the create FAB */
export const CREATE_FAB_LIST_PADDING = 88;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
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
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 18,
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
