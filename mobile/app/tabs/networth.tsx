import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, Button, TextInput, SegmentedButtons, IconButton, FAB } from 'react-native-paper';
import DateTimePickerModal from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useAppData } from '../hooks/useAppData';
import { addSnapshot, updateSnapshot, deleteSnapshotById } from '../store/networth';
import { spacing, borderRadius, typography } from '../theme';
import { generateId, today, formatDate, NW_CATS } from '../services/dataModel';
import { nwLatestPerItem, nwTotalValue } from '../services/calculations';
import type { NWSnapshot } from '../services/dataModel';

interface FormState {
  category: string;
  item: string;
  value: string;
  currency: string;
  growthRate: string;
  date: string;
}

const INITIAL_FORM: FormState = {
  category: NW_CATS[0],
  item: '',
  value: '',
  currency: 'USD',
  growthRate: '',
  date: today(),
};

export default function NetWorthScreen() {
  const dispatch = useAppDispatch();
  const { persistNWData } = useAppData();
  const snapshots = useAppSelector((state) => state.networth.snapshots);
  const userPrefs = useAppSelector((state) => state.preferences.user);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'US' | 'IN' | 'total'>('total');

  const latestSnapshots = useMemo(() => {
    return nwLatestPerItem(snapshots);
  }, [snapshots]);

  const totalNW = useMemo(() => {
    return nwTotalValue(snapshots, userPrefs.primaryCurrency);
  }, [snapshots, userPrefs.primaryCurrency]);

  const displaySnapshots = useMemo(() => {
    return Object.values(latestSnapshots).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [latestSnapshots]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setForm((prev) => ({ ...prev, date: dateStr }));
    }
    setShowDatePicker(false);
  };

  const handleSaveSnapshot = async () => {
    if (!form.item || !form.value || isNaN(parseFloat(form.value))) {
      Alert.alert('Invalid Input', 'Please fill in all required fields');
      return;
    }

    const value = Math.round(parseFloat(form.value) * 100) / 100;
    const growthRate = form.growthRate ? parseFloat(form.growthRate) : null;

    if (editingId) {
      const updated: NWSnapshot = {
        id: editingId,
        date: form.date,
        category: form.category,
        item: form.item,
        value,
        growthRate,
        currency: form.currency,
        createdAt: new Date().toISOString(),
        source: 'correction',
        correctionOf: editingId,
      };
      dispatch(updateSnapshot(updated));
    } else {
      const newSnapshot: NWSnapshot = {
        id: generateId(),
        date: form.date,
        category: form.category,
        item: form.item,
        value,
        growthRate,
        currency: form.currency,
        createdAt: new Date().toISOString(),
        source: 'initial',
        correctionOf: null,
      };
      dispatch(addSnapshot(newSnapshot));
    }

    await persistNWData();
    setShowForm(false);
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleDeleteSnapshot = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          dispatch(deleteSnapshotById(id));
          await persistNWData();
        },
      },
    ]);
  };

  const handleEditSnapshot = (snap: NWSnapshot) => {
    setForm({
      category: snap.category,
      item: snap.item,
      value: snap.value.toString(),
      currency: snap.currency,
      growthRate: snap.growthRate?.toString() || '',
      date: snap.date,
    });
    setEditingId(snap.id);
    setShowForm(true);
  };

  const SnapshotRow = ({ item }: { item: NWSnapshot }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.title}>{item.item}</Text>
            <Text style={styles.subtitle}>{item.category}</Text>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.cardActions}>
            <Text style={styles.value}>{item.currency} {item.value.toFixed(2)}</Text>
            <View style={styles.buttons}>
              <IconButton icon="pencil" size={18} onPress={() => handleEditSnapshot(item)} style={{ margin: 0 }} />
              <IconButton icon="delete" size={18} iconColor="#F44336" onPress={() => handleDeleteSnapshot(item.id)} style={{ margin: 0 }} />
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={displaySnapshots}
        renderItem={({ item }) => <SnapshotRow item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Card style={styles.totalCard}>
              <Card.Content>
                <Text style={styles.totalLabel}>Total Net Worth</Text>
                <Text style={[styles.totalValue, { color: totalNW >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {userPrefs.primaryCurrency} {totalNW.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No snapshots yet</Text>
          </View>
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={() => setShowForm(true)} />

      <Modal visible={showForm} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modal}>
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingId ? 'Edit' : 'New'} Asset</Text>
              <IconButton icon="close" onPress={() => setShowForm(false)} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Category</Text>
              <SegmentedButtons value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))} buttons={NW_CATS.map((c) => ({ value: c, label: c }))} style={styles.segmented} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput label="e.g., Savings Account" value={form.item} onChangeText={(v) => setForm((p) => ({ ...p, item: v }))} style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Value</Text>
              <TextInput label="0.00" value={form.value} onChangeText={(v) => setForm((p) => ({ ...p, value: v }))} keyboardType="decimal-pad" style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Currency</Text>
              <SegmentedButtons value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))} buttons={[{ value: 'USD', label: 'USD' }, { value: 'INR', label: 'INR' }]} style={styles.segmented} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Growth Rate (%)</Text>
              <TextInput label="Optional" value={form.growthRate} onChangeText={(v) => setForm((p) => ({ ...p, growthRate: v }))} keyboardType="decimal-pad" style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Date</Text>
              <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
                {formatDate(form.date)}
              </Button>
              {showDatePicker && <DateTimePickerModal value={new Date(form.date)} mode="date" display="spinner" onChange={handleDateChange} maximumDate={new Date()} />}
            </View>

            <View style={styles.cardActions}>
              <Button mode="outlined" onPress={() => setShowForm(false)} style={styles.btn}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSaveSnapshot} style={styles.btn}>
                Save
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEFBFE' },
  listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.lg },
  totalCard: { borderRadius: borderRadius.md, elevation: 1 },
  totalLabel: { ...typography.bodySmall, color: '#79747E', marginBottom: spacing.xs },
  totalValue: { ...typography.headlineMedium, fontWeight: '700' },
  card: { marginBottom: spacing.md, borderRadius: borderRadius.md, elevation: 1 },
  info: { flex: 1 },
  title: { ...typography.titleMedium, fontWeight: '600' },
  subtitle: { ...typography.bodySmall, color: '#79747E', marginTop: spacing.xs },
  date: { ...typography.bodySmall, color: '#79747E', marginTop: spacing.xs },
  cardActions: { alignItems: 'flex-end' },
  value: { ...typography.titleMedium, fontWeight: '700', color: '#4CAF50' },
  buttons: { flexDirection: 'row', marginTop: spacing.xs },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyText: { ...typography.headlineSmall, textAlign: 'center' },
  fab: { position: 'absolute', margin: spacing.md, right: 0, bottom: 0 },
  modal: { flex: 1, backgroundColor: '#FEFBFE' },
  form: { flex: 1, paddingHorizontal: spacing.md },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#EFE1EB' },
  formTitle: { ...typography.headlineSmall, fontWeight: '700' },
  section: { marginTop: spacing.lg },
  label: { ...typography.labelMedium, fontWeight: '600', marginBottom: spacing.sm },
  input: { backgroundColor: '#F5F5F5' },
  segmented: { width: '100%' },
  dateBtn: { justifyContent: 'center', paddingVertical: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.xl },
  btn: { flex: 1 },
});
