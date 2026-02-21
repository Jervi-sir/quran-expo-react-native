import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchReciter } from '../services/api';
import { Reciter, Track } from '../types';
import { SURAH_NAMES } from '../constants/surahNames';
import { useAudioStore } from '../store/useAudioStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ReciterSurahs'>;
type Route = RouteProp<RootStackParamList, 'ReciterSurahs'>;

export default function ReciterScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { reciterId, reciterName } = route.params;

    const [reciter, setReciter] = useState<Reciter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const playTrack = useAudioStore((s) => s.playTrack);
    const currentTrack = useAudioStore((s) => s.currentTrack);
    const isPlaying = useAudioStore((s) => s.isPlaying);
    const downloadedFiles = useAudioStore((s) => s.downloadedFiles);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchReciter(reciterId);
                setReciter(data);
            } catch (e: any) {
                setError(e.message ?? 'Failed to load');
            } finally {
                setLoading(false);
            }
        })();
    }, [reciterId]);

    const buildTrack = (reciter: Reciter, surah: Reciter['surahs'][0]): Track => {
        const names = SURAH_NAMES[surah.surah_number] ?? { en: `Surah ${surah.surah_number}`, ar: '' };
        return {
            audioId: surah.id,
            surahNumber: surah.surah_number,
            surahNameEn: names.en,
            surahNameAr: names.ar,
            reciterName: reciter.name,
            reciterNameAr: reciter.name_ar,
            fileUrl: surah.file_url,
        };
    };

    const handlePlay = async (surah: Reciter['surahs'][0]) => {
        if (!reciter) return;
        const track = buildTrack(reciter, surah);
        await playTrack(track);
        navigation.navigate('Player');
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#C9A84C" />
            </View>
        );
    }

    if (error || !reciter) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>⚠  {error ?? 'Unknown error'}</Text>
            </View>
        );
    }

    const surahs = [...reciter.surahs].sort((a, b) => a.surah_number - b.surah_number);

    return (
        <View style={styles.container}>
            {/* Reciter header */}
            <View style={styles.reciterHeader}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLetter}>{reciterName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.reciterTitle}>{reciter.name_ar ?? reciterName}</Text>
                <Text style={styles.reciterSub}>{surahs.length} surahs available</Text>
            </View>

            {/* Surah list */}
            <FlatList
                data={surahs}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const names = SURAH_NAMES[item.surah_number] ?? { en: `Surah ${item.surah_number}`, ar: '' };
                    const isActive = currentTrack?.audioId === item.id;
                    const isOffline = !!downloadedFiles[`audio_${item.id}`];

                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.card, isActive && styles.cardActive]}
                            onPress={() => handlePlay(item)}
                        >
                            <View style={[styles.numberBadge, isActive && styles.numberBadgeActive]}>
                                <Text style={[styles.numberText, isActive && styles.numberTextActive]}>
                                    {item.surah_number}
                                </Text>
                            </View>

                            <View style={styles.cardInfo}>
                                <Text style={[styles.surahEn, isActive && styles.surahEnActive]}>
                                    {names.en}
                                </Text>
                                {isOffline && <Text style={styles.offlineLabel}>Offline</Text>}
                                {isActive && isPlaying && <Text style={styles.playingLabel}>▶  Playing</Text>}
                            </View>

                            <Text style={[styles.surahAr, isActive && styles.surahArActive]}>
                                {names.ar}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D1B1E' },
    centered: {
        flex: 1,
        backgroundColor: '#0D1B1E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: { color: '#f87171', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },

    // Reciter header
    reciterHeader: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,168,76,0.12)',
    },
    avatarLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(201,168,76,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarLetter: { color: '#C9A84C', fontSize: 26, fontWeight: '700' },
    reciterTitle: { color: '#C9A84C', fontSize: 22, fontWeight: '600', marginBottom: 4 },
    reciterSub: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

    // List
    listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    cardActive: {
        backgroundColor: 'rgba(201,168,76,0.12)',
        borderColor: 'rgba(201,168,76,0.3)',
    },
    numberBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    numberBadgeActive: { backgroundColor: 'rgba(201,168,76,0.2)' },
    numberText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700' },
    numberTextActive: { color: '#C9A84C' },
    cardInfo: { flex: 1 },
    surahEn: { fontSize: 15, fontWeight: '600', color: '#fff' },
    surahEnActive: { color: '#C9A84C' },
    offlineLabel: { fontSize: 11, color: '#4ADE80', marginTop: 3, fontWeight: '500' },
    playingLabel: { fontSize: 11, color: '#C9A84C', marginTop: 3, fontWeight: '500' },
    surahAr: { fontSize: 18, color: 'rgba(255,255,255,0.45)', marginLeft: 8 },
    surahArActive: { color: 'rgba(201,168,76,0.7)' },
});
