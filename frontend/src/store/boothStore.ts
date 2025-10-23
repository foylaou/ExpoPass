import { create } from 'zustand';
import type { Booths, GetBoothStatsResponse, GetBoothVisitorsResponse, GetBoothDailyStatsResponse, GetBoothHourlyStatsResponse, GetBoothRepeatVisitorResponse } from '../services/Booths/boothsType';

interface BoothStore {
    // 攤位列表
    booths: Booths[];
    setBooths: (booths: Booths[]) => void;

    // 當前選中的攤位
    currentBooth: Booths | null;
    setCurrentBooth: (booth: Booths | null) => void;

    // 攤位統計
    boothStats: GetBoothStatsResponse | null;
    setBoothStats: (stats: GetBoothStatsResponse | null) => void;

    // 攤位訪客
    boothVisitors: GetBoothVisitorsResponse[];
    setBoothVisitors: (visitors: GetBoothVisitorsResponse[]) => void;

    // 每日統計
    dailyStats: GetBoothDailyStatsResponse[];
    setDailyStats: (stats: GetBoothDailyStatsResponse[]) => void;

    // 每小時統計
    hourlyStats: GetBoothHourlyStatsResponse[];
    setHourlyStats: (stats: GetBoothHourlyStatsResponse[]) => void;

    // 重複訪客
    repeatVisitors: GetBoothRepeatVisitorResponse[];
    setRepeatVisitors: (visitors: GetBoothRepeatVisitorResponse[]) => void;

    // 載入狀態
    loading: boolean;
    setLoading: (loading: boolean) => void;

    // 錯誤狀態
    error: string | null;
    setError: (error: string | null) => void;
}

export const useBoothStore = create<BoothStore>((set) => ({
    booths: [],
    setBooths: (booths) => set({ booths }),

    currentBooth: null,
    setCurrentBooth: (booth) => set({ currentBooth: booth }),

    boothStats: null,
    setBoothStats: (stats) => set({ boothStats: stats }),

    boothVisitors: [],
    setBoothVisitors: (visitors) => set({ boothVisitors: visitors }),

    dailyStats: [],
    setDailyStats: (stats) => set({ dailyStats: stats }),

    hourlyStats: [],
    setHourlyStats: (stats) => set({ hourlyStats: stats }),

    repeatVisitors: [],
    setRepeatVisitors: (visitors) => set({ repeatVisitors: visitors }),

    loading: false,
    setLoading: (loading) => set({ loading }),

    error: null,
    setError: (error) => set({ error }),
}));
