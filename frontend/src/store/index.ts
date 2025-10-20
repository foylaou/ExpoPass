import { create } from 'zustand';
import type {Alert, DashboardStats, LiveData, Event} from "../types";

// 全局应用状态
interface AppStore {
  // 当前选中的展览
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;

  // 侧边栏状态
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // 加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // 错误状态
  error: string | null;
  setError: (error: string | null) => void;
}

// 仪表板状态
interface DashboardStore {
  stats: DashboardStats | null;
  liveData: LiveData | null;
  alerts: Alert[];

  setStats: (stats: DashboardStats) => void;
  setLiveData: (liveData: LiveData) => void;
  setAlerts: (alerts: Alert[]) => void;

  // 实时数据更新标志
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
}

// 展览状态
interface EventStore {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
}

// 创建状态管理
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
