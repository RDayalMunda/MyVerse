import { request } from '@/api/client';
import type { CreateTextItemInput, SectionItem } from '@/types/project';

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
