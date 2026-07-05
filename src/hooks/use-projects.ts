import { useCallback, useEffect, useRef, useState } from 'react';

import { listProjectsApi } from '@/api/projects.api';
import { getErrorMessage } from '@/types/api';
import type { Project } from '@/types/project';
import type { PaginatedMeta } from '@/types/api';

type UseProjectsResult = {
  projects: Project[];
  meta: PaginatedMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: (silent?: boolean) => void;
};

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const silentRef = useRef(false);

  const refetch = useCallback((silent = false) => {
    silentRef.current = silent;
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const silent = silentRef.current;

    async function load() {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await listProjectsApi();
        if (!cancelled) {
          setProjects(result.projects);
          setMeta(result.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          silentRef.current = false;
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { projects, meta, isLoading, error, refetch };
}
