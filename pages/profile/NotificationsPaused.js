import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../assets/components/colors';

// Keep this screen free of notification imports: importing the native module
// itself can trigger the Expo Go error before any notification toggle is used.
export default function NotificationsPaused() {
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.defaultBackground }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text accessibilityRole="header" style={{ fontFamily: 'Poppins-SemiBold', fontSize: 22 }}>
          Notifications temporarily disabled
        </Text>
        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, lineHeight: 25 }}>
          Reminder settings are paused for now. Your saved preferences are kept for when notifications return.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
