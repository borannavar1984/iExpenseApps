import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences, CloudConfig } from '../services/dataModel';

interface PreferencesState {
  user: UserPreferences;
  cloudConfig: CloudConfig | null;
}

const initialState: PreferencesState = {
  user: {
    name: '',
    primaryCurrency: 'USD',
    secondaryCurrency: null,
    onboarded: false,
  },
  cloudConfig: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.user = { ...state.user, ...action.payload };
    },
    setCloudConfig: (state, action: PayloadAction<CloudConfig | null>) => {
      state.cloudConfig = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.user.name = action.payload;
    },
    setPrimaryCurrency: (state, action: PayloadAction<string>) => {
      state.user.primaryCurrency = action.payload;
    },
    setSecondaryCurrency: (state, action: PayloadAction<string | null>) => {
      state.user.secondaryCurrency = action.payload;
    },
    setOnboarded: (state, action: PayloadAction<boolean>) => {
      state.user.onboarded = action.payload;
    },
    clearPreferences: (state) => {
      state.user = initialState.user;
      state.cloudConfig = null;
    },
  },
});

export const {
  setUserPreferences,
  setCloudConfig,
  setName,
  setPrimaryCurrency,
  setSecondaryCurrency,
  setOnboarded,
  clearPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
