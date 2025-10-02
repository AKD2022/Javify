import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BookmarkedLessonsScreen from "./BookmarkedLessonsScreen";
import BookmarkedQuestionsScreen from "./BookmarkedQuestionsScreen";
import colors from "../../assets/components/colors";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

export default function BookmarksScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top']}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarActiveTintColor: colors.black,
                        tabBarIndicatorStyle: { backgroundColor: colors.basicButton },
                        tabBarLabelStyle: { fontWeight: "bold" },
                        tabBarStyle: { backgroundColor: colors.white },
                        sceneContainerStyle: { backgroundColor: colors.white },
                    }}
                >
                    <Tab.Screen name="Lessons" component={BookmarkedLessonsScreen} />
                    <Tab.Screen name="Questions" component={BookmarkedQuestionsScreen} />
                </Tab.Navigator>
            </SafeAreaView>
        </View>
    );
}
