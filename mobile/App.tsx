import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { useAppDispatch, useAppSelector } from './app/hooks/reduxHooks';
import { store } from './app/store';
import { lightTheme, darkTheme } from './app/theme';
import { useAppData } from './app/hooks/useAppData';

import DashboardScreen from './app/tabs/dashboard';
import ExpensesScreen from './app/tabs/expenses';
import NetWorthScreen from './app/tabs/networth';
import InsuranceScreen from './app/tabs/insurance';
import SettingsScreen from './app/tabs/settings';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const theme = useAppSelector((state) => state.ui.theme);
  const appTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.onSurfaceVariant,
        headerStyle: { backgroundColor: appTheme.colors.surface },
        headerTintColor: appTheme.colors.onSurface,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          title: 'Expenses',
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="NetWorth"
        component={NetWorthScreen}
        options={{
          title: 'Net Worth',
          tabBarLabel: 'Net Worth',
        }}
      />
      <Tab.Screen
        name="Insurance"
        component={InsuranceScreen}
        options={{
          title: 'Insurance',
          tabBarLabel: 'Insurance',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { loadAppData } = useAppData();
  const theme = useAppSelector((state) => state.ui.theme);
  const appTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    loadAppData();
  }, []);

  return (
    <PaperProvider theme={appTheme}>
      <NavigationContainer theme={appTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AppContent />
    </ReduxProvider>
  );
}
