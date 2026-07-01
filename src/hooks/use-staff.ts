import { useCallback, useEffect, useRef, useState } from 'react';

import { getStaffApi } from '@/api/staff.api';
import { getErrorMessage } from '@/types/api';
import type { StaffListItem } from '@/types/staff';

type UseStaffResult = {
  staff: StaffListItem | null;
  isLoading: boolean;
  error: string | null;
  refetch: (silent?: boolean) => void;
};

export function useStaff(id?: string): UseStaffResult {
  const [staff, setStaff] = useState<StaffListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const silentRef = useRef(false);

  const refetch = useCallback((silent = false) => {
    silentRef.current = silent;
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!id) {
      setStaff(null);
      setIsLoading(false);
      setError('Staff profile not found');
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
        const result = await getStaffApi(id!);
        if (!cancelled) {
          setStaff(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setStaff(null);
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
  }, [id, reloadKey]);

  return { staff, isLoading, error, refetch };
}
