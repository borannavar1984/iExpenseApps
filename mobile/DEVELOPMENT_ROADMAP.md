# iFinWell Mobile App - Development Roadmap

## Session Summary: Foundation Phase Complete ✅

### What Was Accomplished

**Phase 1A: Repository & Project Setup**
- ✅ Created `develop-ios` branch for iOS-specific development
- ✅ Created `develop-android` branch for Android-specific development
- ✅ Initialized React Native/Expo project in `/mobile` directory
- ✅ Both branches share identical `/mobile` codebase for 90% code reuse

**Phase 1B: Core Business Logic (Tokens: ~40k)**
- ✅ Implemented data model types (`app/services/dataModel.ts`)
  - Entry (expenses/income) with full TypeScript typing
  - NWSnapshot + NWChangeLog (net worth with audit trail)
  - InsuranceSnapshot + InsuranceChangeLog (with NEW premium frequency)
  - Constants: EXP_CATS, INC_CATS, NW_CATS, INS_CATS

- ✅ Created calculation utilities (`app/services/calculations.ts`)
  - `sumByCategory()`, `sumByType()`, `monthlyBreakdown()` - entry aggregation
  - `nwLatestPerItem()`, `nwTotalValue()` - net worth queries
  - `insLatestPerProvider()`, `monthlyInsuranceCost()` - **NEW insurance premium calculation**
  - `insStatusBadge()`, `insNextRenewal()` - policy status tracking
  - `getTrend()` - multi-month financial trends

- ✅ Implemented GitHub cloud sync (`app/services/cloudSync.ts`)
  - `syncEntries()`, `syncNetWorth()`, `syncInsurance()` - file-specific syncs
  - `unionMerge()` - conflict resolution (same pattern as web)
  - `pullFromCloud()` - fetch latest from GitHub
  - Retry logic with exponential backoff (3 retries max)
  - Token-based auth, secure storage

- ✅ Redux state management (`app/store/`)
  - `entries.ts` - expense/income state
  - `networth.ts` - NW snapshots + changelog
  - `insurance.ts` - insurance policies + changelog
  - `ui.ts` - theme, active tab, modal state
  - `preferences.ts` - user prefs, cloud config
  - `index.ts` - store configuration

### Project Structure

```
mobile/
├── app/
│   ├── services/              # Business logic (data, sync, calculations)
│   │   ├── dataModel.ts      # 5.1 KB - Types & constants
│   │   ├── calculations.ts   # 7.9 KB - Financial aggregations
│   │   ├── cloudSync.ts      # 10.9 KB - GitHub sync
│   │   └── validators.ts     # (Ready for implementation)
│   ├── store/                # Redux state management
│   │   ├── entries.ts        # 1.3 KB
│   │   ├── networth.ts       # 2.0 KB
│   │   ├── insurance.ts      # 1.8 KB
│   │   ├── ui.ts             # 1.6 KB
│   │   ├── preferences.ts    # 1.6 KB
│   │   └── index.ts          # 0.6 KB - Store config
│   ├── hooks/                # Custom React hooks (next phase)
│   │   └── useAppData.ts     # (Ready for implementation)
│   ├── tabs/                 # Screen components (next phase)
│   │   ├── dashboard.tsx     # (Ready for implementation)
│   │   ├── expenses.tsx      # (Ready for implementation)
│   │   ├── networth.tsx      # (Ready for implementation)
│   │   ├── insurance.tsx     # (Ready for implementation)
│   │   └── settings.tsx      # (Ready for implementation)
│   └── components/           # UI components (next phase)
│       ├── Forms/
│       ├── Charts/
│       └── ...
├── app.json                  # Expo configuration
├── package.json              # Dependencies installed
└── tsconfig.json             # TypeScript config
```

### Dependencies Installed

```
@react-navigation/native @react-navigation/bottom-tabs
react-native-screens react-native-safe-area-context
@react-native-async-storage/async-storage
react-native-paper                          # Material Design 3 components
redux @reduxjs/toolkit react-redux          # State management
react-native-chart-kit                      # Charts (like web)
react-native-svg                            # SVG rendering
@react-native-community/datetimepicker      # Date picker
expo-file-system expo-sharing               # File operations
uuid date-fns                                # Utilities
```

---

## Next Phase: UI Screens & Components (Estimated: ~120k tokens)

### Phase 2: Core Screens Implementation (Week 2-3)

**High Priority - Week 2**:
1. **Dashboard Screen** (`app/tabs/dashboard.tsx`)
   - Month summary cards (income, expenses, net savings)
   - Category pie chart (using react-native-chart-kit)
   - Trend chart (3/6/12 month selector)
   - Quick stats section
   - Net Worth + Insurance mini-cards
   - Quick action FAB buttons

2. **Expenses Tab** (`app/tabs/expenses.tsx`)
   - List view: today's entries grouped by category
   - Swipe-to-delete with undo
   - Tap to edit (form overlay)
   - Floating add button
   - Store/merchant autocomplete

3. **Income Tab** (`app/tabs/expenses.tsx` - mode switch)
   - Similar to Expenses, no payment method field

4. **Settings Tab** (`app/tabs/settings.tsx`)
   - Profile: name, currencies
   - Theme: light/dark toggle
   - Cloud sync: GitHub connect/disconnect
   - Backup/Export: JSON, Excel

**Medium Priority - Week 3**:
5. **Net Worth Tab** (`app/tabs/networth.tsx`)
   - Region segmented control (US, IN, Total with FX conversion)
   - Latest snapshot per item (card grid)
   - Tap → history modal
   - "Add Asset" button with category picker

