import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  IconButton,
  FAB,
} from 'react-native-paper';
import DateTimePickerModal from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useAppData } from '../hooks/useAppData';
import { addEntry, updateEntry, deleteEntryById } from '../store/entries';
import { spacing, borderRadius, typography } from '../theme';
import { generateId, today, formatDate, EXP_CATS } from '../services/dataModel';
import type { Entry } from '../services/dataModel';

interface FormState {
  category: string;
  amount: string;
  store: string;
  payment: 'Credit' | 'Cash';
  date: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  category: EXP_CATS[0],
  amount: '',
  store: '',
  payment: 'Credit',
  date: today(),
  notes: '',
};

export default function ExpensesScreen() {
  const dispatch = useAppDispatch();
  const { persistEntries } = useAppData();
  const entries = useAppSelector((state) => state.entries.all);
  const userPrefs = useAppSelector((state) => state.preferences.user);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const expenseEntries = useMemo(() => {
    return entries
      .filter((e) => e.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const todayEntries = useMemo(() => {
    const todayStr = today();
    return expenseEntries.filter((e) => e.date === todayStr);
  }, [expenseEntries]);

  const groupedEntries = useMemo(() => {
    const grouped: { [key: string]: Entry[] } = {};
    expenseEntries.forEach((entry) => {
      const key = entry.category;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    return grouped;
  }, [expenseEntries]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setForm((prev) => ({ ...prev, date: dateStr }));
    }
    setShowDatePicker(false);
  };

  const handleSaveEntry = useCallback(async () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const amount = Math.round(parseFloat(form.amount) * 100) / 100;
    const entry: Entry = {
      id: editingId || generateId(),
      type: 'expense',
      date: form.date,
      category: form.category,
      amount,
      store: form.store || null,
      payment: form.payment,
      note: form.notes || null,
    };

    if (editingId) {
      dispatch(updateEntry(entry));
    } else {
      dispatch(addEntry(entry));
    }

    const updatedEntries = editingId
      ? entries.map((e) => (e.id === editingId ? entry : e))
      : [...entries, entry];

    await persistEntries(updatedEntries);
    setShowForm(false);
    setForm(INITIAL_FORM);
    setEditingId(null);
  }, [form, editingId, dispatch, entries, persistEntries]);

  const handleDeleteEntry = useCallback(
    (id: string) => {
      Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            dispatch(deleteEntryById(id));
            const updated = entries.filter((e) => e.id !== id);
            await persistEntries(updated);
          },
        },
      ]);
    },
    [dispatch, entries, persistEntries]
  );

  const handleEditEntry = useCallback((entry: Entry) => {
    setForm({
      category: entry.category,
      amount: entry.amount.toString(),
      store: entry.store || '',
      payment: entry.payment as 'Credit' | 'Cash',
      date: entry.date,
      notes: entry.note || '',
    });
    setEditingId(entry.id);
    setShowForm(true);
  }, []);

  const handleOpenForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(true);
  }, []);

  const EntryRow = ({ item }: { item: Entry }) => (
    <Card style={styles.entryCard}>
      <Card.Content>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <Text style={styles.entryCategory}>{item.category}</Text>
            {item.store && <Text style={styles.entryStore}>{item.store}</Text>}
            <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.entryActions}>
            <Text style={styles.entryAmount}>
              -{userPrefs.primaryCurrency} {item.amount.toFixed(2)}
            </Text>
            <View style={styles.entryButtons}>
              <IconButton
                icon="pencil"
                size={18}
                onPress={() => handleEditEntry(item)}
                style={{ margin: 0 }}
              />
              <IconButton
                icon="delete"
                size={18}
                iconColor="#F44336"
                onPress={() => handleDeleteEntry(item.id)}
                style={{ margin: 0 }}
              />
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={todayEntries.length > 0 ? todayEntries : expenseEntries}
        renderItem={({ item }) => <EntryRow item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add one</Text>
          </View>
        }
        ListHeaderComponent={
          expenseEntries.length > 0 ? (
            <Text style={styles.listHeader}>Recent Expenses ({expenseEntries.length})</Text>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleOpenForm}
      />

      <Modal visible={showForm} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Expense' : 'New Expense'}</Text>
              <IconButton
                icon="close"
                onPress={() => setShowForm(false)}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <SegmentedButtons
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                buttons={EXP_CATS.map((cat) => ({ value: cat, label: cat }))}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Amount</Text>
              <TextInput
                label="0.00"
                value={form.amount}
                onChangeText={(text) => setForm((prev) => ({ ...prev, amount: text }))}
                keyboardType="decimal-pad"
                style={styles.input}
                left={<TextInput.Affix text={userPrefs.primaryCurrency + ' '} />}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Store / Merchant</Text>
              <TextInput
                label="Optional"
                value={form.store}
                onChangeText={(text) => setForm((prev) => ({ ...prev, store: text }))}
                style={styles.input}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Payment Method</Text>
              <SegmentedButtons
                value={form.payment}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, payment: value as 'Credit' | 'Cash' }))
                }
                buttons={[
                  { value: 'Credit', label: 'Credit' },
                  { value: 'Cash', label: 'Cash' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Date</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {formatDate(form.date)}
              </Button>
              {showDatePicker && (
                <DateTimePickerModal
                  value={new Date(form.date)}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                label="Optional"
                value={form.notes}
                onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </View>

            <View style={styles.formActions}>
              <Button
                mode="outlined"
                onPress={() => setShowForm(false)}
                style={styles.formButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEntry}
                style={styles.formButton}
              >
                Save
              </Button>
            </View>

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBFE',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  listHeader: {
    ...typography.titleMedium,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    ...typography.headlineSmall,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...typography.bodyMedium,
    color: '#79747E',
    marginTop: spacing.sm,
  },
  entryCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryInfo: {
    flex: 1,
  },
  entryCategory: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  entryStore: {
    ...typography.bodySmall,
    color: '#79747E',
    marginTop: spacing.xs,
  },
  entryDate: {
    ...typography.bodySmall,
    color: '#79747E',
    marginTop: spacing.xs,
  },
  entryActions: {
    alignItems: 'flex-end',
  },
  entryAmount: {
    ...typography.titleMedium,
    fontWeight: '700',
    color: '#F44336',
  },
  entryButtons: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FEFBFE',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE1EB',
  },
  formTitle: {
    ...typography.headlineSmall,
    fontWeight: '700',
  },
  formSection: {
    marginTop: spacing.lg,
  },
  formLabel: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#F5F5F5',
  },
  segmentedButtons: {
    width: '100%',
  },
  dateButton: {
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  formButton: {
    flex: 1,
  },
});
