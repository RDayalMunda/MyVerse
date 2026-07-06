import { create } from 'zustand';

export type ToastVariant = 'success' | 'warning' | 'error';

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

const TOAST_DURATION_MS = 3000;

type ToastState = {
  toast: ToastItem | null;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  dismissToast: (id: string) => void;
};

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleDismiss(id: string) {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }
  dismissTimer = setTimeout(() => {
    const current = useToastStore.getState().toast;
    if (current?.id === id) {
      useToastStore.setState({ toast: null });
    }
    dismissTimer = null;
  }, TOAST_DURATION_MS);
}

export const useToastStore = create<ToastState>((set, get) => ({
  toast: null,

  showSuccessToast: (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ toast: { id, message, variant: 'success' } });
    scheduleDismiss(id);
  },

  showWarningToast: (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ toast: { id, message, variant: 'warning' } });
    scheduleDismiss(id);
  },

  showErrorToast: (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ toast: { id, message, variant: 'error' } });
    scheduleDismiss(id);
  },

  dismissToast: (id) => {
    if (get().toast?.id === id) {
      set({ toast: null });
    }
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  },
}));

export function showSuccessToast(message: string) {
  useToastStore.getState().showSuccessToast(message);
}

export function showWarningToast(message: string) {
  useToastStore.getState().showWarningToast(message);
}

export function showErrorToast(message: string) {
  useToastStore.getState().showErrorToast(message);
}
