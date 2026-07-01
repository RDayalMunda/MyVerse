import { request } from '@/api/client';
import type { CreateSectionInput, Section } from '@/types/project';

export async function createSectionApi(
  projectId: string,
  input: CreateSectionInput,
): Promise<Section> {
  return request<Section>(`/projects/${projectId}/sections`, {
    method: 'POST',
    body: input,
  });
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
