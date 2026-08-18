import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, Button, TextInput, SegmentedButtons, IconButton, FAB, Chip } from 'react-native-paper';
import DateTimePickerModal from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useAppData } from '../hooks/useAppData';
import { addSnapshot, updateSnapshot, deleteSnapshotById } from '../store/insurance';
import { spacing, borderRadius, typography } from '../theme';
import { generateId, today, formatDate, INS_CATS } from '../services/dataModel';
import { insLatestPerProvider, insTotalByCoverage, insActiveCount, insStatusBadge, monthlyInsuranceCost } from '../services/calculations';
import type { InsuranceSnapshot } from '../services/dataModel';

interface FormState {
  category: string;
  provider: string;
  country: string;
  value: string;
  currency: string;
  premium: string;
  premiumFrequency: 'monthly' | 'yearly' | null;
  policyNumber: string;
  coveredMembers: string;
  beneficiary: string;
  startDate: string;
  renewalDate: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  category: INS_CATS[0],
  provider: '',
  country: '',
  value: '',
  currency: 'USD',
  premium: '',
  premiumFrequency: null,
  policyNumber: '',
  coveredMembers: '',
  beneficiary: '',
  startDate: today(),
  renewalDate: '',
  notes: '',
};

export default function InsuranceScreen() {
  const dispatch = useAppDispatch();
  const { persistInsuranceData } = useAppData();
  const snapshots = useAppSelector((state) => state.insurance.snapshots);
  const userPrefs = useAppSelector((state) => state.preferences.user);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'renewal' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dummySync, setDummySync] = useState(false);

  const latestSnapshots = useMemo(() => {
    return insLatestPerProvider(snapshots);
  }, [snapshots]);

  const displaySnapshots = useMemo(() => {
    return Object.values(latestSnapshots).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [latestSnapshots]);

  const lifeTotal = useMemo(() => insTotalByCoverage(snapshots, 'Life Insurance', userPrefs.primaryCurrency), [snapshots, userPrefs.primaryCurrency]);
  const healthTotal = useMemo(() => insTotalByCoverage(snapshots, 'Health Insurance', userPrefs.primaryCurrency), [snapshots, userPrefs.primaryCurrency]);
  const activeCount = useMemo(() => insActiveCount(snapshots), [snapshots]);
  const monthlyCost = useMemo(() => monthlyInsuranceCost(snapshots), [snapshots]);

  const handleDateChange = (event: any, selectedDate?: Date, type: 'start' | 'renewal' = 'start') => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setForm((prev) => ({
        ...prev,
        [type === 'start' ? 'startDate' : 'renewalDate']: dateStr,
      }));
    }
    setShowDatePicker(null);
  };

  const handleSaveSnapshot = async () => {
    if (!form.provider || !form.value || isNaN(parseFloat(form.value))) {
      Alert.alert('Invalid Input', 'Please fill in required fields');
      return;
    }

    const value = Math.round(parseFloat(form.value) * 100) / 100;
    const premium = form.premium ? Math.round(parseFloat(form.premium) * 100) / 100 : null;

    if (editingId) {
      const updated: InsuranceSnapshot = {
        id: editingId,
        date: form.startDate,
        category: form.category,
        provider: form.provider,
        country: form.country,
        value,
        currency: form.currency,
        premium,
        premiumFrequency: form.premiumFrequency,
        policyNumber: form.policyNumber || null,
        coveredMembers: form.coveredMembers || null,
        beneficiary: form.beneficiary || null,
        startDate: form.startDate,
        renewalDate: form.renewalDate || null,
        notes: form.notes || null,
        createdAt: new Date().toISOString(),
        source: 'correction',
        correctionOf: editingId,
      };
      dispatch(updateSnapshot(updated));
    } else {
      const newSnapshot: InsuranceSnapshot = {
        id: generateId(),
        date: form.startDate,
        category: form.category,
        provider: form.provider,
        country: form.country,
        value,
        currency: form.currency,
        premium,
        premiumFrequency: form.premiumFrequency,
        policyNumber: form.policyNumber || null,
        coveredMembers: form.coveredMembers || null,
        beneficiary: form.beneficiary || null,
        startDate: form.startDate,
        renewalDate: form.renewalDate || null,
        notes: form.notes || null,
        createdAt: new Date().toISOString(),
        source: 'initial',
        correctionOf: null,
      };
      dispatch(addSnapshot(newSnapshot));
    }

    await persistInsuranceData();
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
          await persistInsuranceData();
        },
      },
    ]);
  };

  const handleEditSnapshot = (snap: InsuranceSnapshot) => {
    setForm({
      category: snap.category,
      provider: snap.provider,
      country: snap.country,
      value: snap.value.toString(),
      currency: snap.currency,
      premium: snap.premium?.toString() || '',
      premiumFrequency: snap.premiumFrequency,
      policyNumber: snap.policyNumber || '',
      coveredMembers: snap.coveredMembers || '',
      beneficiary: snap.beneficiary || '',
      startDate: snap.startDate,
      renewalDate: snap.renewalDate || '',
      notes: snap.notes || '',
    });
    setEditingId(snap.id);
    setShowForm(true);
  };

  const getStatusColor = (renewalDate: string | null) => {
    const status = insStatusBadge(renewalDate);
    return status === 'active' ? '#4CAF50' : status === 'expiring' ? '#FF9800' : '#F44336';
  };

  const SnapshotRow = ({ item }: { item: InsuranceSnapshot }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.title}>{item.provider}</Text>
            <Text style={styles.subtitle}>{item.category}</Text>
            <Text style={styles.date}>{formatDate(item.startDate)}</Text>
            <View style={{ marginTop: spacing.xs }}>
              <Chip icon="shield" style={{ backgroundColor: getStatusColor(item.renewalDate), marginRight: spacing.xs }}>
                {insStatusBadge(item.renewalDate)}
              </Chip>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Text style={styles.value}>{item.currency} {item.value.toFixed(0)}</Text>
            {item.premium && (
              <Text style={styles.premium}>
                {userPrefs.primaryCurrency} {item.premium.toFixed(2)}/{item.premiumFrequency || 'month'}
              </Text>
            )}
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
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryLabel}>Life Coverage</Text>
                <Text style={styles.summaryValue}>{userPrefs.primaryCurrency} {lifeTotal.toFixed(0)}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryLabel}>Health Coverage</Text>
                <Text style={styles.summaryValue}>{userPrefs.primaryCurrency} {healthTotal.toFixed(0)}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryLabel}>Active Policies</Text>
                <Text style={styles.summaryValue}>{activeCount}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryLabel}>Monthly Cost</Text>
                <Text style={styles.summaryValue}>{userPrefs.primaryCurrency} {monthlyCost.toFixed(2)}</Text>
              </Card.Content>
            </Card>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No policies yet</Text>
          </View>
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={() => setShowForm(true)} />

      <Modal visible={showForm} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modal}>
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingId ? 'Edit' : 'New'} Policy</Text>
              <IconButton icon="close" onPress={() => setShowForm(false)} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Category</Text>
              <SegmentedButtons value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))} buttons={INS_CATS.map((c) => ({ value: c, label: c }))} style={styles.segmented} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Provider</Text>
              <TextInput label="e.g., HDFC" value={form.provider} onChangeText={(v) => setForm((p) => ({ ...p, provider: v }))} style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Country</Text>
              <TextInput label="e.g., India" value={form.country} onChangeText={(v) => setForm((p) => ({ ...p, country: v }))} style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Coverage Amount</Text>
              <TextInput label="0.00" value={form.value} onChangeText={(v) => setForm((p) => ({ ...p, value: v }))} keyboardType="decimal-pad" style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Currency</Text>
              <SegmentedButtons value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))} buttons={[{ value: 'USD', label: 'USD' }, { value: 'INR', label: 'INR' }]} style={styles.segmented} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Premium Amount</Text>
              <TextInput label="Optional" value={form.premium} onChangeText={(v) => setForm((p) => ({ ...p, premium: v }))} keyboardType="decimal-pad" style={styles.input} />
            </View>

            {form.premium && (
              <View style={styles.section}>
                <Text style={styles.label}>Premium Frequency</Text>
                <SegmentedButtons
                  value={form.premiumFrequency || ''}
                  onValueChange={(v) => setForm((p) => ({ ...p, premiumFrequency: v as 'monthly' | 'yearly' }))}
                  buttons={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  style={styles.segmented}
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Policy Number</Text>
              <TextInput label="Optional" value={form.policyNumber} onChangeText={(v) => setForm((p) => ({ ...p, policyNumber: v }))} style={styles.input} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Covered Members</Text>
              <TextInput label="e.g., Self + Spouse" value={form.coveredMembers} onChangeText={(v) => setForm((p) => ({ ...p, coveredMembers: v }))} style={styles.input} />
            </View>

            {form.category === 'Life Insurance' && (
              <View style={styles.section}>
                <Text style={styles.label}>Beneficiary</Text>
                <TextInput label="Optional" value={form.beneficiary} onChangeText={(v) => setForm((p) => ({ ...p, beneficiary: v }))} style={styles.input} />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Start Date</Text>
              <Button mode="outlined" onPress={() => setShowDatePicker('start')} style={styles.dateBtn}>
                {formatDate(form.startDate)}
              </Button>
              {showDatePicker === 'start' && <DateTimePickerModal value={new Date(form.startDate)} mode="date" display="spinner" onChange={(e, d) => handleDateChange(e, d, 'start')} maximumDate={new Date()} />}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Renewal Date</Text>
              <Button mode="outlined" onPress={() => setShowDatePicker('renewal')} style={styles.dateBtn}>
                {form.renewalDate ? formatDate(form.renewalDate) : 'Optional'}
              </Button>
              {showDatePicker === 'renewal' && <DateTimePickerModal value={form.renewalDate ? new Date(form.renewalDate) : new Date()} mode="date" display="spinner" onChange={(e, d) => handleDateChange(e, d, 'renewal')} />}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <TextInput label="Optional" value={form.notes} onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))} multiline numberOfLines={3} style={styles.input} />
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
  header: { marginBottom: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryCard: { flex: 1, minWidth: 150, borderRadius: borderRadius.md, elevation: 1 },
  summaryLabel: { ...typography.bodySmall, color: '#79747E', marginBottom: spacing.xs },
  summaryValue: { ...typography.titleLarge, fontWeight: '700' },
  card: { marginBottom: spacing.md, borderRadius: borderRadius.md, elevation: 1 },
  info: { flex: 1 },
  title: { ...typography.titleMedium, fontWeight: '600' },
  subtitle: { ...typography.bodySmall, color: '#79747E', marginTop: spacing.xs },
  date: { ...typography.bodySmall, color: '#79747E', marginTop: spacing.xs },
  cardActions: { alignItems: 'flex-end' },
  value: { ...typography.titleMedium, fontWeight: '700', color: '#2E7D32' },
  premium: { ...typography.bodySmall, color: '#79747E', marginTop: spacing.xs },
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
