import { View, Text as RNText, StyleSheet, Switch, Alert, Platform, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/components/colors';

export default function NotificationPreferences() {
    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: 'Poppins-Regular' }, props.style]} />
    );

    const lock = useRef(false);
    const [busy, setBusy] = useState(true);
    const [isEnabled, setIsEnabled] = useState(false);
    const [calendarEnabled, setCalendarEnabled] = useState(false);
    const [streakEnabled, setStreakEnabled] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState('sound');
    const [reminderTime, setReminderTime] = useState('09:00');

    const [deliveryMenuVisible, setDeliveryMenuVisible] = useState(false);
    const [timeMenuVisible, setTimeMenuVisible] = useState(false);

    // Load saved preferences
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const notif = await AsyncStorage.getItem('notificationsEnabled');
                if (notif === 'true') setIsEnabled(true);

                const calendar = await AsyncStorage.getItem('calendarEnabled');
                if (calendar === 'true') setCalendarEnabled(true);

                const streak = await AsyncStorage.getItem('streakEnabled');
                if (streak === 'true') setStreakEnabled(true);

                const delivery = await AsyncStorage.getItem('deliveryMethod');
                if (delivery) setDeliveryMethod(delivery);

                const time = await AsyncStorage.getItem('reminderTime');
                if (time) setReminderTime(time);
            } catch (e) {
                Alert.alert('Preferences unavailable', 'Please reopen this screen and retry.');
            } finally { setBusy(false); }
        };
        loadPreferences();
    }, []);

    const requestPermissions = async () => {
        if (Device.isDevice) {
            const { status } = await Notifications.requestPermissionsAsync();
            return status === 'granted';
        } else {
            Alert.alert('Error', 'Must use physical device for notifications');
            return false;
        }
    };

    const reconcileReminders = async prefs => {
        const [hour, minute] = prefs.reminderTime.split(':').map(Number);
        if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error('Choose a valid reminder time.');
        const channelId = `study-${prefs.deliveryMethod}`;
        if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(channelId, {
            name: `Study reminders (${prefs.deliveryMethod})`, importance: Notifications.AndroidImportance.DEFAULT,
            sound: prefs.deliveryMethod === 'sound' ? 'default' : null,
            enableVibrate: prefs.deliveryMethod === 'vibration', vibrationPattern: [0, 250, 250, 250],
        });
        const pending = await Notifications.getAllScheduledNotificationsAsync();
        // Remove our reminders, including the two titles used before identifiers existed.
        for (const item of pending) {
            if (item.identifier.startsWith('javify-study-') || ['📅 Calendar Reminder', '🔥 Streak Reminder'].includes(item.content.title)) {
                await Notifications.cancelScheduledNotificationAsync(item.identifier);
            }
        }
        if (!prefs.isEnabled) return;
        for (const [enabled, id, title, body] of [
            [prefs.calendarEnabled, 'calendar', '📅 Calendar Reminder', 'Check your study calendar for today!'],
            [prefs.streakEnabled, 'streak', '🔥 Streak Reminder', 'Make time for Java practice today!'],
        ]) {
            if (enabled) await Notifications.scheduleNotificationAsync({
                identifier: `javify-study-${id}`,
                content: { title, body, sound: prefs.deliveryMethod === 'sound' ? 'default' : false,
                    vibrate: prefs.deliveryMethod === 'vibration' ? [0, 250, 250, 250] : [] },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, ...(Platform.OS === 'android' ? { channelId } : {}) },
            });
        }
    };
    const updatePreferences = async patch => {
        if (lock.current || busy) return;
        lock.current = true; setBusy(true);
        const previous = { isEnabled, calendarEnabled, streakEnabled, deliveryMethod, reminderTime };
        const next = { ...previous, ...patch };
        try {
            if (next.isEnabled && !(await requestPermissions())) {
                Alert.alert('Permission required', 'Enable notifications in your device settings.'); return;
            }
            await reconcileReminders(next);
            await AsyncStorage.multiSet([
                ['notificationsEnabled', String(next.isEnabled)], ['calendarEnabled', String(next.calendarEnabled)],
                ['streakEnabled', String(next.streakEnabled)], ['deliveryMethod', next.deliveryMethod], ['reminderTime', next.reminderTime],
            ]);
            setIsEnabled(next.isEnabled); setCalendarEnabled(next.calendarEnabled); setStreakEnabled(next.streakEnabled);
            setDeliveryMethod(next.deliveryMethod); setReminderTime(next.reminderTime);
        } catch {
            try { await reconcileReminders(previous); } catch { /* The visible error prompts a retry. */ }
            Alert.alert('Reminders not updated', 'Please check notification permissions and retry.');
        } finally { lock.current = false; setBusy(false); }
    };
    const toggleNotifications = () => updatePreferences({ isEnabled: !isEnabled });
    const toggleCalendar = value => updatePreferences({ calendarEnabled: value });
    const toggleStreak = value => updatePreferences({ streakEnabled: value });
    const setDelivery = method => { setDeliveryMenuVisible(false); updatePreferences({ deliveryMethod: method }); };
    const setTime = time => { setTimeMenuVisible(false); updatePreferences({ reminderTime: time }); };

    const notificationIcon = isEnabled ? 'notifications-on' : 'notifications-off';

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}><ScrollView>
            {/* Master Notifications Toggle */}
            <View style={[styles.row, styles.card]}>
                <MaterialIcons name={notificationIcon} color={colors.gradientButtonStart} size={25} />
                <Text style={styles.label}>Enable Notifications</Text>
                <Switch
                    trackColor={{ false: colors.gray, true: colors.gradientButtonStart }}
                    thumbColor={isEnabled ? colors.gradientButtonStart : '#f4f3f4'}
                    ios_backgroundColor={colors.gray}
                    style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] } : {}}
                    disabled={busy}
                    onValueChange={toggleNotifications}
                    value={isEnabled}
                />
            </View>

            <View style={{ marginTop: 10 }}>
                <Text style={[styles.sectionTitle, !isEnabled && styles.disabledText]}>
                    Calendar & Streak Notifications
                </Text>

                {/* Calendar Notifications */}
                <View style={[styles.row, styles.card, !isEnabled && styles.disabledCard]}>
                    <Text style={[styles.label, !isEnabled && styles.disabledText]}>Calendar Notifications</Text>
                    <Switch
                        trackColor={{ false: colors.gray, true: colors.gradientButtonStart }}
                        thumbColor={calendarEnabled ? colors.gradientButtonStart : '#f4f3f4'}
                        ios_backgroundColor={colors.gray}
                        onValueChange={toggleCalendar}
                        value={calendarEnabled}
                        disabled={!isEnabled || busy}
                        style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] } : {}}
                    />
                </View>

                {/* Streak Notifications */}
                <View style={[styles.row, styles.card, !isEnabled && styles.disabledCard]}>
                    <Text style={[styles.label, !isEnabled && styles.disabledText]}>Streak Notifications</Text>
                    <Switch
                        trackColor={{ false: colors.gray, true: colors.gradientButtonStart }}
                        thumbColor={streakEnabled ? colors.gradientButtonStart : '#f4f3f4'}
                        ios_backgroundColor={colors.gray}
                        onValueChange={toggleStreak}
                        value={streakEnabled}
                        disabled={!isEnabled || busy}
                        style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] } : {}}
                    />
                </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.reminders}>
                <Text style={[styles.sectionTitle, !isEnabled && styles.disabledText]}>Preferences</Text>

                {/* Delivery Method Dropdown */}
                <View style={[styles.row, styles.card, !isEnabled && styles.disabledCard]}>
                    <Text style={[styles.label, !isEnabled && styles.disabledText]}>Delivery Method</Text>
                    <Menu
                        visible={deliveryMenuVisible}
                        onDismiss={() => setDeliveryMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setDeliveryMenuVisible(true)}
                                disabled={!isEnabled || busy}
                                style={{ borderColor: isEnabled ? '#000' : colors.gray }}
                                labelStyle={{ color: isEnabled ? '#000' : colors.gray }}
                            >
                                {deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1)}
                            </Button>
                        }
                    >
                        <Menu.Item onPress={() => setDelivery('sound')} title="Sound" />
                        <Menu.Item onPress={() => setDelivery('vibration')} title="Vibration" />
                        <Menu.Item onPress={() => setDelivery('silent')} title="Silent" />
                    </Menu>
                </View>

                {/* Reminder Time Dropdown */}
                <View style={[styles.row, styles.card, !isEnabled && styles.disabledCard]}>
                    <Text style={[styles.label, !isEnabled && styles.disabledText]}>Reminder Time</Text>
                    <Menu
                        visible={timeMenuVisible}
                        onDismiss={() => setTimeMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setTimeMenuVisible(true)}
                                disabled={!isEnabled || busy}
                                style={{ borderColor: isEnabled ? '#000' : colors.gray }}
                                labelStyle={{ color: isEnabled ? '#000' : colors.gray }}
                            >
                                {reminderTime}
                            </Button>
                        }
                    >
                        <Menu.Item onPress={() => setTime('09:00')} title="9:00 AM" />
                        <Menu.Item onPress={() => setTime('12:00')} title="12:00 PM" />
                        <Menu.Item onPress={() => setTime('18:00')} title="6:00 PM" />
                        <Menu.Item onPress={() => setTime('21:00')} title="9:00 PM" />
                    </Menu>
                </View>
            </View>
        </ScrollView></SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        minHeight: 50,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 15,
        borderRadius: 15,
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.defaultBackground,
    },
    disabledCard: {
        backgroundColor: '#e5e5e5',
    },
    disabledText: {
        color: colors.gray,
    },
    reminders: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        marginLeft: 15,
        marginBottom: 5,
    },
});
