import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getMeApi, loginApi, registerStaffApi } from '@/api/auth.api';
import { bindAuthHandlers } from '@/api/client';
import { zustandStorage } from '@/stores/storage';
import type { RegisterStaffRequest, StaffProfile } from '@/types/staff';
import type { User } from '@/types/user';

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;
  isLoading: boolean;

  setSession: (accessToken: string, user: User) => void;
  mergeStaffProfileInSession: (staffProfile: StaffProfile) => void;
  clearSession: () => void;
  login: (email: string, password: string) => Promise<void>;
  registerStaff: (body: RegisterStaffRequest) => Promise<void>;
  logout: () => void;
  hydrateSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isHydrated: false,
      isLoading: false,

      setSession: (accessToken, user) => {
        set({ accessToken, user });
      },

      mergeStaffProfileInSession: (staffProfile) => {
        const { user } = get();
        if (!user) {
          return;
        }
        set({ user: { ...user, staffProfile } });
      },

      clearSession: () => {
        set({ accessToken: null, user: null, isLoading: false });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { accessToken, user } = await loginApi(email, password);
          set({ accessToken, user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      registerStaff: async (body) => {
        set({ isLoading: true });
        try {
          const { accessToken, user } = await registerStaffApi(body);
          set({ accessToken, user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        get().clearSession();
      },

      hydrateSession: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          return;
        }

        try {
          const user = await getMeApi();
          set({ user });
        } catch {
          get().clearSession();
        }
      },
    }),
    {
      name: 'myverse-auth',
      storage: zustandStorage,
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useAuthStore.setState({ isHydrated: true });
          return;
        }

        void (async () => {
          if (state?.accessToken) {
            await useAuthStore.getState().hydrateSession();
          }
          useAuthStore.setState({ isHydrated: true });
        })();
      },
    },
  ),
);

bindAuthHandlers(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().logout(),
);

export const selectIsAuthenticated = (state: AuthState) =>
  Boolean(state.accessToken && state.user);
