import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OptionSheet } from '@/components/ui/option-sheet';
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

  function handleSelect(id: string) {
    const option = options.find((item) => item.id === id);
    if (!option || option.comingSoon || !option.href) {
      return;
    }
    router.push(option.href);
  }

  const sheetOptions = options.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.description,
    icon: option.icon,
    disabled: option.comingSoon,
    trailing: option.comingSoon ? ('soon' as const) : ('chevron' as const),
  }));

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

      <OptionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={sheetTitle}
        subtitle={sheetSubtitle}
        options={sheetOptions}
        onSelect={handleSelect}
      />
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
});
