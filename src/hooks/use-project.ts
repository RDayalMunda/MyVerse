import { useCallback, useEffect, useState } from 'react';

import { getProjectApi } from '@/api/projects.api';
import { getErrorMessage } from '@/types/api';
import type { ProjectDetail } from '@/types/project';

type UseProjectResult = {
  project: ProjectDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useProject(id: string | undefined): UseProjectResult {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError('Project not found');
      return;
    }

    let cancelled = false;

    const projectId = id;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getProjectApi(projectId);
        if (!cancelled) {
          setProject(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setProject(null);
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
  }, [id, reloadKey]);

  return { project, isLoading, error, refetch };
}
