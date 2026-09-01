# iExpenseApps: Multi-Agent Development Framework

## Standing Rules for Claude Code Sessions

### 1. Plan-First Development
- **ALWAYS start in plan mode** for any non-trivial task
- Write a clear plan with:
  - Files to change
  - Approach and rationale
  - Risks and tradeoffs
- **WAIT for product owner approval** before writing code
- Trivial tasks (typo fixes, one-line changes) may skip planning

### 2. Role Assignment
**Main Session (Orchestrator)**
- Owns the full development task flow
- Writes code for main features and logic
- Delegates heavy lifting to subagents
- Manages code reviews and QA gates
- Makes final decisions on implementation

**Subagents (Specialized, Token-Conscious)**
- Only spawned when needed, not for every task
- Researcher: Studies comparable apps, suggests improvements (read-only)
- Reviewer: Reviews code quality/security after changes (read-only)
- QA: Writes/runs tests, validates functionality
- Each agent keeps its own context clean with narrow tool access

### 3. Keep Main Thread Lean
- Hand off large file-reading to agents (they have Glob, Grep, Read)
- Move research/investigation to researcher subagent
- Let reviewer/QA agents focus on their specialty
- Main session stays focused on orchestration and coding

### 4. Code Review & QA Gates (REQUIRED)
After ANY code changes:
1. **Reviewer subagent** runs to check quality and security
2. **QA subagent** writes and runs tests
3. Only commit when both give green light
4. Fixes go through same gate again

### 5. Commit Strategy
- Commit in **small, reviewable steps**
- One feature = one commit (unless large, then multiple logical commits)
- Clear, descriptive commit messages with context
- No mega-commits; easier to review and revert if needed

---

## Subagent Details

### researcher (Haiku Model)
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch (read-only)
- **Use for**: Analyzing competitors, suggesting features, research questions
- **Output**: Prioritized plan for PO approval
- **Constraint**: Cannot modify code

### reviewer (Sonnet Model)
- **Tools**: Read, Glob, Grep (read-only)
- **Use for**: Post-change quality and security review
- **Output**: Specific findings with file:line references
- **Constraint**: Cannot modify code
- **Required**: Run after every code change

### qa (Sonnet Model)
- **Tools**: Read, Glob, Grep, Bash, Edit
- **Use for**: Test writing, test execution, validation
- **Output**: Test results, pass/fail counts, coverage gaps
- **Constraint**: Focused on testing only, not feature development
- **Required**: Run after every code change

---

## Workflow Summary
1. **Product owner** identifies task and approves plan
2. **Main session** (orchestrator) handles development and architecture
3. **Researcher** agent investigates if needed (before planning)
4. **Main session** writes code per approved plan
5. **Reviewer** agent audits for quality/security
6. **QA** agent writes tests and validates
7. **Main session** commits once both gates pass
8. Repeat for next task

**Key principle**: Token efficiency via delegation. Main thread stays focused; heavy lifting dispersed to specialized agents with appropriate models and tools.

---

## Mobile App Development (iOS & Android)

### Quick Setup for Claude Code

Claude Code can automate mobile app setup and testing. Run this in any session:

```bash
# Clone and setup mobile app
cd mobile
npm install

# Start development server
npm start
```

### Project Structure

```
iExpenseApps/
├── mobile/                    (React Native + Expo)
│   ├── App.tsx               (Root component with navigation)
│   ├── app/
│   │   ├── services/         (Business logic: data model, cloud sync, calculations)
│   │   ├── store/            (Redux state management)
│   │   ├── hooks/            (useAppData, reduxHooks)
│   │   ├── tabs/             (Screen components: dashboard, expenses, networth, insurance, settings)
│   │   └── theme.ts          (Material Design 3 theme)
│   ├── package.json
│   ├── app.json              (Expo configuration)
│   ├── babel.config.js
│   ├── index.js              (Entry point)
│   └── tsconfig.json
├── index.html                (Web app - legacy)
└── CLAUDE.md                 (This file)
```

### Running on iPhone/Android

**Option 1: Local Testing with Expo Go (Fastest)**
```bash
cd mobile
npm start
# Scan QR code with Expo Go app on real device
```

**Option 2: Build for Local Install**
```bash
cd mobile

# iOS (macOS required)
eas build --platform ios --profile preview --local

# Android
eas build --platform android --profile preview --local
```

### Mobile App Features

✅ **Dashboard**: Month summary, charts, trends  
✅ **Expenses**: CRUD with category picker, date picker  
✅ **Net Worth**: Asset snapshots, regional breakdown  
✅ **Insurance**: Policy management with premium frequency (NEW)  
✅ **Settings**: Theme toggle, cloud sync config  

### NEW Features (Phase 2)

- **Premium Frequency Selector**: Monthly or yearly insurance premiums
- **Monthly Insurance Cost Calculation**: Automatic sum of all monthly premiums
- **Policy Status Badges**: Active, Expiring Soon, Expired
- **Theme Support**: Dark/light mode with Material Design 3

### Cloud Sync

Mobile app uses same GitHub sync as web app:
- `entries.json` - Expenses/Income
- `networth.json` - Net worth snapshots
- `insurance.json` - Insurance policies

Connect in Settings tab with GitHub token + repo name.

### Testing Checklist

- [ ] Add 1 expense, 1 income → appears in list
- [ ] Dashboard shows month summary
- [ ] Add health + life insurance → coverage cards update
- [ ] Premium frequency selector works
- [ ] Monthly cost calculates correctly
- [ ] Theme toggle (Settings) changes app
- [ ] Smooth scrolling with 100+ entries

### Development Branches

- `develop-ios` - iOS-specific development (shared `/mobile` codebase)
- `develop-android` - Android-specific development (shared `/mobile` codebase)
- `main` - Stable reference (web app only)

Both branches share identical `/mobile` code. Native-specific code stays isolated per platform.

### Common Tasks for Claude Code

**Start development server:**
```bash
cd mobile && npm start
```

**Install dependencies:**
```bash
cd mobile && npm install
```

**Type check:**
```bash
cd mobile && npx tsc --noEmit
```

**Build for testing:**
```bash
cd mobile && eas build --platform ios --profile preview --local
```

### Dependencies

- React Native 0.86 + Expo 57
- React Navigation (bottom tabs)
- Redux Toolkit + React-Redux
- React Native Paper (Material Design 3)
- react-native-chart-kit (Charts)
- @react-native-async-storage/async-storage (Local persistence)
- react-native-svg, date-fns, uuid
