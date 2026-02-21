// ── API Response wrapper ──
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

// ── Reciter ──
export interface Reciter {
    id: number;
    name: string;
    name_ar: string | null;
    base_url: string | null;
    surahs: SurahAudio[];
}

// ── Surah audio record (from the API) ──
export interface SurahAudio {
    id: number;
    surah_number: number;
    file_name: string;
    file_url: string;
}

// ── Enriched track used internally by the player / store ──
export interface Track {
    audioId: number;        // SurahAudio.id  (unique audio record)
    surahNumber: number;
    surahNameEn: string;
    surahNameAr: string;
    reciterName: string;
    reciterNameAr: string | null;
    fileUrl: string;
}
