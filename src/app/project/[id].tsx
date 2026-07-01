import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/projects/project-card';
import { useProject } from '@/hooks/use-project';
import { useTheme } from '@/hooks/use-theme';
import type { SectionItem } from '@/types/project';

const TYPE_LABELS = {
  BOOK: 'Book',
  PHOTOSHOOT: 'Photoshoot',
  SHOW: 'Show',
} as const;

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

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProject(id);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <EmptyState
          message={error ?? 'Project not found'}
          actionLabel="Try again"
          onAction={refetch}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.chip, { backgroundColor: colors.surface }]}>
          <Text style={[styles.chipText, { color: colors.tint }]}>
            {TYPE_LABELS[project.type]}
          </Text>
        </View>
        {project.status !== 'PUBLISHED' ? (
          <View style={[styles.statusBadge, { borderColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {project.status}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{project.title}</Text>

      {project.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {project.description}
        </Text>
      ) : null}

      {project.bookDetails?.summary ? (
        <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Summary
          </Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {project.bookDetails.summary}
          </Text>
        </View>
      ) : null}

      {project.sections && project.sections.length > 0 ? (
        project.sections.map((section) => (
          <View
            key={section.id}
            style={[styles.section, { borderColor: colors.border }]}
          >
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              {section.label}
            </Text>
            {section.description ? (
              <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                {section.description}
              </Text>
            ) : null}
            {section.items?.map((item) =>
              item.kind === 'TEXT' ? (
                <TextItem key={item.id} item={item} />
              ) : (
                <UnsupportedItem key={item.id} kind={item.kind} />
              ),
            )}
          </View>
        ))
      ) : (
        <Text style={[styles.emptySections, { color: colors.textSecondary }]}>
          No published sections yet.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  summaryBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 20,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
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
  emptySections: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
