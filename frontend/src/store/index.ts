import { create } from 'zustand';
import type { Dashboard, LiveDashboard, Alerts, Event } from '../services/Dashboard/dashboardType';

// 全局應用狀態
interface AppStore {
    currentEvent: Event | null;
    setCurrentEvent: (event: Event | null) => void;

    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;

    error: string | null;
    setError: (error: string | null) => void;
}

// 儀表板狀態
interface DashboardStore {
    stats: Dashboard | null;
    liveData: LiveDashboard | null;
    alerts: Alerts[];

    setStats: (stats: Dashboard | null) => void;
    setLiveData: (liveData: LiveDashboard | null) => void;
    setAlerts: (alerts: Alerts[]) => void;

    // 實時數據更新標志
    lastUpdated: Date | null;
    setLastUpdated: (date: Date | null) => void;
}

// 展覽狀態
interface EventStore {
    events: Event[];
    setEvents: (events: Event[]) => void;
    addEvent: (event: Event) => void;
    updateEvent: (id: string, updates: Partial<Event>) => void;
    deleteEvent: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    currentEvent: null,
    setCurrentEvent: (event) => set({ currentEvent: event }),

    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    loading: false,
    setLoading: (loading) => set({ loading }),

    error: null,
    setError: (error) => set({ error }),
}));

export const useDashboardStore = create<DashboardStore>((set) => ({
    stats: null,
    liveData: null,
    alerts: [],
    lastUpdated: null,

    setStats: (stats) => set({ stats }),
    setLiveData: (liveData) => set({ liveData }),
    setAlerts: (alerts) => set({ alerts }),
    setLastUpdated: (date) => set({ lastUpdated: date }),
}));

export const useEventStore = create<EventStore>((set) => ({
    events: [],
    setEvents: (events) => set({ events }),
    addEvent: (event) => set((state) => ({
        events: [...state.events, event]
    })),
    updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(event =>
            event.id === id ? { ...event, ...updates } : event
        )
    })),
    deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
    })),
}));

export { useBoothStore } from './boothStore';
