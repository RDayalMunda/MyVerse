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
  sections?: Section[];
};

export type CreateBookInput = {
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

export type ProjectsListResponse = {
  data: Project[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};
