import { CreateFab, type CreateFabOption } from '@/components/ui/create-fab';
import { canManageProjects } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

const PROJECT_CREATE_OPTIONS: CreateFabOption[] = [
  {
    id: 'book',
    label: 'Book',
    description: 'Written story with text chapters',
    icon: 'book-outline',
    href: '/admin/create-book',
  },
  {
    id: 'photoshoot',
    label: 'Photoshoot',
    description: 'Image gallery — coming in Slice 2',
    icon: 'images-outline',
    comingSoon: true,
  },
  {
    id: 'show',
    label: 'Show',
    description: 'Video series or movie — coming in Slice 3',
    icon: 'videocam-outline',
    comingSoon: true,
  },
];

export function ProjectCreateFab() {
  const user = useAuthStore((state) => state.user);

  if (!canManageProjects(user?.role)) {
    return null;
  }

  return (
    <CreateFab
      accessibilityLabel="Create project"
      sheetTitle="Create project"
      sheetSubtitle="Choose a content type"
      options={PROJECT_CREATE_OPTIONS}
    />
  );
}
