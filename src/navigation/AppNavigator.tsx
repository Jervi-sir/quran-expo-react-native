import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';

export type RootStackParamList = {
    Home: undefined;
    Player: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Quran' }} />
                <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
