import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ActiveTab = 'dashboard' | 'expenses' | 'income' | 'networth' | 'insurance' | 'settings';
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface UIState {
  theme: 'light' | 'dark';
  activeTab: ActiveTab;
  modalOpen: boolean;
  modalType: string;
  syncStatus: SyncStatus;
  syncMessage: string;
}

const initialState: UIState = {
  theme: 'dark',
  activeTab: 'dashboard',
  modalOpen: false,
  modalType: '',
  syncStatus: 'idle',
  syncMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setActiveTab: (state, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modalOpen = true;
      state.modalType = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = '';
    },
    setSyncStatus: (state, action: PayloadAction<{ status: SyncStatus; message?: string }>) => {
      state.syncStatus = action.payload.status;
      if (action.payload.message) {
        state.syncMessage = action.payload.message;
      }
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setActiveTab,
  openModal,
  closeModal,
  setSyncStatus,
} = uiSlice.actions;

export default uiSlice.reducer;
