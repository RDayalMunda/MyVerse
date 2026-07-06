import type { FileMeta } from '@/types/user';

export type ProjectType = 'BOOK' | 'PHOTOSHOOT' | 'SHOW';

export type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'DELETED';

export type SectionStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

export type ProjectVisibility =
  | 'PUBLIC'
  | 'AUTHENTICATED'
  | 'STAFF_ONLY'
  | 'PRIVATE';

export type SectionItemKind = 'TEXT' | 'IMAGE' | 'VIDEO';

export type BookDetails = {
  summary?: string;
};

export type PhotoshootDetails = {
  theme?: string;
  location?: string;
};

export type Project = {
  id: string;
  type: ProjectType;
  title: string;
  slug: string;
  description?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  isAdult: boolean;
  createdBy: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SectionItem = {
  id: string;
  sectionId: string;
  projectId: string;
  kind: SectionItemKind;
  label?: string;
  textContent?: string;
  file?: FileMeta;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Section = {
  id: string;
  projectId: string;
  label: string;
  description?: string;
  sortOrder: number;
  status: SectionStatus;
  publishedAt?: string;
  items?: SectionItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectDetail = Project & {
  bookDetails?: BookDetails;
  photoshootDetails?: PhotoshootDetails;
  sections?: Section[];
};

export type ProjectAccessInput = {
  visibility?: ProjectVisibility;
  isAdult?: boolean;
};

export type CreateBookInput = ProjectAccessInput & {
  title: string;
  description?: string;
  summary?: string;
};

export type CreateSectionInput = {
  label: string;
  description?: string;
};

export type CreateTextItemInput = {
  textContent: string;
  label?: string;
};

export type CreatePhotoshootInput = ProjectAccessInput & {
  title: string;
  description?: string;
  theme?: string;
  location?: string;
};

export type CreateImageItemInput = {
  file: FileMeta;
  label?: string;
};

export type UpdateBookInput = ProjectAccessInput & {
  title: string;
  description?: string;
  summary?: string;
};

export type UpdatePhotoshootInput = ProjectAccessInput & {
  title: string;
  description?: string;
  theme?: string;
  location?: string;
};

export type UpdateSectionInput = {
  label: string;
  description?: string;
};

export type UpdateTextItemInput = {
  textContent: string;
  label?: string;
};

export type UpdateImageItemInput = {
  label?: string;
  file?: FileMeta;
};

export type ProjectsListResponse = {
  data: Project[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export type ProjectHardDeleteResult = {
  projectId: string;
  sectionsRemoved: number;
  sectionItemsRemoved: number;
  imagesRemoved: number;
  videosRemoved: number;
};
