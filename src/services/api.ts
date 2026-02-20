import { Surah } from '../types';

const MOCK_SURAHS: Surah[] = [
    { id: 1, name_en: 'Al-Fatihah', name_ar: 'الفاتحة', audio_url: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3' },
    { id: 2, name_en: 'Al-Baqarah', name_ar: 'البقرة', audio_url: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/2.mp3' },
    { id: 3, name_en: 'Aal-E-Imran', name_ar: 'آل عمران', audio_url: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/3.mp3' },
];

export const fetchSurahs = async (): Promise<Surah[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_SURAHS);
        }, 1000);
    });
};
