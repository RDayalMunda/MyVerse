import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const resolvedScheme = scheme === 'dark' ? 'dark' : 'light';
  return {
    scheme: resolvedScheme,
    colors: Colors[resolvedScheme],
  };
}
