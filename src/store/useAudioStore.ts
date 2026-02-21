import { create } from 'zustand';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Surah } from '../types';

interface AudioState {
    currentTrack: Surah | null;
    sound: Audio.Sound | null;
    isPlaying: boolean;
    positionMillis: number;
    durationMillis: number;
    playbackRate: number;
    downloadedFiles: Record<number, string>; // Maps surah id to local uri

    // Actions
    playTrack: (track: Surah) => Promise<void>;
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    seek: (millis: number) => Promise<void>;
    setPlaybackRate: (rate: number) => Promise<void>;
    downloadTrack: (track: Surah) => Promise<void>;
    checkDownloads: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    currentTrack: null,
    sound: null,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    playbackRate: 1.0,
    downloadedFiles: {},

    playTrack: async (track: Surah) => {
        const { sound, downloadedFiles } = get();

        if (sound) {
            await sound.unloadAsync();
            set({ sound: null, isPlaying: false, positionMillis: 0 });
        }

        try {
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
            });

            const localUri = downloadedFiles[track.id];
            const sourceUri = localUri ? localUri : track.audio_url;

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

    downloadTrack: async (track: Surah) => {
        // using document directory for saving mp3 files
        const fileUri = `${FileSystem.documentDirectory}surah_${track.id}.mp3`;
        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                track.audio_url,
                fileUri,
                {},
                (_downloadProgress) => {
                    // You could track progress here via a callback or updating state
                }
            );
            const result = await downloadResumable.downloadAsync();
            if (result) {
                set((state) => ({
                    downloadedFiles: {
                        ...state.downloadedFiles,
                        [track.id]: result.uri,
                    },
                }));
            }
        } catch (e) {
            console.error('Download error', e);
        }
    },

    checkDownloads: async () => {
        // Basic check inside the document directory
        if (!FileSystem.documentDirectory) return;

        try {
            const dirInfo = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            const downloaded: Record<number, string> = {};

            for (const file of dirInfo) {
                if (file.startsWith('surah_') && file.endsWith('.mp3')) {
                    const idStr = file.replace('surah_', '').replace('.mp3', '');
                    const id = parseInt(idStr, 10);
                    if (!isNaN(id)) {
                        downloaded[id] = `${FileSystem.documentDirectory}${file}`;
                    }
                }
            }
            set({ downloadedFiles: downloaded });
        } catch (e) {
            console.error('Error checking local downloads:', e);
        }
    },
}));
