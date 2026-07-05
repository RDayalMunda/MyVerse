import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { useListInvalidationStore } from '@/stores/list-invalidation-store';

type ListKind = 'projects' | 'staff';

export function useStaleListRefetch(
  kind: ListKind,
  refetch: (silent?: boolean) => void,
): void {
  useFocusEffect(
    useCallback(() => {
      const store = useListInvalidationStore.getState();
      const isStale =
        kind === 'projects' ? store.projectsListStale : store.staffListStale;

      if (!isStale) {
        return;
      }

      refetch(true);

      if (kind === 'projects') {
        store.clearProjectsListStale();
      } else {
        store.clearStaffListStale();
      }
    }, [kind, refetch]),
  );
}
