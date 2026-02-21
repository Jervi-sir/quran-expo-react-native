import { ApiResponse, Reciter, SurahAudio } from '../types';

const BASE_URL = 'https://quran-api.gacembekhira.workers.dev';

// ── Reciters (with nested surahs) ──────────────────────────
export const fetchReciters = async (): Promise<Reciter[]> => {
    const res = await fetch(`${BASE_URL}/api/reciters`);
    const json: ApiResponse<Reciter[]> = await res.json();

    if (!json.success) {
        throw new Error(json.error ?? 'Failed to fetch reciters');
    }

    return json.data;
};

// ── Single reciter by ID ───────────────────────────────────
export const fetchReciter = async (id: number): Promise<Reciter> => {
    const res = await fetch(`${BASE_URL}/api/reciters/${id}`);
    const json: ApiResponse<Reciter> = await res.json();

    if (!json.success) {
        throw new Error(json.error ?? 'Reciter not found');
    }

    return json.data;
};

// ── Flat list of surahs ────────────────────────────────────
export const fetchSurahs = async (): Promise<SurahAudio[]> => {
    const res = await fetch(`${BASE_URL}/api/surahs`);
    const json: ApiResponse<SurahAudio[]> = await res.json();

    if (!json.success) {
        throw new Error(json.error ?? 'Failed to fetch surahs');
    }

    return json.data;
};
