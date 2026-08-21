// Data types and constants for iFinWell mobile app
// Shared between iOS and Android implementations

// ============== ENTRY TYPES ==============

export type EntryType = 'expense' | 'income';
export type PaymentMethod = 'Credit' | 'Cash';

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  type: EntryType;
  category: string;
  amount: number; // cents precision (e.g., 1234 = $12.34)
  store: string | null;
  payment: PaymentMethod | '';
  note: string | null;
}

// ============== NET WORTH TYPES ==============

export type NWSourceType = 'initial' | 'correction' | 'undo';

export interface NWSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  item: string;
  value: number;
  growthRate: number | null;
  currency: string;
  createdAt: string; // ISO 8601
  source: NWSourceType;
  correctionOf: string | null;
}

export interface NWChangeLog {
  id: string;
  snapshotId: string;
  timestamp: string; // ISO 8601
  operation: 'create' | 'update' | 'undo';
  before: NWSnapshot | null;
  after: NWSnapshot | null;
  reason: string | null;
}

// ============== INSURANCE TYPES ==============

export type InsuranceCategory = 'Health Insurance' | 'Life Insurance';
export type PremiumFrequency = 'monthly' | 'yearly' | null;

export interface InsuranceSnapshot {
  id: string;
  date: string; // YYYY-MM-DD (start date)
  category: InsuranceCategory;
  provider: string;
  country: string;
  value: number; // coverage amount
  currency: string;
  premium: number | null;
  premiumFrequency: PremiumFrequency;
  policyNumber: string | null;
  coveredMembers: string | null;
  beneficiary: string | null;
  startDate: string; // YYYY-MM-DD
  renewalDate: string | null; // YYYY-MM-DD
  notes: string | null;
  createdAt: string; // ISO 8601
  source: NWSourceType;
  correctionOf: string | null;
}

export interface InsuranceChangeLog {
  id: string;
  snapshotId: string;
  timestamp: string; // ISO 8601
  operation: 'create' | 'update' | 'undo';
  before: InsuranceSnapshot | null;
  after: InsuranceSnapshot | null;
  reason: string | null;
}

// ============== PREFERENCES ==============

export interface UserPreferences {
  name: string;
  primaryCurrency: string;
  secondaryCurrency: string | null;
  onboarded: boolean;
}

export interface CloudConfig {
  owner: string; // GitHub username
  repo: string; // Private repo name
  token: string; // Personal Access Token
}

// ============== CONSTANTS ==============

export const EXP_CATS = [
  'Rent',
  'Home',
  'Travel',
  'Gas',
  'Transport',
  'Automotive',
  'Groceries',
  'Kids/Activities',
  'Shopping',
  'Gifts & Donations',
  'Health',
  'Education',
  'Personal',
  'Utilities/Phone',
  'Subscriptions',
  'Entertainment',
  'Dining Out',
  'Remittance',
  'Others',
];

export const INC_CATS = [
  'Salary',
  'Dividends',
  'Bonus',
  'Interest',
  'Gift',
  'Other',
];

export const NW_CATS = [
  'Cash & Bank',
  'Retirement (401k/IRA)',
  'Investments (Stocks)',
  'Real Estate',
  'Other Assets',
  'Liabilities/Debt',
];

export const INS_CATS: InsuranceCategory[] = [
  'Health Insurance',
  'Life Insurance',
];

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'SEK',
  'NZD',
];

// ============== CURRENCY & REGION MAPPINGS ==============

export const COUNTRY_TO_CURRENCY: { [key: string]: string } = {
  'United States': 'USD',
  'India': 'INR',
  'UK': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'China': 'CNY',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'New Zealand': 'NZD',
  'EU': 'EUR',
};

export const FX_RATES: { [key: string]: number } = {
  'USD/USD': 1,
  'INR/INR': 1,
  'EUR/EUR': 1,
  'GBP/GBP': 1,
  'USD/INR': 83.5,
  'INR/USD': 0.012,
  'USD/EUR': 0.92,
  'EUR/USD': 1.09,
  'USD/GBP': 0.79,
  'GBP/USD': 1.27,
  'EUR/INR': 91.2,
  'INR/EUR': 0.011,
};

// ============== UTILITY FUNCTIONS ==============

export function generateId(): string {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 15);
  return now + rand;
}

export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatAmount(amount: number, decimals: number = 2): string {
  return amount.toFixed(decimals);
}

export function parseAmount(str: string): number | null {
  const num = parseFloat(str);
  return isNaN(num) ? null : roundAmount(num);
}

export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return date instanceof Date && !isNaN(date.getTime());
}

export function isDateInFuture(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

export function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthKey(dateStr: string): string {
  // Returns YYYY-MM from YYYY-MM-DD
  return dateStr.substring(0, 7);
}

export function getMonthLabel(monthKey: string): string {
  // Converts YYYY-MM to "Jan 2024"
  const [year, month] = monthKey.split('-');
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
