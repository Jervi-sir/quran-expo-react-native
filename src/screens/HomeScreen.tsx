import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchSurahs } from '../services/api';
import { Surah } from '../types';
import { useAudioStore } from '../store/useAudioStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();
    const playTrack = useAudioStore((state) => state.playTrack);
    const checkDownloads = useAudioStore((state) => state.checkDownloads);

    useEffect(() => {
        const loadData = async () => {
            await checkDownloads();
            const data = await fetchSurahs();
            setSurahs(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const handlePlaySurah = async (surah: Surah) => {
        await playTrack(surah);
        navigation.navigate('Player');
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={surahs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handlePlaySurah(item)}>
                        <View>
                            <Text style={styles.englishName}>{item.id}. {item.name_en}</Text>
                        </View>
                        <Text style={styles.arabicName}>{item.name_ar}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ebebeb',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    englishName: { fontSize: 16, fontWeight: 'bold' },
    arabicName: { fontSize: 18 },
});
