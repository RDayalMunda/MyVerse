export type UserRole = 'ADMIN' | 'STAFF' | 'PUBLIC';

export type FileMeta = {
  mediaId: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  profilePicture?: FileMeta;
  role: UserRole;
  isActive: boolean;
  nsfwEnabled: boolean;
  defaultVisibility?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};
