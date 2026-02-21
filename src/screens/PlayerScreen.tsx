import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioStore } from '../store/useAudioStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export default function PlayerScreen() {
    const {
        currentTrack,
        isPlaying,
        pauseTrack,
        resumeTrack,
        seek,
        positionMillis,
        durationMillis,
        playbackRate,
        setPlaybackRate,
        downloadTrack,
        isDownloaded,
    } = useAudioStore();

    const [downloading, setDownloading] = useState(false);

    if (!currentTrack) {
        return (
            <View style={styles.emptyContainer}>
                <StatusBar barStyle="light-content" />
                <Text style={styles.emptyIcon}>🎧</Text>
                <Text style={styles.emptyText}>No track selected</Text>
            </View>
        );
    }

    const downloaded = isDownloaded(currentTrack.audioId);

    const handlePlayPause = () => {
        isPlaying ? pauseTrack() : resumeTrack();
    };

    const handleSeekForward = () => seek(Math.min(positionMillis + 10000, durationMillis));
    const handleSeekBackward = () => seek(Math.max(positionMillis - 10000, 0));

    const handleCycleSpeed = () => {
        const idx = SPEEDS.indexOf(playbackRate);
        const next = SPEEDS[(idx + 1) % SPEEDS.length];
        setPlaybackRate(next);
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadTrack(currentTrack);
            Alert.alert('Downloaded', `${currentTrack.surahNameEn} saved for offline.`);
        } catch {
            Alert.alert('Error', 'Failed to download.');
        } finally {
            setDownloading(false);
        }
    };

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Decorative artwork */}
            <View style={styles.artworkArea}>
                <View style={styles.artworkCircleOuter}>
                    <View style={styles.artworkCircleInner}>
                        <Text style={styles.artworkNumber}>{currentTrack.surahNumber}</Text>
                    </View>
                </View>
            </View>

            {/* Track info */}
            <View style={styles.infoArea}>
                <Text style={styles.arabicTitle}>{currentTrack.surahNameAr}</Text>
                <Text style={styles.englishTitle}>{currentTrack.surahNameEn}</Text>
                <Text style={styles.reciterLabel}>{currentTrack.reciterName}</Text>

                {/* Download status */}
                {downloaded ? (
                    <View style={styles.downloadedBadge}>
                        <Text style={styles.downloadedText}>✓  Available Offline</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.downloadBtn}
                        onPress={handleDownload}
                        disabled={downloading}
                    >
                        <Text style={styles.downloadBtnText}>
                            {downloading ? 'Downloading…' : '↓  Download for Offline'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Progress slider */}
            <View style={styles.progressArea}>
                <Slider
                    style={styles.slider}
                    value={progress}
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor="#C9A84C"
                    maximumTrackTintColor="rgba(255,255,255,0.12)"
                    thumbTintColor="#C9A84C"
                    onSlidingComplete={(val) => seek(val * durationMillis)}
                />
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
                    <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
                </View>
            </View>

            {/* Playback controls */}
            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleSeekBackward}>
                    <Text style={styles.secondaryBtnIcon}>↺</Text>
                    <Text style={styles.secondaryBtnLabel}>10s</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} style={styles.playBtn} onPress={handlePlayPause}>
                    <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={handleSeekForward}>
                    <Text style={styles.secondaryBtnIcon}>↻</Text>
                    <Text style={styles.secondaryBtnLabel}>10s</Text>
                </TouchableOpacity>
            </View>

            {/* Speed chip */}
            <TouchableOpacity style={styles.speedChip} activeOpacity={0.7} onPress={handleCycleSpeed}>
                <Text style={styles.speedChipText}>{playbackRate}×</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B1E',
        alignItems: 'center',
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#0D1B1E',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    emptyIcon: { fontSize: 48 },
    emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },

    // Artwork
    artworkArea: {
        flex: 1.2,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 60,
    },
    artworkCircleOuter: {
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_WIDTH * 0.5,
        borderRadius: SCREEN_WIDTH * 0.25,
        borderWidth: 2,
        borderColor: 'rgba(201,168,76,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    artworkCircleInner: {
        width: SCREEN_WIDTH * 0.4,
        height: SCREEN_WIDTH * 0.4,
        borderRadius: SCREEN_WIDTH * 0.2,
        backgroundColor: 'rgba(201,168,76,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    artworkNumber: { fontSize: 48, fontWeight: '200', color: '#C9A84C' },

    // Info
    infoArea: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 8 },
    arabicTitle: { fontSize: 36, color: '#C9A84C', fontWeight: '600', marginBottom: 4 },
    englishTitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
        letterSpacing: 1,
        marginBottom: 4,
    },
    reciterLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
    },
    downloadedBadge: {
        backgroundColor: 'rgba(74,222,128,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.25)',
    },
    downloadedText: { color: '#4ADE80', fontSize: 13, fontWeight: '600' },
    downloadBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.4)',
    },
    downloadBtnText: { color: '#C9A84C', fontSize: 13, fontWeight: '600' },

    // Progress
    progressArea: { width: '100%', paddingHorizontal: 24, marginTop: 24 },
    slider: { width: '100%', height: 30 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
    timeText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '500' },

    // Controls
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        marginTop: 24,
    },
    secondaryBtn: { alignItems: 'center', justifyContent: 'center' },
    secondaryBtnIcon: { fontSize: 28, color: 'rgba(255,255,255,0.6)' },
    secondaryBtnLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#C9A84C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    playBtnIcon: { fontSize: 28, color: '#0D1B1E' },

    // Speed
    speedChip: {
        marginTop: 24,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
    },
    speedChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
});
