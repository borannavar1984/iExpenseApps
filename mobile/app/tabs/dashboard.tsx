import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, Button, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useAppSelector } from '../hooks/reduxHooks';
import { spacing, borderRadius, typography } from '../theme';
import {
  monthlyBreakdown,
  categoryTotals,
  getTrend,
  nwTotalValue,
  insLatestPerProvider,
  insTotalByCoverage,
  insActiveCount,
  insNextRenewal,
  monthlyInsuranceCost,
} from '../services/calculations';

const chartWidth = Dimensions.get('window').width - 40;

interface SummaryData {
  income: number;
  expenses: number;
  net: number;
}

export default function DashboardScreen() {
  const entries = useAppSelector((state) => state.entries.all);
  const nwSnapshots = useAppSelector((state) => state.networth.snapshots);
  const insSnapshots = useAppSelector((state) => state.insurance.snapshots);
  const userPrefs = useAppSelector((state) => state.preferences.user);
  const [trendMonths, setTrendMonths] = useState<'3' | '6' | '12'>('6');

  const currentMonth = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const monthSummary: SummaryData = useMemo(() => {
    const breakdown = monthlyBreakdown(entries);
    return breakdown[currentMonth] || { income: 0, expenses: 0, net: 0 };
  }, [entries, currentMonth]);

  const categoryData = useMemo(() => {
    const totals = categoryTotals(entries, 'expense', currentMonth);
    return Object.entries(totals).map(([category, amount]) => ({
      name: category.substring(0, 12),
      amount,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  }, [entries, currentMonth]);

  const trendData = useMemo(() => {
    const months = parseInt(trendMonths);
    const trend = getTrend(entries, months);
    return {
      labels: trend.map((t) => t.month.substring(5)),
      datasets: [
        {
          data: trend.map((t) => t.income),
          color: () => '#4CAF50',
          strokeWidth: 2,
        },
        {
          data: trend.map((t) => t.expenses),
          color: () => '#F44336',
          strokeWidth: 2,
        },
      ],
    };
  }, [entries, trendMonths]);

  const netWorthData = useMemo(() => {
    return nwTotalValue(nwSnapshots, userPrefs.primaryCurrency);
  }, [nwSnapshots, userPrefs.primaryCurrency]);

  const insData = useMemo(() => {
    const latest = insLatestPerProvider(insSnapshots);
    const lifeTotal = insTotalByCoverage(insSnapshots, 'Life Insurance', userPrefs.primaryCurrency);
    const healthTotal = insTotalByCoverage(insSnapshots, 'Health Insurance', userPrefs.primaryCurrency);
    const activeCount = insActiveCount(insSnapshots);
    const nextRenewal = insNextRenewal(insSnapshots);
    const monthlyCost = monthlyInsuranceCost(insSnapshots);

    return {
      lifeTotal,
      healthTotal,
      activeCount,
      nextRenewal,
      monthlyCost,
    };
  }, [insSnapshots, userPrefs.primaryCurrency]);

  const hasData = entries.length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month Summary Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.summaryCards}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {userPrefs.primaryCurrency} {monthSummary.income.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>
                {userPrefs.primaryCurrency} {monthSummary.expenses.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Net Savings</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: monthSummary.net >= 0 ? '#4CAF50' : '#F44336' },
                ]}
              >
                {userPrefs.primaryCurrency} {monthSummary.net.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Category Breakdown */}
      {hasData && categoryData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          <Card style={styles.chartCard}>
            <Card.Content style={{ alignItems: 'center' }}>
              {categoryData.length > 0 ? (
                <PieChart
                  data={categoryData}
                  width={chartWidth}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: () => '#000',
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              ) : (
                <Text>No expense data for this month</Text>
              )}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Trend Chart */}
      {hasData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trend</Text>
          <View style={styles.trendControl}>
            <SegmentedButtons
              value={trendMonths}
              onValueChange={(value) => setTrendMonths(value as '3' | '6' | '12')}
              buttons={[
                { value: '3', label: '3M' },
                { value: '6', label: '6M' },
                { value: '12', label: '12M' },
              ]}
              style={styles.segmentedButton}
            />
          </View>
          <Card style={styles.chartCard}>
            <Card.Content style={{ alignItems: 'center' }}>
              <LineChart
                data={trendData}
                width={chartWidth}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: () => '#000',
                  labelColor: () => '#7F7F7F',
                  style: { borderRadius: 8 },
                }}
                bezier
              />
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Net Worth Mini Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <Card style={styles.miniCard}>
          <Card.Content>
            <Text style={styles.miniCardLabel}>Net Worth</Text>
            <Text style={[styles.miniCardValue, { color: netWorthData >= 0 ? '#4CAF50' : '#F44336' }]}>
              {userPrefs.primaryCurrency} {netWorthData.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Insurance Coverage Mini Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insurance Coverage</Text>
        <View style={styles.insuranceGrid}>
          <Card style={styles.insCard}>
            <Card.Content>
              <Text style={styles.insCardLabel}>Life Coverage</Text>
              <Text style={styles.insCardValue}>
                {userPrefs.primaryCurrency} {insData.lifeTotal.toFixed(0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.insCard}>
            <Card.Content>
              <Text style={styles.insCardLabel}>Health Coverage</Text>
              <Text style={styles.insCardValue}>
                {userPrefs.primaryCurrency} {insData.healthTotal.toFixed(0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.insCard}>
            <Card.Content>
              <Text style={styles.insCardLabel}>Active Policies</Text>
              <Text style={styles.insCardValue}>{insData.activeCount}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.insCard}>
            <Card.Content>
              <Text style={styles.insCardLabel}>Monthly Cost</Text>
              <Text style={styles.insCardValue}>
                {userPrefs.primaryCurrency} {insData.monthlyCost.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {insData.nextRenewal && (
          <Card style={[styles.miniCard, { marginTop: spacing.md }]}>
            <Card.Content>
              <Text style={styles.miniCardLabel}>Next Renewal</Text>
              <Text style={styles.miniCardValue}>{insData.nextRenewal}</Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Empty State */}
      {!hasData && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No data yet</Text>
          <Text style={styles.emptyStateSubtext}>Add an expense to get started</Text>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBFE',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleMedium,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: '#79747E',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.headlineSmall,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: borderRadius.md,
    elevation: 1,
    paddingVertical: spacing.md,
  },
  miniCard: {
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  miniCardLabel: {
    ...typography.bodySmall,
    color: '#79747E',
    marginBottom: spacing.xs,
  },
  miniCardValue: {
    ...typography.headlineMedium,
    fontWeight: '700',
  },
  insuranceGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  insCard: {
    width: '48%',
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  insCardLabel: {
    ...typography.bodySmall,
    color: '#79747E',
    marginBottom: spacing.xs,
  },
  insCardValue: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
  trendControl: {
    marginBottom: spacing.md,
  },
  segmentedButton: {
    width: '100%',
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
    textAlign: 'center',
  },
});
