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
import { fetchSurahs } from '../services/api';
import { Surah } from '../types';
import { useAudioStore } from '../store/useAudioStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();
    const playTrack = useAudioStore((s) => s.playTrack);
    const checkDownloads = useAudioStore((s) => s.checkDownloads);
    const currentTrack = useAudioStore((s) => s.currentTrack);
    const isPlaying = useAudioStore((s) => s.isPlaying);
    const downloadedFiles = useAudioStore((s) => s.downloadedFiles);

    useEffect(() => {
        (async () => {
            await checkDownloads();
            const data = await fetchSurahs();
            setSurahs(data);
            setLoading(false);
        })();
    }, []);

    const handlePlaySurah = async (surah: Surah) => {
        await playTrack(surah);
        navigation.navigate('Player');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#C9A84C" />
                <Text style={styles.loadingText}>Loading Surahs…</Text>
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

            {/* Mini Now-Playing Bar */}
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
                            {currentTrack.name_en}
                        </Text>
                        <Text style={styles.miniPlayerSub}>
                            {isPlaying ? 'Playing' : 'Paused'}
                        </Text>
                    </View>
                    <Text style={styles.miniPlayerArrow}>›</Text>
                </TouchableOpacity>
            )}

            {/* Surah List */}
            <FlatList
                data={surahs}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const isActive = currentTrack?.id === item.id;
                    const isOffline = !!downloadedFiles[item.id];

                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.card, isActive && styles.cardActive]}
                            onPress={() => handlePlaySurah(item)}
                        >
                            {/* Number badge */}
                            <View style={[styles.numberBadge, isActive && styles.numberBadgeActive]}>
                                <Text style={[styles.numberText, isActive && styles.numberTextActive]}>
                                    {item.id}
                                </Text>
                            </View>

                            {/* Info */}
                            <View style={styles.cardInfo}>
                                <Text style={[styles.englishName, isActive && styles.englishNameActive]}>
                                    {item.name_en}
                                </Text>
                                {isOffline && (
                                    <Text style={styles.offlineLabel}>Offline</Text>
                                )}
                            </View>

                            {/* Arabic name */}
                            <Text style={[styles.arabicName, isActive && styles.arabicNameActive]}>
                                {item.name_ar}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B1E',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0D1B1E',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: '#C9A84C',
        fontSize: 14,
        opacity: 0.7,
    },

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
    miniPlayerDot: {
        marginRight: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dotActive: {
        backgroundColor: '#4ADE80',
    },
    miniPlayerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    miniPlayerSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 1,
    },
    miniPlayerArrow: {
        color: '#C9A84C',
        fontSize: 24,
        fontWeight: '300',
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
    },
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
    numberBadgeActive: {
        backgroundColor: 'rgba(201,168,76,0.2)',
    },
    numberText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '700',
    },
    numberTextActive: {
        color: '#C9A84C',
    },
    cardInfo: {
        flex: 1,
    },
    englishName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    englishNameActive: {
        color: '#C9A84C',
    },
    offlineLabel: {
        fontSize: 11,
        color: '#4ADE80',
        marginTop: 3,
        fontWeight: '500',
    },
    arabicName: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.5)',
        marginLeft: 8,
    },
    arabicNameActive: {
        color: 'rgba(201,168,76,0.7)',
    },
});
