import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createElement, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import {
  dateInputToUtcDate,
  formatDateForDisplay,
  toDateInputValue,
} from '@/lib/date-format';

type DateOfBirthFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  showError?: boolean;
  value?: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
};

export function DateOfBirthField({
  label = 'Date of birth',
  hint,
  error,
  showError = false,
  value = '',
  onChange,
  maximumDate = new Date(),
}: DateOfBirthFieldProps) {
  const { colors } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => {
    return dateInputToUtcDate(value) ?? new Date(2000, 0, 1);
  });

  const inputValue = toDateInputValue(value);
  const displayValue = formatDateForDisplay(inputValue) ?? 'Select date';

  function handleWebChange(nextValue: string) {
    onChange(toDateInputValue(nextValue));
  }

  function openPicker() {
    setDraftDate(dateInputToUtcDate(inputValue) ?? new Date(2000, 0, 1));
    setPickerOpen(true);
  }

  function handleNativeChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setPickerOpen(false);
      if (event.type === 'dismissed' || !selected) {
        return;
      }
      onChange(toDateInputValue(selected.toISOString()));
      return;
    }
    if (selected) {
      setDraftDate(selected);
    }
  }

  function confirmIosPicker() {
    onChange(toDateInputValue(draftDate.toISOString()));
    setPickerOpen(false);
  }

  function clearDate() {
    onChange('');
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      {Platform.OS === 'web' ? (
        <View
          style={[
            styles.webInputWrap,
            {
              borderColor: showError && error ? colors.error : colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {createElement('input', {
            type: 'date',
            value: inputValue,
            max: toDateInputValue(maximumDate.toISOString()),
            onChange: (event: { target: { value: string } }) =>
              handleWebChange(event.target.value),
            style: {
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: colors.text,
              fontSize: 16,
              padding: 0,
              outline: 'none',
            },
          })}
        </View>
      ) : (
        <Pressable
          onPress={openPicker}
          style={({ pressed }) => [
            styles.nativeTrigger,
            {
              borderColor: showError && error ? colors.error : colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: inputValue ? colors.text : colors.textSecondary, flex: 1 }}>
            {inputValue ? displayValue : 'Select date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.tint} />
        </Pressable>
      )}

      {inputValue ? (
        <Pressable onPress={clearDate}>
          <Text style={[styles.clear, { color: colors.error }]}>Clear date</Text>
        </Pressable>
      ) : null}

      {hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
      {showError && error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={pickerOpen} transparent animationType="slide">
          <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
            <Pressable
              style={[styles.sheet, { backgroundColor: colors.background }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setPickerOpen(false)}>
                  <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={confirmIosPicker}>
                  <Text style={{ color: colors.tint, fontWeight: '600' }}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                onChange={handleNativeChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && pickerOpen ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          onChange={handleNativeChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  webInputWrap: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nativeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  clear: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17 },
  errorText: { fontSize: 13, fontWeight: '500' },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
});
