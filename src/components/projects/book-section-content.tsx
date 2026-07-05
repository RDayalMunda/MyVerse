import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Section, SectionItem } from '@/types/project';

type BookSectionContentProps = {
  section: Section | null;
};

function TextItem({ item }: { item: SectionItem }) {
  const { colors } = useTheme();

  if (item.kind !== 'TEXT' || !item.textContent) {
    return null;
  }

  return (
    <View style={styles.textItem}>
      {item.label ? (
        <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
          {item.label}
        </Text>
      ) : null}
      <Text style={[styles.bodyText, { color: colors.text }]}>
        {item.textContent}
      </Text>
    </View>
  );
}

function UnsupportedItem({ kind }: { kind: SectionItem['kind'] }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.unsupported, { borderColor: colors.border }]}>
      <Text style={[styles.unsupportedText, { color: colors.textSecondary }]}>
        {kind} content — coming soon
      </Text>
    </View>
  );
}

export function BookSectionContent({ section }: BookSectionContentProps) {
  const { colors } = useTheme();

  if (!section) {
    return (
      <Text style={[styles.empty, { color: colors.textSecondary }]}>
        No sections available.
      </Text>
    );
  }

  const items = [...(section.items ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const textItems = items.filter(
    (item) => item.kind === 'TEXT' && item.textContent,
  );

  if (textItems.length === 0) {
    return (
      <View style={styles.container}>
        {section.description ? (
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            {section.description}
          </Text>
        ) : null}
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No content in this chapter.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {section.description ? (
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          {section.description}
        </Text>
      ) : null}
      {items.map((item) =>
        item.kind === 'TEXT' ? (
          <TextItem key={item.id} item={item} />
        ) : (
          <UnsupportedItem key={item.id} kind={item.kind} />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  textItem: {
    gap: 6,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
  },
  unsupported: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  unsupportedText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  empty: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