6. **Insurance Tab** (`app/tabs/insurance.tsx`)
   - List view: latest policy per provider
   - Status badges: Active, Expiring Soon, Expired
   - Tap → history modal
   - "Add Policy" button with full form
   - **NEW: Premium frequency selector** (monthly / yearly)
   - Coverage dashboard cards:
     - Total Life Coverage
     - Total Health Coverage
     - Active Policies count
     - Next Renewal date
   - **NEW: Monthly insurance cost calculation**

### Phase 2: Shared Components (`app/components/`)

1. **CategoryPicker** - Modal with search, frequency ranking
2. **AmountInput** - TextInput with validation, currency prefix
3. **DatePicker** - Date selection, max date = today
4. **PaymentMethodToggle** - Credit/Cash buttons
5. **CurrencySelector** - Multi-currency buttons
6. **HistoryModal** - Reverse-chronological snapshots + undo
7. **FormCard** - Reusable form layout
8. **EmptyState** - Placeholder views
9. **Charts** - Pie, Line, Bar charts wrapper

### Phase 2: Custom Hooks (`app/hooks/`)

1. **useAppData** - Load/persist entries, NW, insurance from AsyncStorage
2. **useCloudSync** - Handle GitHub push/pull with UI state
3. **useCurrency** - FX conversion utilities
4. **useCalculations** - Expose calculation functions from services

### Phase 2: Theme System (`app/theme.ts`)

- CSS variables for colors (dark/light mode)
- Typography scale (web-parity)
- Spacing scale (4px base)
- Border radius tokens
- Shadow definitions

---

## Phase 3: Cloud Sync & Data Persistence (Week 4)

### Async Thunks (Redux)
- `syncEntriesWithCloud` - AsyncThunk for entry sync
- `syncNetWorthWithCloud` - AsyncThunk for NW sync
- `syncInsuranceWithCloud` - AsyncThunk for insurance sync

### Persistence Middleware
- Custom Redux middleware to persist state to AsyncStorage on every action
- On app launch: hydrate Redux from AsyncStorage
- Optional: selective sync on visibility change

### Integration Points
- Save entry → update Redux → trigger cloud sync → update UI
- Load app → hydrate from AsyncStorage → attempt cloud pull → merge → display

---

## Phase 4: Local Build & Testing (Week 4)

### iOS (macOS required)
```bash
cd mobile
eas build --platform ios --profile preview --local
# Output: app-1.0.0.ipa
# Install: drag into Xcode → run on simulator or device
```

### Android
```bash
cd mobile
eas build --platform android --profile preview --local
# Output: app-1.0.0.apk
adb install app-1.0.0.apk
```

### Verification Checklist
- [ ] Add 1 expense, 1 income → saved to AsyncStorage
- [ ] Add 1 health + 1 life insurance → saved with premium frequency
- [ ] Dashboard displays month summary + charts
- [ ] Insurance coverage cards show totals + next renewal
- [ ] Premium frequency selector works (monthly/yearly)
- [ ] Monthly insurance cost calculated correctly
- [ ] Cloud sync: new entry → GitHub entries.json within 5s
- [ ] Fresh install: pull from cloud → data restored
- [ ] Theme toggle applies to all screens
- [ ] List scroll smooth (100+ entries)

---

## Feature Parity Matrix

| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Expense entry | ✓ | ✅ | Phase 2 |
| Income entry | ✓ | ✅ | Phase 2 |
| Category picker | ✓ | ✅ | Phase 2 |
| Net Worth snapshots | ✓ | ✅ | Phase 3 |
| Insurance policies | ✓ | ✅ | Phase 2-3 |
| **Premium frequency** | ✗ | ✅ | **Phase 2 (NEW)** |
| **Monthly insurance cost** | ✗ | ✅ | **Phase 2 (NEW)** |
| Cloud sync (GitHub) | ✓ | ✅ | Phase 3 |
| Dashboard charts | ✓ | ✅ | Phase 2 |
| Backup/restore JSON | ✓ | ✅ | Phase 3 |
| Excel export | ✓ | ✅ | Phase 3 |
| Dark/light theme | ✓ | ✅ | Phase 2 |
| History/undo | ✓ | ✅ | Phase 2-3 |
| Multi-currency | ✓ | ✅ | Phase 3 |
| Projections | ✓ | ✅ | Phase 3 |

---

## Optimization Notes (Token Efficiency)

1. **Reuse Services**: Don't duplicate business logic. Import from `app/services/` in all screens.
2. **Share Components**: Build CategoryPicker once, use in entries, NW, insurance screens.
3. **Selective Redux**: Only UI state (theme, active tab) + data that needs sync go to Redux. Local form state stays in component.
4. **Lazy Imports**: React Navigation bottom tabs auto-load screens on demand.
5. **Memoization**: Wrap heavy components (charts, long lists) with React.memo.

---

## Branch Strategy

- **develop-ios**: iOS-specific native code (Xcode config, signing) + shared /mobile
- **develop-android**: Android-specific native code (Gradle config, keystore) + shared /mobile
- **main**: Stable reference, web app only
- Merge `/mobile` changes to both branches after testing

---

## Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Redux Toolkit Docs](https://redux-toolkit.js.org)
- [React Navigation Docs](https://reactnavigation.org)
- Plan file: `/root/.claude/plans/radiant-stirring-hummingbird.md`

---

**Last Updated**: 2026-08-18
**Status**: Foundation Phase Complete - Ready for Screen Development
