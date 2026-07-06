/**
 * Root-level toast host. Mount once in app/_layout.tsx inside SafeAreaProvider.
 * Toasts survive router.back() because this host stays mounted above the stack.
 *
 * Web vs native: same API; bottom offset uses safe-area insets on native and
 * a fixed tab-bar-friendly offset on web — see docs/UX.md.
 */
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useToastStore, type ToastVariant } from '@/stores/toast-store';

const TOAST_FOREGROUND = '#FFFFFF';
const TOAST_ENTER_MS = 250;
const TOAST_EXIT_MS = 200;

function toastBackgroundColor(
  variant: ToastVariant,
  colors: ReturnType<typeof useTheme>['colors'],
) {
  switch (variant) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'error':
      return colors.error;
  }
}

function toastIconName(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return 'checkmark-circle' as const;
    case 'warning':
      return 'warning' as const;
    case 'error':
      return 'alert-circle' as const;
  }
}

const WEB_BOTTOM_OFFSET = 24;
const NATIVE_TAB_BAR_OFFSET = 56;

export function AppToastHost() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toast = useToastStore((state) => state.toast);
  const dismissToast = useToastStore((state) => state.dismissToast);

  const bottom =
    Platform.OS === 'web'
      ? WEB_BOTTOM_OFFSET
      : Math.max(insets.bottom, 12) + NATIVE_TAB_BAR_OFFSET;

  return (
    <View style={[styles.host, { bottom }]} pointerEvents="box-none">
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInUp.duration(TOAST_ENTER_MS).springify().damping(20).stiffness(240)}
          exiting={FadeOutDown.duration(TOAST_EXIT_MS)}
          style={styles.animatedWrap}
        >
          <Pressable
            onPress={() => dismissToast(toast.id)}
            style={[
              styles.toast,
              {
                backgroundColor: toastBackgroundColor(toast.variant, colors),
                shadowColor: colors.text,
              },
            ]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Ionicons
              name={toastIconName(toast.variant)}
              size={20}
              color={TOAST_FOREGROUND}
            />
            <Text style={[styles.message, { color: TOAST_FOREGROUND }]} numberOfLines={3}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { pointerEvents: 'box-none' as const } : {}),
  },
  animatedWrap: {
    width: '100%',
    maxWidth: 480,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
});
