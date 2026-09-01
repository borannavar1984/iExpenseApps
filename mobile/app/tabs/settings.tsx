import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Switch, Divider, ActivityIndicator } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useAppData } from '../hooks/useAppData';
import { setUserPreferences, setCloudConfig, clearPreferences } from '../store/preferences';
import { setTheme } from '../store/ui';
import { spacing, borderRadius, typography } from '../theme';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { persistUserPreferences, persistCloudConfig, clearAllData } = useAppData();
  const userPrefs = useAppSelector((state) => state.preferences.user);
  const cloudConfig = useAppSelector((state) => state.preferences.cloudConfig);
  const theme = useAppSelector((state) => state.ui.theme);

  const [name, setName] = useState(userPrefs.name);
  const [primaryCurrency, setPrimaryCurrency] = useState(userPrefs.primaryCurrency);
  const [secondaryCurrency, setSecondaryCurrency] = useState(userPrefs.secondaryCurrency || '');
  const [githubToken, setGithubToken] = useState(cloudConfig?.token || '');
  const [githubOwner, setGithubOwner] = useState(cloudConfig?.owner || '');
  const [githubRepo, setGithubRepo] = useState(cloudConfig?.repo || '');
  const [syncing, setSyncing] = useState(false);

  const handleSavePreferences = async () => {
    const updated = {
      name,
      primaryCurrency,
      secondaryCurrency: secondaryCurrency || null,
      onboarded: userPrefs.onboarded,
    };
    dispatch(setUserPreferences(updated));
    await persistUserPreferences(updated);
    Alert.alert('Saved', 'Your preferences have been updated');
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  const handleCloudConfigSave = async () => {
    if (!githubToken || !githubOwner || !githubRepo) {
      Alert.alert('Error', 'Please fill in all GitHub fields');
      return;
    }

    const config = {
      token: githubToken,
      owner: githubOwner,
      repo: githubRepo,
    };
    dispatch(setCloudConfig(config));
    await persistCloudConfig(config);
    Alert.alert('Saved', 'Cloud sync configuration saved');
  };

  const handleCloudConfigDisconnect = async () => {
    Alert.alert('Disconnect', 'Are you sure? Cloud sync will be disabled.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          dispatch(setCloudConfig(null));
          await persistCloudConfig(null);
          setGithubToken('');
          setGithubOwner('');
          setGithubRepo('');
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert('Clear All Data', 'This will delete all your data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          dispatch(clearPreferences());
          Alert.alert('Cleared', 'All data has been deleted');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                style={styles.input}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.formField}>
              <Text style={styles.label}>Primary Currency</Text>
              <TextInput
                value={primaryCurrency}
                onChangeText={setPrimaryCurrency}
                placeholder="USD"
                maxLength={3}
                style={styles.input}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.formField}>
              <Text style={styles.label}>Secondary Currency (Optional)</Text>
              <TextInput
                value={secondaryCurrency}
                onChangeText={setSecondaryCurrency}
                placeholder="INR"
                maxLength={3}
                style={styles.input}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSavePreferences}
              style={styles.button}
            >
              Save Profile
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.card}>
          <Card.Content style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>Dark Mode</Text>
              <Text style={styles.sublabel}>
                {theme === 'dark' ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleToggleTheme}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Cloud Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Sync</Text>
        <Card style={styles.card}>
          <Card.Content>
            {cloudConfig ? (
              <>
                <Text style={styles.connectionStatus}>Connected</Text>
                <Text style={styles.connectionRepo}>{cloudConfig.repo}</Text>
                <Button
                  mode="outlined"
                  onPress={handleCloudConfigDisconnect}
                  style={styles.button}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <View style={styles.formField}>
                  <Text style={styles.label}>GitHub Token</Text>
                  <TextInput
                    value={githubToken}
                    onChangeText={setGithubToken}
                    placeholder="Your GitHub token"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.formField}>
                  <Text style={styles.label}>GitHub Owner</Text>
                  <TextInput
                    value={githubOwner}
                    onChangeText={setGithubOwner}
                    placeholder="Your GitHub username"
                    style={styles.input}
                  />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.formField}>
                  <Text style={styles.label}>Repository Name</Text>
                  <TextInput
                    value={githubRepo}
                    onChangeText={setGithubRepo}
                    placeholder="Repository name (without owner)"
                    style={styles.input}
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleCloudConfigSave}
                  style={styles.button}
                >
                  Connect to GitHub
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.aboutRow}>
              <Text style={styles.label}>App Name</Text>
              <Text style={styles.value}>iFinWell</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>1.0.0</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.label}>Built with</Text>
              <Text style={styles.value}>React Native + Expo</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#F44336' }]}>Danger Zone</Text>
        <Card style={[styles.card, { backgroundColor: '#FFEBEE' }]}>
          <Card.Content>
            <Text style={styles.dangerText}>
              Clearing data will permanently delete all your local and offline data.
            </Text>
            <Button
              mode="contained"
              buttonColor="#F44336"
              onPress={handleClearAllData}
              style={styles.button}
            >
              Clear All Data
            </Button>
          </Card.Content>
        </Card>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBFE',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  formField: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sublabel: {
    ...typography.bodySmall,
    color: '#79747E',
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: '#F5F5F5',
  },
  button: {
    marginTop: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionStatus: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: spacing.sm,
  },
  connectionRepo: {
    ...typography.bodySmall,
    color: '#79747E',
    marginBottom: spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    ...typography.bodyMedium,
    color: '#1C1B1F',
  },
  dangerText: {
    ...typography.bodyMedium,
    color: '#F44336',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
