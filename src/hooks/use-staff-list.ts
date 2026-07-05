import { useCallback, useEffect, useRef, useState } from 'react';

import { listStaffApi } from '@/api/staff.api';
import { canReadStaff } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage, type PaginatedMeta } from '@/types/api';
import type { StaffListItem } from '@/types/staff';

type UseStaffListResult = {
  staff: StaffListItem[];
  meta: PaginatedMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: (silent?: boolean) => void;
};

export function useStaffList(): UseStaffListResult {
  const user = useAuthStore((state) => state.user);
  const canLoad = canReadStaff(user?.role);
  const authKey = useAuthStore((state) =>
    state.user ? `${state.user.id}:${state.user.role}` : 'guest',
  );
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(canLoad);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const silentRef = useRef(false);

  const refetch = useCallback((silent = false) => {
    silentRef.current = silent;
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!canLoad) {
      setStaff([]);
      setMeta(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const silent = silentRef.current;

    async function load() {
      if (!silent) {
        setIsLoading(true);
      }
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
          silentRef.current = false;
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, authKey, canLoad]);

  return { staff, meta, isLoading, error, refetch };
}
