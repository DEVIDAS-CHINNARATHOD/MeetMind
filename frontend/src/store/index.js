import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // ── Events ────────────────────────────────────
  events: [],
  currentEvent: null,
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  addEvent: (event) => set(s => ({ events: [event, ...s.events] })),
  removeEvent: (id) => set(s => ({ events: s.events.filter(e => e.id !== id) })),

  // ── Meetings ──────────────────────────────────
  currentMeeting: null,
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  updateCurrentMeeting: (data) => set(s => ({
    currentMeeting: s.currentMeeting ? { ...s.currentMeeting, ...data } : null,
  })),

  // ── Loading states ────────────────────────────
  loading: {},
  setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),
  isLoading: (key) => get().loading[key] || false,

  // ── Notifications ─────────────────────────────
  notifications: [],
  addNotification: (msg, type = 'info') => {
    const id = Date.now();
    set(s => ({ notifications: [...s.notifications, { id, msg, type }] }));
    setTimeout(() => set(s => ({
      notifications: s.notifications.filter(n => n.id !== id),
    })), 4000);
  },
  removeNotification: (id) => set(s => ({
    notifications: s.notifications.filter(n => n.id !== id),
  })),
}));
