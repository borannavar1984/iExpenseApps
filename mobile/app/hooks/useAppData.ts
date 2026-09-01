import { useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { setEntries } from '../store/entries';
import { setSnapshots as setNWSnapshots, setChangeLog as setNWChangeLog } from '../store/networth';
import { setSnapshots as setInsSnapshots, setChangeLog as setInsChangeLog } from '../store/insurance';
import { setUserPreferences, setCloudConfig } from '../store/preferences';
import type { Entry, NWSnapshot, NWChangeLog, InsuranceSnapshot, InsuranceChangeLog, UserPreferences, CloudConfig } from '../services/dataModel';

const STORAGE_KEYS = {
  ENTRIES: '@iFinWell/entries',
  NW_SNAPSHOTS: '@iFinWell/nw_snapshots',
  NW_CHANGELOG: '@iFinWell/nw_changelog',
  INS_SNAPSHOTS: '@iFinWell/ins_snapshots',
  INS_CHANGELOG: '@iFinWell/ins_changelog',
  USER_PREFS: '@iFinWell/user_prefs',
  CLOUD_CONFIG: '@iFinWell/cloud_config',
};

export const useAppData = () => {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.entries.all);
  const nwSnapshots = useAppSelector((state) => state.networth.snapshots);
  const nwChangeLog = useAppSelector((state) => state.networth.changeLog);
  const insSnapshots = useAppSelector((state) => state.insurance.snapshots);
  const insChangeLog = useAppSelector((state) => state.insurance.changeLog);
  const userPrefs = useAppSelector((state) => state.preferences.user);
  const cloudConfig = useAppSelector((state) => state.preferences.cloudConfig);

  const loadAppData = useCallback(async () => {
    try {
      const [
        storedEntries,
        storedNWSnapshots,
        storedNWChangeLog,
        storedInsSnapshots,
        storedInsChangeLog,
        storedUserPrefs,
        storedCloudConfig,
      ] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ENTRIES,
        STORAGE_KEYS.NW_SNAPSHOTS,
        STORAGE_KEYS.NW_CHANGELOG,
        STORAGE_KEYS.INS_SNAPSHOTS,
        STORAGE_KEYS.INS_CHANGELOG,
        STORAGE_KEYS.USER_PREFS,
        STORAGE_KEYS.CLOUD_CONFIG,
      ]);

      if (storedEntries[1]) {
        dispatch(setEntries(JSON.parse(storedEntries[1])));
      }

      if (storedNWSnapshots[1]) {
        dispatch(setNWSnapshots(JSON.parse(storedNWSnapshots[1])));
      }

      if (storedNWChangeLog[1]) {
        dispatch(setNWChangeLog(JSON.parse(storedNWChangeLog[1])));
      }

      if (storedInsSnapshots[1]) {
        dispatch(setInsSnapshots(JSON.parse(storedInsSnapshots[1])));
      }

      if (storedInsChangeLog[1]) {
        dispatch(setInsChangeLog(JSON.parse(storedInsChangeLog[1])));
      }

      if (storedUserPrefs[1]) {
        dispatch(setUserPreferences(JSON.parse(storedUserPrefs[1])));
      }

      if (storedCloudConfig[1]) {
        dispatch(setCloudConfig(JSON.parse(storedCloudConfig[1])));
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    }
  }, [dispatch]);

  const persistEntries = useCallback(async (data: Entry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting entries:', error);
    }
  }, []);

  const persistNWData = useCallback(async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.NW_SNAPSHOTS, JSON.stringify(nwSnapshots)],
        [STORAGE_KEYS.NW_CHANGELOG, JSON.stringify(nwChangeLog)],
      ]);
    } catch (error) {
      console.error('Error persisting net worth data:', error);
    }
  }, [nwSnapshots, nwChangeLog]);

  const persistInsuranceData = useCallback(async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.INS_SNAPSHOTS, JSON.stringify(insSnapshots)],
        [STORAGE_KEYS.INS_CHANGELOG, JSON.stringify(insChangeLog)],
      ]);
    } catch (error) {
      console.error('Error persisting insurance data:', error);
    }
  }, [insSnapshots, insChangeLog]);

  const persistUserPreferences = useCallback(async (prefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error persisting user preferences:', error);
    }
  }, []);

  const persistCloudConfig = useCallback(async (config: CloudConfig | null) => {
    try {
      if (config) {
        await AsyncStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(config));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CLOUD_CONFIG);
      }
    } catch (error) {
      console.error('Error persisting cloud config:', error);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing app data:', error);
    }
  }, []);

  return {
    loadAppData,
    persistEntries,
    persistNWData,
    persistInsuranceData,
    persistUserPreferences,
    persistCloudConfig,
    clearAllData,
  };
};
