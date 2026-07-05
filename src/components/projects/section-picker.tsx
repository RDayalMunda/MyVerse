import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionSheet } from '@/components/ui/option-sheet';
import { useTheme } from '@/hooks/use-theme';
import type { Section } from '@/types/project';

type SectionPickerProps = {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSectionId: (sectionId: string) => void;
  showStatusBadge?: boolean;
};

function sortSections(sections: Section[]): Section[] {
  return [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function SectionPicker({
  sections,
  selectedSectionId,
  onSelectSectionId,
  showStatusBadge = false,
}: SectionPickerProps) {
  const { colors } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const sorted = useMemo(() => sortSections(sections), [sections]);
  const selected = sorted.find((s) => s.id === selectedSectionId) ?? sorted[0];

  if (sorted.length <= 1) {
    if (!selected) {
      return null;
    }
    return (
      <View style={[styles.single, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.singleLabel, { color: colors.textSecondary }]}>Section</Text>
        <Text style={[styles.singleValue, { color: colors.text }]}>{selected.label}</Text>
      </View>
    );
  }

  const sheetOptions = sorted.map((section) => ({
    id: section.id,
    label: section.label,
    description: section.description,
    badge:
      showStatusBadge && section.status !== 'PUBLISHED'
        ? section.status
        : undefined,
    trailing:
      section.id === selected?.id ? ('check' as const) : ('chevron' as const),
  }));

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select section"
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={() => setSheetOpen(true)}
      >
        <View style={styles.triggerText}>
          <Text style={[styles.triggerLabel, { color: colors.textSecondary }]}>
            Section
          </Text>
          <Text style={[styles.triggerValue, { color: colors.text }]}>
            {selected?.label ?? 'Select section'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </Pressable>

      <OptionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Sections"
        subtitle="Choose a section to view"
        options={sheetOptions}
        selectedId={selected?.id}
        onSelect={onSelectSectionId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  triggerText: {
    flex: 1,
    gap: 2,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  triggerValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  single: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  singleLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  singleValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
