import { request, requestWithMeta } from '@/api/client';
import type {
  CreateBookInput,
  CreatePhotoshootInput,
  Project,
  ProjectDetail,
  ProjectHardDeleteResult,
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

export async function createPhotoshootApi(
  input: CreatePhotoshootInput,
): Promise<Project> {
  const { theme, location, ...rest } = input;
  const hasDetails = theme || location;

  return request<Project>('/projects', {
    method: 'POST',
    body: {
      type: 'PHOTOSHOOT',
      title: rest.title,
      description: rest.description,
      photoshootDetails: hasDetails ? { theme, location } : undefined,
    },
  });
}

export async function publishProjectApi(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}/publish`, {
    method: 'POST',
  });
}

export async function unpublishProjectApi(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}/unpublish`, {
    method: 'POST',
  });
}

export async function deleteProjectApi(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function permanentDeleteProjectApi(
  id: string,
): Promise<ProjectHardDeleteResult> {
  return request<ProjectHardDeleteResult>(`/projects/${id}/permanent`, {
    method: 'DELETE',
  });
}
