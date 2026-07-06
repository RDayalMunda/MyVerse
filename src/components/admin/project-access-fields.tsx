import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AdminFormField } from '@/components/admin/admin-form-field';
import { OptionSheet, type OptionSheetItem } from '@/components/ui/option-sheet';
import { useTheme } from '@/hooks/use-theme';
import type { ProjectVisibility } from '@/types/project';

export type ProjectAccessFieldsValue = {
  visibility: ProjectVisibility;
  isAdult: boolean;
};

export const DEFAULT_PROJECT_ACCESS: ProjectAccessFieldsValue = {
  visibility: 'PUBLIC',
  isAdult: false,
};

export const VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  PUBLIC: 'Public',
  AUTHENTICATED: 'Signed-in users',
  STAFF_ONLY: 'Staff only',
  PRIVATE: 'Private',
};

export const VISIBILITY_DESCRIPTIONS: Record<ProjectVisibility, string> = {
  PUBLIC: 'Anyone who passes other access rules',
  AUTHENTICATED: 'Logged-in users only',
  STAFF_ONLY: 'Staff accounts only',
  PRIVATE: 'Hidden from catalog (admin preview only)',
};

const VISIBILITY_OPTIONS: ProjectVisibility[] = [
  'PUBLIC',
  'AUTHENTICATED',
  'STAFF_ONLY',
  'PRIVATE',
];

type ProjectAccessFieldsProps = {
  value: ProjectAccessFieldsValue;
  onChange: (value: ProjectAccessFieldsValue) => void;
  editable?: boolean;
};

export function ProjectAccessFields({
  value,
  onChange,
  editable = true,
}: ProjectAccessFieldsProps) {
  const { colors } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const sheetOptions: OptionSheetItem[] = VISIBILITY_OPTIONS.map((visibility) => ({
    id: visibility,
    label: VISIBILITY_LABELS[visibility],
    description: VISIBILITY_DESCRIPTIONS[visibility],
    trailing: value.visibility === visibility ? 'check' : 'chevron',
  }));

  return (
    <View style={styles.container}>
      <AdminFormField
        label="Visibility"
        hint="Who can view this project once it is published."
      >
        <Pressable
          disabled={!editable}
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.picker,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: !editable ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.pickerText}>
            <Text style={[styles.pickerLabel, { color: colors.text }]}>
              {VISIBILITY_LABELS[value.visibility]}
            </Text>
            <Text style={[styles.pickerDesc, { color: colors.textSecondary }]}>
              {VISIBILITY_DESCRIPTIONS[value.visibility]}
            </Text>
          </View>
          {editable ? (
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          ) : null}
        </Pressable>
      </AdminFormField>

      <AdminFormField
        label="18+ content"
        hint="When enabled, viewers must turn on 18+ content in their profile."
      >
        <View
          style={[
            styles.switchRow,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            Mark as adult content
          </Text>
          <Switch
            value={value.isAdult}
            onValueChange={(isAdult) => onChange({ ...value, isAdult })}
            disabled={!editable}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>
      </AdminFormField>

      <OptionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Project visibility"
        subtitle="Choose who can access this project"
        options={sheetOptions}
        selectedId={value.visibility}
        onSelect={(id) =>
          onChange({ ...value, visibility: id as ProjectVisibility })
        }
      />
    </View>
  );
}

export function projectAccessFromProject(project: {
  visibility: ProjectVisibility;
  isAdult: boolean;
}): ProjectAccessFieldsValue {
  return {
    visibility: project.visibility,
    isAdult: project.isAdult,
  };
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  pickerText: {
    flex: 1,
    gap: 2,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
});
