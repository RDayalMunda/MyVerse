export type ProjectType = 'BOOK' | 'PHOTOSHOOT' | 'SHOW';

export type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'DELETED';

export type ProjectVisibility =
  | 'PUBLIC'
  | 'AUTHENTICATED'
  | 'STAFF_ONLY'
  | 'PRIVATE';

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

export type ProjectsListResponse = {
  data: Project[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};
