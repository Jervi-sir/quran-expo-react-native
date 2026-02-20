import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioStore } from '../store/useAudioStore';

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
        downloadedFiles
    } = useAudioStore();

    if (!currentTrack) {
        return (
            <View style={styles.centered}>
                <Text>No track selected</Text>
            </View>
        );
    }

    const isDownloaded = !!downloadedFiles[currentTrack.id];

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    const handleSeekForward = () => seek(positionMillis + 10000); // +10s
    const handleSeekBackward = () => Math.max(0, seek(positionMillis - 10000)); // -10s
    const handleToggleSpeed = () => {
        const nextRate = playbackRate === 1.0 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
        setPlaybackRate(nextRate);
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{currentTrack.name_en}</Text>
            <Text style={styles.subtitle}>{currentTrack.name_ar}</Text>

            {isDownloaded ? (
                <Text style={styles.badge}>Downloaded ✔</Text>
            ) : (
                <TouchableOpacity style={styles.downloadButton} onPress={() => downloadTrack(currentTrack)}>
                    <Text style={styles.downloadText}>Download for Offline</Text>
                </TouchableOpacity>
            )}

            <View style={styles.progressContainer}>
                <Text>{formatTime(positionMillis)}</Text>
                <Text>{formatTime(durationMillis)}</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn} onPress={handleSeekBackward}>
                    <Text>⏪ 10s</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
                    <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn} onPress={handleSeekForward}>
                    <Text>10s ⏩</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.speedBtn} onPress={handleToggleSpeed}>
                <Text>Speed: {playbackRate}x</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 20 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 28, color: '#555', marginBottom: 30 },
    badge: { backgroundColor: '#e0ffe0', color: '#006600', padding: 8, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
    downloadButton: { padding: 10, borderWidth: 1, borderColor: '#007bff', borderRadius: 8, marginBottom: 20 },
    downloadText: { color: '#007bff', fontWeight: 'bold' },
    progressContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30, paddingHorizontal: 20 },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginBottom: 30 },
    controlBtn: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 },
    playBtn: { padding: 20, backgroundColor: '#007bff', borderRadius: 40, width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
    playBtnText: { color: '#fff', fontWeight: 'bold' },
    speedBtn: { padding: 10, backgroundColor: '#eee', borderRadius: 8 },
});
