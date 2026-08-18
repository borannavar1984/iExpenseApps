// Calculation utilities for financial data aggregation
// Mirrors logic from web app calculations

import {
  Entry,
  NWSnapshot,
  InsuranceSnapshot,
  getMonthKey,
  roundAmount,
} from './dataModel';

// ============== ENTRY CALCULATIONS ==============

export function sumByCategory(
  entries: Entry[],
  category: string,
  month?: string
): number {
  return entries
    .filter((e) => {
      if (e.category !== category) return false;
      if (month && getMonthKey(e.date) !== month) return false;
      return true;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function sumByType(
  entries: Entry[],
  type: 'expense' | 'income',
  month?: string
): number {
  return entries
    .filter((e) => {
      if (e.type !== type) return false;
      if (month && getMonthKey(e.date) !== month) return false;
      return true;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function monthlyBreakdown(
  entries: Entry[]
): { [monthKey: string]: { income: number; expenses: number; net: number } } {
  const result: { [monthKey: string]: { income: number; expenses: number; net: number } } = {};

  entries.forEach((e) => {
    const month = getMonthKey(e.date);
    if (!result[month]) {
      result[month] = { income: 0, expenses: 0, net: 0 };
    }

    if (e.type === 'income') {
      result[month].income += e.amount;
    } else {
      result[month].expenses += e.amount;
    }
  });

  // Calculate net for each month
  Object.keys(result).forEach((month) => {
    result[month].net = result[month].income - result[month].expenses;
  });

  return result;
}

export function categoryTotals(
  entries: Entry[],
  type: 'expense' | 'income',
  month?: string
): { [category: string]: number } {
  const totals: { [category: string]: number } = {};

  entries
    .filter((e) => {
      if (e.type !== type) return false;
      if (month && getMonthKey(e.date) !== month) return false;
      return true;
    })
    .forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

  return totals;
}

// ============== NET WORTH CALCULATIONS ==============

export function nwLatestPerItem(
  snapshots: NWSnapshot[]
): { [itemName: string]: NWSnapshot } {
  const latest: { [itemName: string]: NWSnapshot } = {};

  snapshots.forEach((snap) => {
    if (
      !latest[snap.item] ||
      snap.date > latest[snap.item].date ||
      (snap.date === latest[snap.item].date && snap.createdAt > latest[snap.item].createdAt)
    ) {
      latest[snap.item] = snap;
    }
  });

  return latest;
}

export function nwTotalByCategory(
  snapshots: NWSnapshot[],
  category: string,
  currency: string,
  fxRates: { [key: string]: number } = {}
): number {
  const latest = nwLatestPerItem(snapshots);
  let total = 0;

  Object.values(latest).forEach((snap) => {
    if (snap.category !== category) return;

    // Convert to target currency if needed
    if (snap.currency === currency) {
      total += snap.value;
    } else {
      const rate = fxRates[`${snap.currency}/${currency}`];
      if (rate) {
        total += snap.value * rate;
      }
    }
  });

  return roundAmount(total);
}

export function nwTotalValue(
  snapshots: NWSnapshot[],
  currency: string,
  fxRates: { [key: string]: number } = {}
): number {
  const latest = nwLatestPerItem(snapshots);
  let total = 0;

  Object.values(latest).forEach((snap) => {
    // Assets are positive, Liabilities are negative
    const sign = snap.category.includes('Liabilities') ? -1 : 1;

    if (snap.currency === currency) {
      total += snap.value * sign;
    } else {
      const rate = fxRates[`${snap.currency}/${currency}`];
      if (rate) {
        total += snap.value * rate * sign;
      }
    }
  });

  return roundAmount(total);
}

export function nwProjection(
  value: number,
  growthRate: number,
  yearsAhead: number
): number {
  if (growthRate === 0 || !growthRate) return value;
  const rate = growthRate / 100;
  return roundAmount(value * Math.pow(1 + rate, yearsAhead));
}

// ============== INSURANCE CALCULATIONS ==============

export function insLatestPerProvider(
  snapshots: InsuranceSnapshot[]
): { [provider: string]: InsuranceSnapshot } {
  const latest: { [provider: string]: InsuranceSnapshot } = {};

  snapshots.forEach((snap) => {
    if (
      !latest[snap.provider] ||
      snap.date > latest[snap.provider].date ||
      (snap.date === latest[snap.provider].date && snap.createdAt > latest[snap.provider].createdAt)
    ) {
      latest[snap.provider] = snap;
    }
  });

  return latest;
}

export function insTotalByCoverage(
  snapshots: InsuranceSnapshot[],
  category: string,
  currency: string,
  fxRates: { [key: string]: number } = {}
): number {
  const latest = insLatestPerProvider(snapshots);
  let total = 0;

  Object.values(latest).forEach((snap) => {
    if (snap.category !== category) return;

    if (snap.currency === currency) {
      total += snap.value;
    } else {
      const rate = fxRates[`${snap.currency}/${currency}`];
      if (rate) {
        total += snap.value * rate;
      }
    }
  });

  return roundAmount(total);
}

export function monthlyInsuranceCost(
  snapshots: InsuranceSnapshot[]
): number {
  const latest = insLatestPerProvider(snapshots);
  let total = 0;

  Object.values(latest).forEach((snap) => {
    if (!snap.premium) return;

    const monthly =
      snap.premiumFrequency === 'yearly'
        ? snap.premium / 12
        : snap.premium;
    total += monthly;
  });

  return roundAmount(total);
}

export function insActiveCount(snapshots: InsuranceSnapshot[]): number {
  const latest = insLatestPerProvider(snapshots);
  const today = new Date().toISOString().split('T')[0];

  return Object.values(latest).filter((snap) => {
    if (!snap.renewalDate) return true; // No expiry date = always active
    return snap.renewalDate >= today;
  }).length;
}

export function insNextRenewal(snapshots: InsuranceSnapshot[]): string | null {
  const latest = insLatestPerProvider(snapshots);
  const today = new Date().toISOString().split('T')[0];
  const sixtyDaysAhead = new Date();
  sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);
  const sixtyDaysStr = sixtyDaysAhead.toISOString().split('T')[0];

  let nextDate: string | null = null;

  Object.values(latest).forEach((snap) => {
    if (!snap.renewalDate) return;
    if (snap.renewalDate < today) return; // Skip expired
    if (snap.renewalDate > sixtyDaysStr) return; // Skip if more than 60 days

    if (!nextDate || snap.renewalDate < nextDate) {
      nextDate = snap.renewalDate;
    }
  });

  return nextDate;
}

export function insStatusBadge(
  renewalDate: string | null
): 'active' | 'expiring' | 'expired' {
  if (!renewalDate) return 'active';

  const today = new Date().toISOString().split('T')[0];
  const sixtyDaysAhead = new Date();
  sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);
  const sixtyDaysStr = sixtyDaysAhead.toISOString().split('T')[0];

  if (renewalDate < today) return 'expired';
  if (renewalDate <= sixtyDaysStr) return 'expiring';
  return 'active';
}

// ============== TREND ANALYSIS ==============

export interface TrendData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export function getTrend(
  entries: Entry[],
  monthsBack: number = 12
): TrendData[] {
  const breakdown = monthlyBreakdown(entries);
  const today = new Date();
  const data: TrendData[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;

    const { income = 0, expenses = 0, net = 0 } = breakdown[monthKey] || {};
    data.push({
      month: monthKey,
      income,
      expenses,
      net,
    });
  }

  return data;
}
