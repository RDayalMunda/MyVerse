import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Project } from '@/types/project';

type ProjectCardProps = {
  project: Project;
};

const TYPE_LABELS: Record<Project['type'], string> = {
  BOOK: 'Book',
  PHOTOSHOOT: 'Photoshoot',
  SHOW: 'Show',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.chip, { backgroundColor: colors.background }]}>
          <Text style={[styles.chipText, { color: colors.tint }]}>
            {TYPE_LABELS[project.type]}
          </Text>
        </View>
        {project.isAdult ? (
          <View style={[styles.adultBadge, { borderColor: colors.error }]}>
            <Text style={[styles.adultText, { color: colors.error }]}>18+</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{project.title}</Text>

      {project.description ? (
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {project.description}
        </Text>
      ) : (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          No description
        </Text>
      )}
    </View>
  );
}

export function ProjectCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        styles.skeleton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    />
  );
}

type EmptyStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.retry, { color: colors.tint }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  skeleton: {
    height: 120,
    opacity: 0.6,
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
  adultBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adultText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  retry: {
    fontSize: 15,
    fontWeight: '600',
  },
});
