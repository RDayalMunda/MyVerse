import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { useProject } from '@/hooks/use-project';

import type { Section, SectionItem } from '@/types/project';

export function useProjectOnFocus(id: string | undefined) {
  const { project, isLoading, error, refetch } = useProject(id);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return { project, isLoading, error, refetch };
}

export function sortedSections(project: { sections?: Section[] } | null): Section[] {
  return [...(project?.sections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function sortedItems<T extends { sortOrder: number }>(items: T[] | undefined) {
  return [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}
