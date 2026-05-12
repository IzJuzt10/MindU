import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NavigationBar from '../components/NavigationBar';

// ============================================================
// DATA TYPES
// These interfaces define the shape of data used throughout the app.
// Backend developers should match these when creating API responses.
// ============================================================

/**
 * CalendarEvent - Represents a single event/task in the calendar
 * @property id - Unique identifier (currently generated client-side, will come from DB)
 * @property time - Event time display string (e.g., "9:00 AM")
 * @property title - Event name/description
 * @property type - "task" for to-do items, "event" for scheduled events
 * @property date - ISO date string (YYYY-MM-DD) the event belongs to
 */
interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'task' | 'event';
  date?: string;
}

/**
 * EventContextType - The global state shape shared across all screens
 * Backend integration points:
 * - events: Replace local state with API fetch on mount
 * - archivedEvents: Replace with API call to get deleted events
 * - addEvent: POST to backend API
 * - deleteEvent: DELETE request, moves event to archive
 * - deleteArchivedEvent: DELETE permanently from archive
 * - deleteAllArchived: DELETE all archived events
 * - restoreEvent: POST to move event back from archive to active
 * - isDarkMode/toggleDarkMode: User preference to persist in backend
 * - theme: Dynamic theme colors based on dark mode
 * @property events - All active events keyed by date (YYYY-MM-DD)
 * @property archivedEvents - Array of deleted/archived events
 * @property isDarkMode - Current dark mode state
 * @property toggleDarkMode - Function to toggle dark mode on/off
 * @property theme - Color palette that changes based on dark mode
 */
