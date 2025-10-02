import { View, Text as RNText, Button } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { DatePickerModal } from 'react-native-paper-dates'
import { enGB, registerTranslation } from 'react-native-paper-dates'
import { setStartDate } from './datestore'
import { setEndDate } from './datestore'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import colors from '../../assets/components/colors'
import GradientButton from '../../assets/components/gradientButton'
import { MaterialIcons } from '@expo/vector-icons'

export default function DateSelectionScreen() {
    registerTranslation('en-GB', enGB)
    
    const [startDateLocal, setStartDateLocal] = useState(undefined);
    const [endDateLocal, setEndDateLocal] = useState(undefined);
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const navigation = useNavigation();

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: 'Poppins-Regular' }, props.style]} />
      );

    const onDismissStartSingle = useCallback(() => {
        setStartOpen(false);
    }, [setStartOpen]);

    const onDismissEndSingle = useCallback(() => {
        setEndOpen(false);
    }, [setEndOpen]);

    const onConfirmStartSingle = useCallback(
        (params) => {
            setStartOpen(false);
            setStartDateLocal(params.date);
            setStartDate(params.date);
        },
        [setStartOpen, setStartDateLocal]
    );

    const onConfirmEndSingle = useCallback(
        (params) => {
            setEndOpen(false);
            setEndDateLocal(params.date);
            setEndDate(params.date);
        },
        [setEndOpen, setEndDateLocal]
    );

    console.log(startDateLocal);
    console.log(endDateLocal);

    const startDateString = startDateLocal ? startDateLocal.toDateString() : null;
    const endDateString = endDateLocal ? endDateLocal.toDateString() : null;


    return (
        <SafeAreaView style={styles.container}>

            <View style={{alignItems: "center"}}>
                <MaterialIcons name="calendar-today" color={colors.gray} size={50}/>
                <Text style={{color: colors.gray, paddingBottom: 20, }}>Select a starting date and an end date</Text>
            </View>

            <TouchableOpacity onPress={() => setStartOpen(true)} uppercase={true} mode="outlined" style={styles.floatingButton}>
                <Text style={styles.buttonText}>{startDateString || "Start Date"}</Text>
            </TouchableOpacity>
            <DatePickerModal
                locale="en"
                mode="single"
                calendarIcon='calendar-blank-outline'
                label="Pick a Start Date"
                uppercase='true'
                visible={startOpen}
                onDismiss={onDismissStartSingle}
                date={startDateLocal}
                onConfirm={onConfirmStartSingle}
            />

            <TouchableOpacity onPress={() => setEndOpen(true)} uppercase={true} mode="outlined" style={styles.floatingButton}>
                <Text style={styles.buttonText}>{endDateString || "End Date"}</Text>
            </TouchableOpacity>
            <DatePickerModal
                locale="en"
                mode="single"
                calendarIcon='calendar-blank-outline'
                label="Pick a End Date"
                uppercase='true'
                visible={endOpen}
                onDismiss={onDismissEndSingle}
                date={endDateLocal}
                onConfirm={onConfirmEndSingle}
            />

            <GradientButton  title={"Confirm Dates"} onPress={() => navigation.navigate("Home")} style={styles.confirmButton}/>
                
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.defaultBackground,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "left",
    },

    floatingButton: {
        margin: 10,
        backgroundColor: colors.basicButton,
        width: "100%",
        padding: 15,
        textAlign: "center",
        alignItems: "center",
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },

    confirmButton: {
        margin: 10,
        backgroundColor: colors.basicButton,
        width: "100%",
        padding: 15,
        textAlign: "center",
        alignItems: "center",
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: "Poppins-Bold"
    },
});