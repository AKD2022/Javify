import { View, Text as RNText, StyleSheet, Switch, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
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
                console.error('Failed to load preferences', e);
            }
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

    const parseTime = (timeStr) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return { hour, minute };
    };

    const scheduleNotification = async (title, body) => {
        const { hour, minute } = parseTime(reminderTime);
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: deliveryMethod === 'sound' ? true : undefined,
                vibrate: deliveryMethod === 'vibration' ? [0, 250, 250, 250] : undefined,
            },
            trigger: { hour, minute, repeats: true },
        });
    };

    const cancelNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    };

    const toggleNotifications = async () => {
        if (!isEnabled) {
            const granted = await requestPermissions();
            if (granted) {
                setIsEnabled(true);
                await AsyncStorage.setItem('notificationsEnabled', 'true');
            } else {
                Alert.alert('Permission required', 'Enable notifications in settings');
            }
        } else {
            await cancelNotifications();
            setIsEnabled(false);
            setCalendarEnabled(false);
            setStreakEnabled(false);
            await AsyncStorage.setItem('notificationsEnabled', 'false');
            await AsyncStorage.setItem('calendarEnabled', 'false');
            await AsyncStorage.setItem('streakEnabled', 'false');
        }
    };

    const toggleCalendar = async (value) => {
        setCalendarEnabled(value);
        await AsyncStorage.setItem('calendarEnabled', value ? 'true' : 'false');
        if (value) await scheduleNotification('📅 Calendar Reminder', 'Check your study calendar for today!');
        else {
            await cancelNotifications();
            if (streakEnabled) await scheduleNotification('🔥 Streak Reminder', 'Don’t break your streak today!');
        }
    };

    const toggleStreak = async (value) => {
        setStreakEnabled(value);
        await AsyncStorage.setItem('streakEnabled', value ? 'true' : 'false');
        if (value) await scheduleNotification('🔥 Streak Reminder', 'Don’t break your streak today!');
        else {
            await cancelNotifications();
            if (calendarEnabled) await scheduleNotification('📅 Calendar Reminder', 'Check your study calendar for today!');
        }
    };

    const setDelivery = async (method) => {
        setDeliveryMethod(method);
        await AsyncStorage.setItem('deliveryMethod', method);
        setDeliveryMenuVisible(false);
    };

    const setTime = async (time) => {
        setReminderTime(time);
        await AsyncStorage.setItem('reminderTime', time);
        setTimeMenuVisible(false);
    };

    const notificationIcon = isEnabled ? 'notifications-on' : 'notifications-off';

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            {/* Master Notifications Toggle */}
            <View style={[styles.row, styles.card]}>
                <MaterialIcons name={notificationIcon} color={colors.gradientButtonStart} size={25} />
                <Text style={styles.label}>Enable Notifications</Text>
                <Switch
                    trackColor={{ false: colors.gray, true: colors.gradientButtonStart }}
                    thumbColor={isEnabled ? colors.gradientButtonStart : '#f4f3f4'}
                    ios_backgroundColor={colors.gray}
                    style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] } : {}}
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
                        disabled={!isEnabled}
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
                        disabled={!isEnabled}
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
                                disabled={!isEnabled}
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
                                disabled={!isEnabled}
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
        </SafeAreaView>
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
