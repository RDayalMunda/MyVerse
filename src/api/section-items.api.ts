import { request } from '@/api/client';
import type {
  CreateImageItemInput,
  CreateTextItemInput,
  SectionItem,
  UpdateImageItemInput,
  UpdateTextItemInput,
} from '@/types/project';

export async function createTextItemApi(
  projectId: string,
  sectionId: string,
  input: CreateTextItemInput,
): Promise<SectionItem> {
  return request<SectionItem>(
    `/projects/${projectId}/sections/${sectionId}/items`,
    {
      method: 'POST',
      body: {
        kind: 'TEXT',
        textContent: input.textContent,
        label: input.label,
      },
    },
  );
}

export async function createImageItemApi(
  projectId: string,
  sectionId: string,
  input: CreateImageItemInput,
): Promise<SectionItem> {
  return request<SectionItem>(
    `/projects/${projectId}/sections/${sectionId}/items`,
    {
      method: 'POST',
      body: {
        kind: 'IMAGE',
        file: input.file,
        label: input.label,
      },
    },
  );
}

export async function updateSectionItemApi(
  projectId: string,
  sectionId: string,
  itemId: string,
  input: UpdateTextItemInput | UpdateImageItemInput,
): Promise<SectionItem> {
  return request<SectionItem>(
    `/projects/${projectId}/sections/${sectionId}/items/${itemId}`,
    {
      method: 'PATCH',
      body: input,
    },
  );
}

export async function deleteSectionItemApi(
  projectId: string,
  sectionId: string,
  itemId: string,
): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(
    `/projects/${projectId}/sections/${sectionId}/items/${itemId}`,
    { method: 'DELETE' },
  );
}

export async function reorderSectionItemsApi(
  projectId: string,
  sectionId: string,
  itemIds: string[],
): Promise<{ reordered: boolean }> {
  return request<{ reordered: boolean }>(
    `/projects/${projectId}/sections/${sectionId}/items/reorder`,
    {
      method: 'PATCH',
      body: { itemIds },
    },
  );
}
