import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InsuranceSnapshot, InsuranceChangeLog } from '../services/dataModel';

interface InsuranceState {
  snapshots: InsuranceSnapshot[];
  changeLog: InsuranceChangeLog[];
  editing: InsuranceSnapshot | null;
}

const initialState: InsuranceState = {
  snapshots: [],
  changeLog: [],
  editing: null,
};

const insuranceSlice = createSlice({
  name: 'insurance',
  initialState,
  reducers: {
    setSnapshots: (state, action: PayloadAction<InsuranceSnapshot[]>) => {
      state.snapshots = action.payload;
    },
    addSnapshot: (state, action: PayloadAction<InsuranceSnapshot>) => {
      state.snapshots.push(action.payload);
    },
    updateSnapshot: (state, action: PayloadAction<InsuranceSnapshot>) => {
      const index = state.snapshots.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.snapshots[index] = action.payload;
      }
    },
    deleteSnapshotById: (state, action: PayloadAction<string>) => {
      state.snapshots = state.snapshots.filter((s) => s.id !== action.payload);
    },
    setChangeLog: (state, action: PayloadAction<InsuranceChangeLog[]>) => {
      state.changeLog = action.payload;
    },
    addChangeLogEntry: (state, action: PayloadAction<InsuranceChangeLog>) => {
      state.changeLog.push(action.payload);
    },
    setEditing: (state, action: PayloadAction<InsuranceSnapshot | null>) => {
      state.editing = action.payload;
    },
    clearInsurance: (state) => {
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
  clearInsurance,
} = insuranceSlice.actions;

export default insuranceSlice.reducer;
