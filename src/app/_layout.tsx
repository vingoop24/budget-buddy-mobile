import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="expense/new" options={{ title: 'Add Expense', presentation: 'modal' }} />
        <Stack.Screen name="expense/[id]" options={{ title: 'Edit Expense', presentation: 'modal' }} />
        <Stack.Screen name="scan-receipt" options={{ title: 'Scan Receipt', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
