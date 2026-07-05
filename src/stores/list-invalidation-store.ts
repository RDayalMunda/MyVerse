import { create } from 'zustand';

type ListInvalidationState = {
  projectsListStale: boolean;
  staffListStale: boolean;
  invalidateProjectsList: () => void;
  invalidateStaffList: () => void;
  clearProjectsListStale: () => void;
  clearStaffListStale: () => void;
};

export const useListInvalidationStore = create<ListInvalidationState>((set) => ({
  projectsListStale: false,
  staffListStale: false,
  invalidateProjectsList: () => set({ projectsListStale: true }),
  invalidateStaffList: () => set({ staffListStale: true }),
  clearProjectsListStale: () => set({ projectsListStale: false }),
  clearStaffListStale: () => set({ staffListStale: false }),
}));

export function invalidateProjectsList(): void {
  useListInvalidationStore.getState().invalidateProjectsList();
}

export function invalidateStaffList(): void {
  useListInvalidationStore.getState().invalidateStaffList();
}
