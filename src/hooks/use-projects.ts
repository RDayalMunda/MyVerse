import { useCallback, useEffect, useRef, useState } from 'react';

import { listProjectsApi } from '@/api/projects.api';
import { getErrorMessage, type PaginatedMeta } from '@/types/api';
import type { Project } from '@/types/project';

const PER_PAGE = 20;

type UseProjectsOptions = {
  isAdmin?: boolean;
};

type UseProjectsResult = {
  projects: Project[];
  meta: PaginatedMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refetch: (silent?: boolean) => void;
  loadMore: () => void;
};

export function useProjects(options: UseProjectsOptions = {}): UseProjectsResult {
  const { isAdmin = false } = options;
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }
    appendRef.current = true;
    setPage((current) => current + 1);
  }, [hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
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
        const result = await listProjectsApi({ page, perPage: PER_PAGE });
        if (cancelled) {
          return;
        }

        setProjects((prev) =>
          append ? [...prev, ...result.projects] : result.projects,
        );
        setMeta(result.meta);

        const batchSize = result.projects.length;
        if (isAdmin) {
          setHasMore(result.meta.page < result.meta.totalPages);
        } else {
          setHasMore(batchSize === PER_PAGE);
        }
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
  }, [page, reloadKey, isAdmin]);

  return {
    projects,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch,
    loadMore,
  };
}
