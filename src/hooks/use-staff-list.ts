import { useCallback, useEffect, useState } from 'react';

import { listStaffApi } from '@/api/staff.api';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage, type PaginatedMeta } from '@/types/api';
import type { StaffListItem } from '@/types/staff';

type UseStaffListResult = {
  staff: StaffListItem[];
  meta: PaginatedMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useStaffList(): UseStaffListResult {
  const authKey = useAuthStore((state) =>
    state.user ? `${state.user.id}:${state.user.role}` : 'guest',
  );
  const [staff, setStaff] = useState<StaffListItem[]>([]);
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
        const result = await listStaffApi();
        if (!cancelled) {
          setStaff(result.staff);
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
  }, [reloadKey, authKey]);

  return { staff, meta, isLoading, error, refetch };
}
