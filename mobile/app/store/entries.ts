import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Entry, today } from '../services/dataModel';

interface EntriesState {
  all: Entry[];
  editingIndex: number | null;
}

const initialState: EntriesState = {
  all: [],
  editingIndex: null,
};

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<Entry[]>) => {
      state.all = action.payload;
    },
    addEntry: (state, action: PayloadAction<Entry>) => {
      state.all.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<{ index: number; entry: Entry }>) => {
      state.all[action.payload.index] = action.payload.entry;
    },
    deleteEntry: (state, action: PayloadAction<number>) => {
      state.all.splice(action.payload, 1);
    },
    deleteEntryById: (state, action: PayloadAction<string>) => {
      state.all = state.all.filter((e) => e.id !== action.payload);
    },
    setEditingIndex: (state, action: PayloadAction<number | null>) => {
      state.editingIndex = action.payload;
    },
    clearEntries: (state) => {
      state.all = [];
    },
  },
});

export const {
  setEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  deleteEntryById,
  setEditingIndex,
  clearEntries,
} = entriesSlice.actions;

export default entriesSlice.reducer;
