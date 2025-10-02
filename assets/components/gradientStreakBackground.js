import React from 'react';
import { TouchableOpacity, Text as RNText, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from './colors';
import { MaterialIcons } from '@expo/vector-icons';

const GradientStreakBackground = ({ title, style, textStyle, message }) => {

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    return (
        <View style={styles.buttonContainer}>
            <LinearGradient
                colors={[colors.gradientStreakStart, colors.gradientStreakEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, style]}
            >
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={{color: colors.white, fontFamily: "Poppins-SemiBold", fontSize: 16 }}>Daily Streak</Text>
                        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
                        <Text style={{color: colors.white, fontSize: 14 }}>{message}</Text>
                    </View>
                    <MaterialIcons name="local-fire-department" size={40} color={colors.white}/>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        overflow: 'hidden',
        display: "flex",
        borderRadius: 15, 
        marginVertical: 20, 
    },

    gradient: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: '#fff',
        fontFamily: "Poppins-Bold",
        fontSize: 30,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", 
    },

    column: {
        flex: 1,
    }


});

export default GradientStreakBackground;
