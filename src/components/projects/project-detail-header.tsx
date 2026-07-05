import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ProjectDetail } from '@/types/project';

const TYPE_LABELS = {
  BOOK: 'Book',
  PHOTOSHOOT: 'Photoshoot',
  SHOW: 'Show',
} as const;

type ProjectDetailHeaderProps = {
  project: ProjectDetail;
};

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
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
        <View
          style={[
            styles.metaBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
            Summary
          </Text>
          <Text style={[styles.metaText, { color: colors.text }]}>
            {project.bookDetails.summary}
          </Text>
        </View>
      ) : null}

      {project.photoshootDetails?.theme || project.photoshootDetails?.location ? (
        <View
          style={[
            styles.metaBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {project.photoshootDetails.theme ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Theme
              </Text>
              <Text style={[styles.metaText, { color: colors.text }]}>
                {project.photoshootDetails.theme}
              </Text>
            </View>
          ) : null}
          {project.photoshootDetails.location ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Location
              </Text>
              <Text style={[styles.metaText, { color: colors.text }]}>
                {project.photoshootDetails.location}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
  metaBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  metaRow: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