interface EventContextType {
  events: Record<string, CalendarEvent[]>;
  archivedEvents: CalendarEvent[];
  addEvent: (event: CalendarEvent, date: string) => void;
  deleteEvent: (eventId: string, date: string) => void;
  deleteArchivedEvent: (eventId: string) => void;
  deleteAllArchived: () => void;
  restoreEvent: (eventId: string, date: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: {
    bg: string;       // Background color
    text: string;     // Primary text color
    subtext: string;  // Secondary/subtitle text color
    card: string;     // Card/surface background color
    border: string;   // Border color for cards and inputs
    surface: string;  // Surface color for buttons and inputs
  };
}

// ============================================================
// GLOBAL CONTEXT
// Provides event data and theme to all screens via React Context.
// Wrap the entire app with EventContext.Provider in RootLayout.
// Access in any screen using the useEvents() hook.
// ============================================================
export const EventContext = createContext<EventContextType>({
  events: {},
  archivedEvents: [],
  addEvent: () => {},
  deleteEvent: () => {},
  deleteArchivedEvent: () => {},
  deleteAllArchived: () => {},
  restoreEvent: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
  theme: {
    bg: '#FFFFFF',
    text: '#333333',
    subtext: '#999999',
    card: '#F8F9FA',
    border: '#EEEEEE',
    surface: '#F5F5F5',
  },
});

/** Hook to access events and theme from any screen */
export const useEvents = () => useContext(EventContext);

/**
 * RootLayout - The main app wrapper component
 * Handles navigation structure, global event state, and theme management.
 * This is the entry point for the app's UI after the splash screen.
 * 
 * BACKEND INTEGRATION:
 * 1. Replace useState with useEffect that fetches events from API on mount
 * 2. Update addEvent/deleteEvent/etc to call API endpoints instead of local state
 * 3. Persist isDarkMode to user preferences in backend
 * 4. Add authentication check before showing main screens
 */
export default function RootLayout() {
  const pathname = usePathname();
  // Screens where the bottom navigation bar should be hidden
  const hiddenNavScreens = ['/', '/login', '/register'];
  const shouldShowNav = !hiddenNavScreens.includes(pathname);

  // Dark mode state - TO BACKEND: Save to user preferences in database
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Theme color mapping - changes based on isDarkMode flag
  const theme = {
    bg: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    subtext: isDarkMode ? '#AAAAAA' : '#999999',
    card: isDarkMode ? '#16213E' : '#F8F9FA',
    border: isDarkMode ? '#2A2A4A' : '#EEEEEE',
    surface: isDarkMode ? '#0F3460' : '#F5F5F5',
  };

  // Get today's date formatted as YYYY-MM-DD for event lookup key
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // ============================================================
  // EVENT STATE (Temporary - Replace with API calls)
  // Event data structure: { "YYYY-MM-DD": [CalendarEvent, ...] }
  // Example: { "2026-05-12": [{ id: "1", time: "9:00 AM", title: "Meeting", type: "event" }] }
  // ============================================================
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({
    [todayString]: [
      { id: '1', time: '6:00 AM', title: 'Daily Yoga', type: 'task' },
      { id: '2', time: '9:00 - 10:00 AM', title: 'Gym Time!', type: 'event' },
      { id: '3', time: '6:00 PM', title: 'Family Dinner', type: 'event' },
    ],
  });

  // Archived events (deleted from calendar but not permanently removed)
  const [archivedEvents, setArchivedEvents] = useState<CalendarEvent[]>([]);

  /**
   * addEvent - Adds a new event to a specific date
   * @param event - The event object to add
   * @param date - Date string in YYYY-MM-DD format
   * TO BACKEND: POST /api/events with body { event, date }
   * Response should return the created event with server-generated ID
   */
  const addEvent = (event: CalendarEvent, date: string) => {
    setEvents(prev => {
      const newEvents = { ...prev };
      if (!newEvents[date]) newEvents[date] = [];
      newEvents[date] = [...newEvents[date], event];
      return newEvents;
    });
  };

  /**
   * deleteEvent - Moves an event from active list to archive
   * @param eventId - The ID of the event to delete
   * @param date - The date the event belongs to (YYYY-MM-DD)
   * TO BACKEND: PUT /api/events/{eventId}/archive
   * This should move the event to an "archived" status, not delete it
   */
  const deleteEvent = (eventId: string, date: string) => {
    setEvents(prev => {
      const currentEvents = prev[date] || [];
      const eventToDelete = currentEvents.find(e => e.id === eventId);
      if (eventToDelete) {
        setArchivedEvents(prevArchive => [...prevArchive, { ...eventToDelete, id: Date.now().toString(), date }]);
        const newEvents = { ...prev };
        newEvents[date] = currentEvents.filter(e => e.id !== eventId);
        if (newEvents[date].length === 0) delete newEvents[date];
        return newEvents;
      }
      return prev;
    });
  };

  /**
   * deleteArchivedEvent - Permanently deletes an event from the archive
   * @param eventId - The ID of the archived event to permanently delete
   * TO BACKEND: DELETE /api/events/{eventId}/permanent
   * This is a hard delete - cannot be undone
   */
  const deleteArchivedEvent = (eventId: string) => {
    setArchivedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  /**
   * deleteAllArchived - Permanently deletes all archived events
   * TO BACKEND: DELETE /api/events/archived
   * Clears the entire archive
   */
  const deleteAllArchived = () => setArchivedEvents([]);

  /**
   * restoreEvent - Moves an event from archive back to active calendar
   * @param eventId - The ID of the archived event to restore
   * @param date - The date to restore the event to (YYYY-MM-DD)
   * TO BACKEND: PUT /api/events/{eventId}/restore
   * Should move event from archived status back to active
   */
  const restoreEvent = (eventId: string, date: string) => {
    setArchivedEvents(prev => {
      const event = prev.find(e => e.id === eventId);
      if (event) {
        setEvents(prevEvents => {
          const newEvents = { ...prevEvents };
          if (!newEvents[date]) newEvents[date] = [];
          newEvents[date] = [...newEvents[date], { ...event, id: Date.now().toString() }];
          return newEvents;
        });
      }
      return prev.filter(e => e.id !== eventId);
    });
  };

  return (
    <EventContext.Provider value={{ events, archivedEvents, addEvent, deleteEvent, deleteArchivedEvent, deleteAllArchived, restoreEvent, isDarkMode, toggleDarkMode, theme }}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        {/* Stack Navigator - Defines all screen routes in the app */}
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="calendar" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="add-event" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="archive" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="profile" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="notifications" options={{ freezeOnBlur: false }} />
        </Stack>
        {/* Bottom navigation bar - hidden on splash, login, and register screens */}
        {shouldShowNav && <NavigationBar />}
      </View>
    </EventContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});