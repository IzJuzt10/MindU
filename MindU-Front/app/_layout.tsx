import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NavigationBar from '../components/NavigationBar';

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'task' | 'event';
  date?: string;
}

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
    bg: string;
    text: string;
    subtext: string;
    card: string;
    border: string;
    surface: string;
  };
}

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

export const useEvents = () => useContext(EventContext);

export default function RootLayout() {
  const pathname = usePathname();
  const hiddenNavScreens = ['/', '/login', '/register'];
  const shouldShowNav = !hiddenNavScreens.includes(pathname);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    bg: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    subtext: isDarkMode ? '#AAAAAA' : '#999999',
    card: isDarkMode ? '#16213E' : '#F8F9FA',
    border: isDarkMode ? '#2A2A4A' : '#EEEEEE',
    surface: isDarkMode ? '#0F3460' : '#F5F5F5',
  };

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({
    [todayString]: [
      { id: '1', time: '6:00 AM', title: 'Daily Yoga', type: 'task' },
      { id: '2', time: '9:00 - 10:00 AM', title: 'Gym Time!', type: 'event' },
      { id: '3', time: '6:00 PM', title: 'Family Dinner', type: 'event' },
    ],
  });

  const [archivedEvents, setArchivedEvents] = useState<CalendarEvent[]>([]);

  const addEvent = (event: CalendarEvent, date: string) => {
    setEvents(prev => {
      const newEvents = { ...prev };
      if (!newEvents[date]) {
        newEvents[date] = [];
      }
      newEvents[date] = [...newEvents[date], event];
      return newEvents;
    });
  };

  const deleteEvent = (eventId: string, date: string) => {
    setEvents(prev => {
      const currentEvents = prev[date] || [];
      const eventToDelete = currentEvents.find(e => e.id === eventId);
      
      if (eventToDelete) {
        setArchivedEvents(prevArchive => [...prevArchive, { 
          ...eventToDelete, 
          id: Date.now().toString(),
          date: date 
        }]);
        
        const newEvents = { ...prev };
        newEvents[date] = currentEvents.filter(e => e.id !== eventId);
        if (newEvents[date].length === 0) {
          delete newEvents[date];
        }
        return newEvents;
      }
      return prev;
    });
  };

  const deleteArchivedEvent = (eventId: string) => {
    setArchivedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const deleteAllArchived = () => {
    setArchivedEvents([]);
  };

  const restoreEvent = (eventId: string, date: string) => {
    setArchivedEvents(prev => {
      const event = prev.find(e => e.id === eventId);
      if (event) {
        setEvents(prevEvents => {
          const newEvents = { ...prevEvents };
          if (!newEvents[date]) {
            newEvents[date] = [];
          }
          newEvents[date] = [...newEvents[date], { ...event, id: Date.now().toString() }];
          return newEvents;
        });
      }
      return prev.filter(e => e.id !== eventId);
    });
  };

  return (
    <EventContext.Provider value={{
      events,
      archivedEvents,
      addEvent,
      deleteEvent,
      deleteArchivedEvent,
      deleteAllArchived,
      restoreEvent,
      isDarkMode,
      toggleDarkMode,
      theme,
    }}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'none',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="calendar" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="add-event" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="archive" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="profile" options={{ freezeOnBlur: false }} />
          <Stack.Screen name="notifications" options={{ freezeOnBlur: false }} />
        </Stack>
        
        {shouldShowNav && <NavigationBar />}
      </View>
    </EventContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});