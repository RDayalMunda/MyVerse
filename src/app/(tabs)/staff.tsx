import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StaffCard, StaffCardSkeleton } from '@/components/staff/staff-card';
import { StaffCreateFab } from '@/components/staff/staff-create-fab';
import { EmptyState } from '@/components/projects/project-card';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { CREATE_FAB_LIST_PADDING } from '@/components/ui/create-fab';
import { useStaffList } from '@/hooks/use-staff-list';
import { useStaleListRefetch } from '@/hooks/use-stale-list-refetch';
import { useTheme } from '@/hooks/use-theme';
import {
  canReadStaff,
  canUpdateOwnStaffProfile,
  shouldShowStaffCreateFab,
} from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function StaffScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const showFab = shouldShowStaffCreateFab(user);
  const isStaff = canUpdateOwnStaffProfile(user?.role);
  const { staff, meta, isLoading, isLoadingMore, error, refetch, loadMore } =
    useStaffList();

  useStaleListRefetch('staff', refetch);

  const listPaddingBottom =
    insets.bottom + (showFab ? CREATE_FAB_LIST_PADDING : 16);

  if (!canReadStaff(user?.role)) {
    return (
      <PlaceholderScreen
        title="Sign in required"
        subtitle="Staff directory is available to signed-in staff and admin accounts."
        iconName="people-outline"
        denied
      />
    );
  }

  if (isLoading && staff.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.list, { paddingBottom: listPaddingBottom }]}>
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.text }]}>Staff</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              Browse staff profiles
            </Text>
          </View>
          <StaffCardSkeleton />
          <StaffCardSkeleton />
        </View>
        <StaffCreateFab />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={[styles.list, { paddingBottom: listPaddingBottom }]}
        data={staff}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.tint} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.text }]}>Staff</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              Browse staff profiles
            </Text>
            {meta ? (
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {meta.total} profile{meta.total === 1 ? '' : 's'}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          error ? (
            <EmptyState message={error} actionLabel="Try again" onAction={refetch} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                message={
                  isStaff
                    ? 'Your profile is not listed yet. Complete your profile to appear here.'
                    : 'No staff profiles yet.'
                }
              />
              {isStaff ? (
                <Pressable
                  onPress={() => {
                    const profileId = user?.staffProfile?.id;
                    router.push(
                      (profileId ? `/staff/${profileId}` : '/staff/edit') as Href,
                    );
                  }}
                >
                  <Text style={[styles.joinLink, { color: colors.tint }]}>
                    Edit your profile
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )
        }
        renderItem={({ item }) => <StaffCard staff={item} />}
        onEndReached={() => loadMore()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.tint} />
            </View>
          ) : null
        }
      />
      <StaffCreateFab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 4, marginBottom: 8 },
  heading: { fontSize: 28, fontWeight: '700' },
  subheading: { fontSize: 15 },
  count: { fontSize: 13, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  emptyWrap: { gap: 12, alignItems: 'center' },
  joinLink: { fontSize: 15, fontWeight: '600' },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
});
