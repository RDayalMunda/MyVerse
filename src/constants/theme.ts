import { ACCENT_COLOR } from './config';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#FFFFFF',
    surface: '#F4F6F8',
    border: '#E2E8F0',
    tint: ACCENT_COLOR,
    error: '#DC2626',
    errorBackground: '#FEF2F2',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    surface: '#1E2022',
    border: '#2D3135',
    tint: ACCENT_COLOR,
    error: '#F87171',
    errorBackground: '#3F1D1D',
  },
} as const;
