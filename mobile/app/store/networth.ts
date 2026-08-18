import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NWSnapshot, NWChangeLog } from '../services/dataModel';

interface NetWorthState {
  snapshots: NWSnapshot[];
  changeLog: NWChangeLog[];
  editing: NWSnapshot | null;
  selectedRegion: 'US' | 'IN' | 'total';
}

const initialState: NetWorthState = {
  snapshots: [],
  changeLog: [],
  editing: null,
  selectedRegion: 'total',
};

const netWorthSlice = createSlice({
  name: 'networth',
  initialState,
  reducers: {
    setSnapshots: (state, action: PayloadAction<NWSnapshot[]>) => {
      state.snapshots = action.payload;
    },
    addSnapshot: (state, action: PayloadAction<NWSnapshot>) => {
      state.snapshots.push(action.payload);
    },
    updateSnapshot: (state, action: PayloadAction<NWSnapshot>) => {
      const index = state.snapshots.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.snapshots[index] = action.payload;
      }
    },
    deleteSnapshotById: (state, action: PayloadAction<string>) => {
      state.snapshots = state.snapshots.filter((s) => s.id !== action.payload);
    },
    setChangeLog: (state, action: PayloadAction<NWChangeLog[]>) => {
      state.changeLog = action.payload;
    },
    addChangeLogEntry: (state, action: PayloadAction<NWChangeLog>) => {
      state.changeLog.push(action.payload);
    },
    setEditing: (state, action: PayloadAction<NWSnapshot | null>) => {
      state.editing = action.payload;
    },
    setSelectedRegion: (state, action: PayloadAction<'US' | 'IN' | 'total'>) => {
      state.selectedRegion = action.payload;
    },
    clearNetWorth: (state) => {
      state.snapshots = [];
      state.changeLog = [];
      state.editing = null;
    },
  },
});

export const {
  setSnapshots,
  addSnapshot,
  updateSnapshot,
  deleteSnapshotById,
  setChangeLog,
  addChangeLogEntry,
  setEditing,
  setSelectedRegion,
  clearNetWorth,
} = netWorthSlice.actions;

export default netWorthSlice.reducer;
