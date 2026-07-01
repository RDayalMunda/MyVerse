import { requestWithMeta } from '@/api/client';
import type { Project } from '@/types/project';

type ListProjectsParams = {
  page?: number;
  perPage?: number;
};

export async function listProjectsApi(params: ListProjectsParams = {}) {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  const { data, meta } = await requestWithMeta<Project[]>(
    `/projects?${query.toString()}`,
  );

  return {
    projects: data,
    meta: meta ?? { page, perPage, total: data.length, totalPages: 1 },
  };
}
