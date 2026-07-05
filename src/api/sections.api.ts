import { request } from '@/api/client';
import type {
  CreateSectionInput,
  Section,
  UpdateSectionInput,
} from '@/types/project';

export async function createSectionApi(
  projectId: string,
  input: CreateSectionInput,
): Promise<Section> {
  return request<Section>(`/projects/${projectId}/sections`, {
    method: 'POST',
    body: input,
  });
}

export async function updateSectionApi(
  projectId: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<Section> {
  return request<Section>(
    `/projects/${projectId}/sections/${sectionId}`,
    {
      method: 'PATCH',
      body: input,
    },
  );
}

export async function deleteSectionApi(
  projectId: string,
  sectionId: string,
): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(
    `/projects/${projectId}/sections/${sectionId}`,
    { method: 'DELETE' },
  );
}

export async function reorderSectionsApi(
  projectId: string,
  sectionIds: string[],
): Promise<{ reordered: boolean }> {
  return request<{ reordered: boolean }>(
    `/projects/${projectId}/sections/reorder`,
    {
      method: 'PATCH',
      body: { sectionIds },
    },
  );
}

export async function publishSectionApi(
  projectId: string,
  sectionId: string,
): Promise<Section> {
  return request<Section>(
    `/projects/${projectId}/sections/${sectionId}/publish`,
    { method: 'POST' },
  );
}

export async function unpublishSectionApi(
  projectId: string,
  sectionId: string,
): Promise<Section> {
  return request<Section>(
    `/projects/${projectId}/sections/${sectionId}/unpublish`,
    { method: 'POST' },
  );
}
