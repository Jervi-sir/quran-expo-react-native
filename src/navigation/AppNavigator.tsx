import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ReciterScreen from '../screens/ReciterScreen';
import PlayerScreen from '../screens/PlayerScreen';

export type RootStackParamList = {
    Home: undefined;
    ReciterSurahs: { reciterId: number; reciterName: string };
    Player: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#0D1B1E' },
                    headerTintColor: '#C9A84C',
                    headerTitleStyle: { fontWeight: '600', fontSize: 18 },
                    contentStyle: { backgroundColor: '#0D1B1E' },
                    animation: 'slide_from_right',
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ReciterSurahs"
                    component={ReciterScreen}
                    options={({ route }) => ({
                        title: route.params.reciterName,
                    })}
                />
                <Stack.Screen
                    name="Player"
                    component={PlayerScreen}
                    options={{
                        title: 'Now Playing',
                        headerTransparent: true,
                        headerBlurEffect: 'dark',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
