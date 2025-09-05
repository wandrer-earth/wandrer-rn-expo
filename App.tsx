import React from 'react';
import { StatusBar } from 'expo-status-bar';
import QueryProvider from './src/providers/QueryProvider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <QueryProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </QueryProvider>
  );
}
