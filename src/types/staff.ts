import type { FileMeta, User } from '@/types/user';

export const STAFF_GENDERS = ['MALE', 'FEMALE', 'PREFER_NOT_TO_DISCLOSE'] as const;
export type StaffGender = (typeof STAFF_GENDERS)[number];

export type SocialLink = {
  platform: string;
  url: string;
};

export type StaffProfile = {
  id: string;
  userId: string;
  stageName?: string;
  bio?: string;
  dateOfBirth?: string;
  location?: string;
  skills: string[];
  socialLinks: SocialLink[];
  gender: StaffGender;
  heightCm: number;
  weightG: number;
  likes: string[];
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  cupSize?: string;
  lengthLimpMm?: number;
  lengthErectMm?: number;
  girthMm?: number;
  loadCapacityMl?: number;
  isProfileComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StaffListItem = StaffProfile & {
  user?: User;
};

export type StaffProfileInput = {
  stageName?: string;
  bio?: string;
  dateOfBirth?: string;
  location?: string;
  skills?: string[];
  socialLinks?: SocialLink[];
  gender: StaffGender;
  heightCm: number;
  weightG: number;
  likes: string[];
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  cupSize?: string;
  lengthLimpMm?: number;
  lengthErectMm?: number;
  girthMm?: number;
  loadCapacityMl?: number;
};

export type RegisterStaffRequest = {
  email: string;
  username: string;
  password: string;
  displayName: string;
  profilePicture: FileMeta;
  stageName: string;
  bio: string;
  gender: StaffGender;
  heightCm: number;
  weightG: number;
  likes: string[];
  location?: string;
  skills?: string[];
  dateOfBirth?: string;
  socialLinks?: SocialLink[];
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  cupSize?: string;
  lengthLimpMm?: number;
  lengthErectMm?: number;
  girthMm?: number;
  loadCapacityMl?: number;
};

export type AdminCreateStaffRequest = {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  role: 'STAFF';
  profilePicture: FileMeta;
  staffProfile: StaffProfileInput;
};
