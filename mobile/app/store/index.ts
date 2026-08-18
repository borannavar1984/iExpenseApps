import { configureStore } from '@reduxjs/toolkit';
import entriesReducer from './entries';
import netWorthReducer from './networth';
import insuranceReducer from './insurance';
import uiReducer from './ui';
import preferencesReducer from './preferences';

export const store = configureStore({
  reducer: {
    entries: entriesReducer,
    networth: netWorthReducer,
    insurance: insuranceReducer,
    ui: uiReducer,
    preferences: preferencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
