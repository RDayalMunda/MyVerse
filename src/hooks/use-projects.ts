import { useCallback, useEffect, useState } from 'react';

import { listProjectsApi } from '@/api/projects.api';
import { getErrorMessage } from '@/types/api';
import type { Project } from '@/types/project';
import type { PaginatedMeta } from '@/types/api';

type UseProjectsResult = {
  projects: Project[];
  meta: PaginatedMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
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
