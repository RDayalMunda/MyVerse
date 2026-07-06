import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { AuthHeaderActions } from '@/components/navigation/auth-header';
import { useTheme } from '@/hooks/use-theme';
import { canManageUsers, canReadStaff } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function TabsLayout() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const showUsersTab = canManageUsers(user?.role);
  const showStaffTab = canReadStaff(user?.role);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textSecondary,
        headerRightContainerStyle: { paddingRight: 16 },
        headerRight: () => <AuthHeaderActions />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: 'Staff',
          href: showStaffTab ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          href: showUsersTab ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
