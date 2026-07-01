import { request, requestWithMeta } from '@/api/client';
import type {
  CreateBookInput,
  Project,
  ProjectDetail,
} from '@/types/project';

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

export async function getProjectApi(id: string): Promise<ProjectDetail> {
  return request<ProjectDetail>(`/projects/${id}`);
}

export async function createBookApi(input: CreateBookInput): Promise<Project> {
  return request<Project>('/projects', {
    method: 'POST',
    body: {
      type: 'BOOK',
      title: input.title,
      description: input.description,
      bookDetails: input.summary ? { summary: input.summary } : undefined,
    },
  });
}

export async function publishProjectApi(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}/publish`, {
    method: 'POST',
  });
}
