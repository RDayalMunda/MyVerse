import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/;

const DEFAULT_API_URL = "https://myverse.redvalky.in/api/v1";

function getDevMachineHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0] ?? null;
  }

  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(':')[0] ?? null;
  }

  return null;
}

/** Map localhost in .env to a host reachable from the current device/emulator. */
function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

  if (!LOCALHOST_PATTERN.test(configured)) {
    return configured;
  }

  if (Platform.OS === 'web') {
    return configured;
  }

  // Android emulator: localhost is the emulator itself, not the dev machine
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return configured.replace(LOCALHOST_PATTERN, '10.0.2.2');
  }

  // Physical device: use the same LAN IP Metro uses (e.g. 192.168.x.x)
  const devHost = getDevMachineHost();
  if (devHost && !LOCALHOST_PATTERN.test(devHost)) {
    return configured.replace(LOCALHOST_PATTERN, devHost);
  }

  return configured;
}

export const API_URL = resolveApiUrl();

/** Origin without /api/v1 suffix — used for media image URLs */
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export const ACCENT_COLOR = '#208AEF';
