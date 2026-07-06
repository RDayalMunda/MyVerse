import { useCallback, useEffect, useRef, useState } from 'react';

import { listStaffApi } from '@/api/staff.api';
import { canReadStaff } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage, type PaginatedMeta } from '@/types/api';
import type { StaffListItem } from '@/types/staff';

const PER_PAGE = 20;

type UseStaffListResult = {
  staff: StaffListItem[];
  meta: PaginatedMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refetch: (silent?: boolean) => void;
  loadMore: () => void;
};

export function useStaffList(): UseStaffListResult {
  const user = useAuthStore((state) => state.user);
  const canLoad = canReadStaff(user?.role);
  const authKey = useAuthStore((state) =>
    state.user ? `${state.user.id}:${state.user.role}` : 'guest',
  );
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(canLoad);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const silentRef = useRef(false);
  const appendRef = useRef(false);

  const refetch = useCallback((silent = false) => {
    silentRef.current = silent;
    appendRef.current = false;
    setPage(1);
    setReloadKey((key) => key + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (!canLoad || isLoading || isLoadingMore || !hasMore) {
      return;
    }
    appendRef.current = true;
    setPage((current) => current + 1);
  }, [canLoad, hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    if (!canLoad) {
      setStaff([]);
      setMeta(null);
      setHasMore(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const append = appendRef.current;
    appendRef.current = false;
    const silent = silentRef.current && !append;

    async function load() {
      if (append) {
        setIsLoadingMore(true);
      } else if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await listStaffApi({ page, perPage: PER_PAGE });
        if (cancelled) {
          return;
        }

        setStaff((prev) =>
          append ? [...prev, ...result.staff] : result.staff,
        );
        setMeta(result.meta);
        setHasMore(result.meta.page < result.meta.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          if (append) {
            setPage((current) => Math.max(1, current - 1));
          }
        }
      } finally {
        if (!cancelled) {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
          silentRef.current = false;
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, authKey, canLoad]);

  return {
    staff,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch,
    loadMore,
  };
}
