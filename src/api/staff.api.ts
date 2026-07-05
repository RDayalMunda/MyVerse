import { request, requestWithMeta } from '@/api/client';
import type { PaginatedMeta } from '@/types/api';
import type { StaffListItem, StaffProfile, StaffProfileInput } from '@/types/staff';

type ListStaffParams = {
  page?: number;
  perPage?: number;
};

export async function listStaffApi(
  params: ListStaffParams = {},
): Promise<{ staff: StaffListItem[]; meta: PaginatedMeta }> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.perPage) search.set('perPage', String(params.perPage));
  const query = search.toString();
  const path = query ? `/staff?${query}` : '/staff';

  const { data, meta } = await requestWithMeta<StaffListItem[]>(path);

  return {
    staff: data,
    meta: meta as PaginatedMeta,
  };
}

export async function getStaffApi(id: string): Promise<StaffListItem> {
  return request<StaffListItem>(`/staff/${id}`);
}

export async function updateMyStaffProfileApi(
  body: Partial<StaffProfileInput>,
): Promise<StaffProfile> {
  return request<StaffProfile>('/staff/me', {
    method: 'PATCH',
    body,
  });
}
