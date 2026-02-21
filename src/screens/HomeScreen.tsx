import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchReciters } from '../services/api';
import { Reciter } from '../types';
import { useAudioStore } from '../store/useAudioStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation<Nav>();
    const currentTrack = useAudioStore((s) => s.currentTrack);
    const isPlaying = useAudioStore((s) => s.isPlaying);
    const checkDownloads = useAudioStore((s) => s.checkDownloads);

    useEffect(() => {
        (async () => {
            try {
                await checkDownloads();
                const data = await fetchReciters();
                setReciters(data);
            } catch (e: any) {
                setError(e.message ?? 'Network error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#C9A84C" />
                <Text style={styles.loadingText}>Loading Reciters…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <StatusBar barStyle="light-content" />
                <Text style={styles.errorText}>⚠  {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>القرآن الكريم</Text>
                <Text style={styles.headerSubtitle}>The Noble Quran</Text>
            </View>

            {/* Mini now-playing bar */}
            {currentTrack && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.miniPlayer}
                    onPress={() => navigation.navigate('Player')}
                >
                    <View style={styles.miniPlayerDot}>
                        <View style={[styles.dot, isPlaying && styles.dotActive]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.miniPlayerTitle} numberOfLines={1}>
                            {currentTrack.surahNameEn}
                        </Text>
                        <Text style={styles.miniPlayerSub}>
                            {currentTrack.reciterName} · {isPlaying ? 'Playing' : 'Paused'}
                        </Text>
                    </View>
                    <Text style={styles.miniPlayerArrow}>›</Text>
                </TouchableOpacity>
            )}

            {/* Reciters list */}
            <FlatList
                data={reciters}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const surahCount = item.surahs?.length ?? 0;

                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate('ReciterSurahs', {
                                    reciterId: item.id,
                                    reciterName: item.name,
                                })
                            }
                        >
                            {/* Avatar */}
                            <View style={styles.avatar}>
                                <Text style={styles.avatarLetter}>
                                    {item.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            {/* Info */}
                            <View style={styles.cardInfo}>
                                <Text style={styles.reciterName}>{item.name}</Text>
                                {item.name_ar ? (
                                    <Text style={styles.reciterNameAr}>{item.name_ar}</Text>
                                ) : null}
                                <Text style={styles.surahCount}>
                                    {surahCount} {surahCount === 1 ? 'surah' : 'surahs'}
                                </Text>
                            </View>

                            <Text style={styles.chevron}>›</Text>
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
        gap: 16,
    },
    loadingText: { color: '#C9A84C', fontSize: 14, opacity: 0.7 },
    errorText: { color: '#f87171', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },

    // Header
    header: {
        paddingTop: 70,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,168,76,0.15)',
    },
    headerTitle: {
        fontSize: 36,
        color: '#C9A84C',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // Mini player
    miniPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201,168,76,0.1)',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.2)',
    },
    miniPlayerDot: { marginRight: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotActive: { backgroundColor: '#4ADE80' },
    miniPlayerTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
    miniPlayerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 1 },
    miniPlayerArrow: { color: '#C9A84C', fontSize: 24, fontWeight: '300' },

    // List
    listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(201,168,76,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarLetter: { color: '#C9A84C', fontSize: 18, fontWeight: '700' },
    cardInfo: { flex: 1 },
    reciterName: { fontSize: 16, fontWeight: '600', color: '#fff' },
    reciterNameAr: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    surahCount: { fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4 },
    chevron: { color: 'rgba(255,255,255,0.2)', fontSize: 24, fontWeight: '300' },
});
