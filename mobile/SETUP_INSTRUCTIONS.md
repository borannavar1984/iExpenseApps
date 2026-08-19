# iFinWell Mobile App - Setup & Running Instructions

## Quick Start (30 seconds)

### For Claude Code Users

1. **Open Claude Code in this repository**
2. **Run in terminal:**
   ```bash
   cd mobile
   npm install
   npm start
   ```
3. **Scan QR code with Expo Go on your iPhone**

---

## Full Setup Instructions

### Prerequisites

- **Node.js** (https://nodejs.org/) - v16 or higher
- **Expo Go app** on iPhone (install from App Store)
- **iPhone on same WiFi as computer**

### Step 1: Clone Repository (If Not Already Done)

```bash
cd Desktop
git clone https://github.com/borannavar1984/iExpenseApps.git
cd iExpenseApps
git checkout develop-ios
cd mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

**⏳ Wait 5-10 minutes. This installs all required packages.**

When done, you'll see:
```
added XXX packages in Xs
```

### Step 3: Start Development Server

```bash
npm start
```

**⏳ Wait 30 seconds. You should see:**
```
› Metro waiting on exp://192.168.1.XXX:8081
› Press i to open iOS simulator
› Press a to open Android
› Press w to open web
› Press r to reload
› Press s to stop
```

**A QR code will appear above this output.**

### Step 4: Connect iPhone

On your **iPhone**:

1. Open **Expo Go** app
2. Tap the **📷 camera icon** at the bottom
3. **Point camera at QR code** on computer screen
4. Tap the notification that pops up
5. **Wait 30-60 seconds** for app to load

---

## Test the App

Once the app opens on your iPhone:

### Test Dashboard
- Tap **Dashboard** tab
- Should show "No data yet"

### Test Adding Expense
- Tap **Expenses** tab
- Tap **+** button
- Enter amount: `50.00`
- Select category: **Groceries**
- Tap **Save**
- Expense appears in list

### Test Adding Insurance
- Tap **Insurance** tab
- Tap **+** button
- Enter provider: **HDFC**
- Enter coverage amount: `500000`
- Enter premium: `5000`
- Select frequency: **Monthly** or **Yearly**
- Tap **Save**
- Policy appears with monthly cost calculation

### Test Theme
- Tap **Settings** tab
- Toggle **Dark Mode**
- App theme changes instantly

---

## Troubleshooting

### `npm: command not found`
**Solution**: Install Node.js from https://nodejs.org/

### `Cannot find module`
**Solution**: Run `npm install` again in mobile folder

### QR code doesn't appear
**Solution**: 
- Press `Ctrl+C` to stop
- Run `npm start` again
- Check internet connection

### App doesn't load on iPhone
**Solution**:
- Make sure iPhone and computer on same WiFi
- Close and reopen Expo Go
- Try scanning QR code again

### `Port 8081 is already in use`
**Solution**: 
- Press `Ctrl+C` to stop current process
- Wait 10 seconds
- Run `npm start` again

---

## Using Automated Setup Scripts

### Windows
```powershell
cd mobile
.\scripts\setup.bat
```

### macOS/Linux
```bash
cd mobile
bash scripts/setup.sh
```

These scripts:
- ✅ Check Node.js installation
- ✅ Install npm dependencies
- ✅ Install Expo CLI globally
- ✅ Provide next steps

---

## Project Structure

```
mobile/
├── App.tsx                    (Root component + navigation)
├── app/
│   ├── services/
│   │   ├── dataModel.ts      (Data types & constants)
│   │   ├── calculations.ts   (Financial calculations)
│   │   ├── cloudSync.ts      (GitHub sync)
│   │   └── validators.ts     (Validation functions)
│   ├── store/                (Redux state management)
│   │   ├── entries.ts
│   │   ├── networth.ts
│   │   ├── insurance.ts
│   │   ├── ui.ts
│   │   └── preferences.ts
│   ├── hooks/
│   │   ├── reduxHooks.ts     (Typed Redux hooks)
│   │   └── useAppData.ts     (Data persistence)
│   ├── tabs/                 (Screen components)
│   │   ├── dashboard.tsx
│   │   ├── expenses.tsx
│   │   ├── networth.tsx
│   │   ├── insurance.tsx
│   │   └── settings.tsx
│   └── theme.ts              (Material Design 3 theme)
├── app.json                  (Expo configuration)
├── babel.config.js
├── index.js                  (Entry point)
├── package.json
├── tsconfig.json
└── scripts/
    ├── setup.sh             (macOS/Linux setup)
    └── setup.bat            (Windows setup)
```

---

## Development Workflow

### Making Changes

1. **Edit code** in any file under `app/`
2. **Save file** (Ctrl+S)
3. **App hot-reloads** on iPhone automatically
4. **Test changes** on iPhone

### Common Commands

| Command | Action |
|---------|--------|
| `npm start` | Start dev server |
| `npm run lint` | Run linter |
| `Ctrl+C` | Stop dev server |
| Press `r` in terminal | Reload app on iPhone |
| Press `s` in terminal | Stop server |

---

## Cloud Sync Setup (Optional)

To enable GitHub cloud sync in Settings:

1. Get GitHub Personal Access Token
   - Go to https://github.com/settings/tokens
   - Create token with `repo` permissions

2. In App Settings:
   - Tap **Settings** tab
   - Scroll to **Cloud Sync**
   - Enter GitHub token
   - Enter GitHub username
   - Enter repository name
   - Tap **Connect**

3. Data syncs to:
   - `entries.json` - Expenses/Income
   - `networth.json` - Net Worth snapshots
   - `insurance.json` - Insurance policies

---

## Phase Implementation Status

✅ **Phase 1**: Foundation (Complete)
- Project setup
- Business logic (dataModel, calculations, cloudSync)
- Redux store configuration

✅ **Phase 2**: UI Screens (Complete)
- Dashboard, Expenses, Net Worth, Insurance, Settings screens
- Theme system with dark/light mode
- Data persistence (AsyncStorage)
- Premium frequency selector (NEW)
- Monthly insurance cost calculation (NEW)

⏳ **Phase 3**: Cloud Sync & Data Persistence (Next)
- AsyncStorage persistence middleware
- GitHub cloud sync integration
- Backup/restore functionality

⏳ **Phase 4**: Testing & Optimization (Future)
- iOS simulator testing
- Android emulator testing
- Performance optimization
- Build for app store distribution

---

## Support

For issues or questions:
1. Check this file first
2. See DEVELOPMENT_ROADMAP.md for architecture
3. Check CLAUDE.md for development guidelines

Happy coding! 🚀
