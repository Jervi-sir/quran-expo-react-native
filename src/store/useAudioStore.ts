import { create } from 'zustand';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Track } from '../types';

interface AudioState {
    currentTrack: Track | null;
    sound: Audio.Sound | null;
    isPlaying: boolean;
    positionMillis: number;
    durationMillis: number;
    playbackRate: number;
    downloadedFiles: Record<string, string>; // key = "audioId" -> local uri

    // Actions
    playTrack: (track: Track) => Promise<void>;
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    seek: (millis: number) => Promise<void>;
    setPlaybackRate: (rate: number) => Promise<void>;
    downloadTrack: (track: Track) => Promise<void>;
    checkDownloads: () => Promise<void>;
    isDownloaded: (audioId: number) => boolean;
}

const downloadKey = (audioId: number) => `audio_${audioId}`;

export const useAudioStore = create<AudioState>((set, get) => ({
    currentTrack: null,
    sound: null,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    playbackRate: 1.0,
    downloadedFiles: {},

    playTrack: async (track: Track) => {
        const { sound, downloadedFiles } = get();

        // Unload any previous sound
        if (sound) {
            await sound.unloadAsync();
            set({ sound: null, isPlaying: false, positionMillis: 0 });
        }

        try {
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
            });

            // Prefer local file, fall back to remote stream
            const key = downloadKey(track.audioId);
            const localUri = downloadedFiles[key];
            const sourceUri = localUri ?? track.fileUrl;

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: sourceUri },
                { shouldPlay: true, rate: get().playbackRate },
                (status) => {
                    if (status.isLoaded) {
                        set({
                            positionMillis: status.positionMillis,
                            durationMillis: status.durationMillis || 0,
                            isPlaying: status.isPlaying,
                        });
                        if (status.didJustFinish) {
                            set({ isPlaying: false });
                        }
                    }
                }
            );

            set({ currentTrack: track, sound: newSound, isPlaying: true });
        } catch (e) {
            console.error('Error playing track', e);
        }
    },

    pauseTrack: async () => {
        const { sound } = get();
        if (sound) {
            await sound.pauseAsync();
            set({ isPlaying: false });
        }
    },

    resumeTrack: async () => {
        const { sound } = get();
        if (sound) {
            await sound.playAsync();
            set({ isPlaying: true });
        }
    },

    seek: async (millis: number) => {
        const { sound } = get();
        if (sound) {
            await sound.setPositionAsync(millis);
        }
    },

    setPlaybackRate: async (rate: number) => {
        const { sound } = get();
        if (sound) {
            await sound.setRateAsync(rate, true);
        }
        set({ playbackRate: rate });
    },

    downloadTrack: async (track: Track) => {
        const key = downloadKey(track.audioId);
        const fileUri = `${FileSystem.documentDirectory}${key}.mp3`;

        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                track.fileUrl,
                fileUri,
                {},
                (_progress) => {
                    // Optional: track download progress here
                }
            );
            const result = await downloadResumable.downloadAsync();
            if (result) {
                set((state) => ({
                    downloadedFiles: {
                        ...state.downloadedFiles,
                        [key]: result.uri,
                    },
                }));
            }
        } catch (e) {
            console.error('Download error', e);
        }
    },

    checkDownloads: async () => {
        if (!FileSystem.documentDirectory) return;

        try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            const downloaded: Record<string, string> = {};

            for (const file of files) {
                if (file.startsWith('audio_') && file.endsWith('.mp3')) {
                    const key = file.replace('.mp3', '');
                    downloaded[key] = `${FileSystem.documentDirectory}${file}`;
                }
            }
            set({ downloadedFiles: downloaded });
        } catch (e) {
            console.error('Error checking local downloads:', e);
        }
    },

    isDownloaded: (audioId: number) => {
        return !!get().downloadedFiles[downloadKey(audioId)];
    },
}));
