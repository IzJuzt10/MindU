import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import SearchBar from '../components/SearchBar';
import WeatherWidget from '../components/WeatherWidget';
import { useEvents } from './_layout';

const { width } = Dimensions.get('window');

interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dotColor?: string;
    disableTouchEvent?: boolean;
    activeOpacity?: number;
  };
}

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'task' | 'event';
  date?: string;
}

const TrashIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </Svg>
);

let CalendarComponent: any = null;

export default function CalendarViewScreen() {
  const { events, deleteEvent, theme } = useEvents();
  const [CalendarModule, setCalendarModule] = useState<any>(null);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayString = formatDate(today);
  
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [displayMonth, setDisplayMonth] = useState<number>(currentMonth);
  const [displayYear, setDisplayYear] = useState<number>(currentYear);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames: string[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];

  const realToday = new Date();
  const realTodayDate = realToday.getDate();
  const realTodayDay = realToday.getDay();

  const todayEvents: CalendarEvent[] = events[todayString] || [];
  
  const filteredEvents = searchQuery.trim() 
    ? todayEvents.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : todayEvents;
    
  const taskCount = filteredEvents.filter((e: CalendarEvent) => e.type === 'task').length;
  const eventOnlyCount = filteredEvents.filter((e: CalendarEvent) => e.type === 'event').length;

  useEffect(() => {
    if (!CalendarComponent) {
      CalendarComponent = require('react-native-calendars').Calendar;
    }
    setCalendarModule(() => CalendarComponent);
  }, []);

  const onDayPress = (day: any): void => {
    setSelectedDate(day.dateString);
  };

  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};
    marked[selectedDate] = {
      selected: true,
      selectedColor: '#6C63FF',
    };
    Object.keys(events).forEach((date: string) => {
      if (date !== selectedDate && events[date]?.length > 0) {
        marked[date] = {
          marked: true,
          dotColor: '#6C63FF',
        };
      }
    });
    return marked;
  };

  const handleDeleteEvent = (eventId: string): void => {
    deleteEvent(eventId, todayString);
  };

  const handleViewModeChange = (mode: 'month' | 'year'): void => {
    setViewMode(mode);
    setDropdownVisible(false);
  };

  const handleMonthSelect = (monthIndex: number): void => {
    setDisplayMonth(monthIndex);
    setViewMode('month');
    setDropdownVisible(false);
  };

  const getMonthDate = (monthIndex: number): string => {
    const year = displayYear;
    const month = String(monthIndex + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const renderYearView = () => {
    if (!CalendarModule) return <ActivityIndicator style={{ marginTop: 40 }} color="#6C63FF" />;
    
    return (
      <ScrollView 
        style={styles.yearScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.yearScrollContent}
      >
        <View style={styles.yearGrid}>
          {monthNames.map((monthName, index) => {
            const isCurrentMonth = index === currentMonth;
            return (
              <Pressable
                key={index}
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.yearMonthCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  pressed && styles.pressedCard,
                ]}
                onPress={() => handleMonthSelect(index)}
              >
                <Text style={[
                  styles.yearMonthTitle,
                  { color: theme.subtext },
                  isCurrentMonth && styles.yearMonthTitleCurrent,
                ]}>
                  {monthName.substring(0, 3)}
                </Text>
                <CalendarModule
                  current={getMonthDate(index)}
                  hideArrows={true}
                  hideExtraDays={false}
                  disableAllTouchEventsForDisabledDays={true}
                  firstDay={0}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: theme.subtext,
                    selectedDayBackgroundColor: '#6C63FF',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#6C63FF',
                    dayTextColor: theme.text,
                    textDisabledColor: '#DDDDDD',
                    monthTextColor: 'transparent',
                    textDayFontSize: 7,
                    textMonthFontSize: 1,
                    textDayHeaderFontSize: 6,
                    'stylesheet.calendar.header': {
                      week: {
                        marginTop: 1,
                        marginBottom: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      },
                      dayHeader: {
                        width: 16,
                        textAlign: 'center',
                        fontSize: 5.5,
                        color: theme.subtext,
                      },
                    },
                    'stylesheet.day.basic': {
                      base: {
                        width: 16,
                        height: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      text: {
                        fontSize: 7,
                        color: theme.text,
                      },
                    },
                  }}
                  style={{
                    marginLeft: -5,
                    marginRight: -5,
                    marginTop: -3,
                    marginBottom: -3,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable 
            delayLongPress={0}
            pressRetentionOffset={0}
            style={({ pressed }) => [
              styles.dropdownButton,
              { backgroundColor: theme.surface },
              pressed && styles.pressedButton,
            ]}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
              {viewMode === 'month' ? monthNames[displayMonth] : String(displayYear)}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </Pressable>
        </View>

        {viewMode === 'month' && (
          <>
            <SearchBar onSearch={setSearchQuery} theme={theme} />
            <WeatherWidget />
          </>
        )}

        {dropdownVisible && (
          <View style={styles.dropdownOverlay}>
            <Pressable 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              onPress={() => setDropdownVisible(false)}
              delayLongPress={0}
              pressRetentionOffset={0}
            />
            <View style={styles.dropdownMenuWrapper}>
              <View style={[styles.dropdownMenu, { backgroundColor: theme.bg }]}>
                <Pressable 
                  delayLongPress={0}
                  pressRetentionOffset={0}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    viewMode === 'month' && styles.dropdownItemActive,
                    pressed && { opacity: 0.5 },
                  ]}
                  onPress={() => handleViewModeChange('month')}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    { color: theme.text },
                    viewMode === 'month' && styles.dropdownItemTextActive
                  ]}>
                    Month
                  </Text>
                </Pressable>
                
                <Pressable 
                  delayLongPress={0}
                  pressRetentionOffset={0}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    viewMode === 'year' && styles.dropdownItemActive,
                    pressed && { opacity: 0.5 },
                  ]}
                  onPress={() => handleViewModeChange('year')}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    { color: theme.text },
                    viewMode === 'year' && styles.dropdownItemTextActive
                  ]}>
                    Year
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {viewMode === 'month' ? (
          <ScrollView 
            style={styles.monthScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.monthScrollContent}
          >
            <View style={styles.calendarWrapper}>
              {CalendarModule ? (
                <CalendarModule
                  current={getMonthDate(displayMonth)}
                  onDayPress={onDayPress}
                  markedDates={getMarkedDates()}
                  theme={{
                    backgroundColor: theme.bg,
                    calendarBackground: theme.bg,
                    textSectionTitleColor: theme.subtext,
                    selectedDayBackgroundColor: '#6C63FF',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#6C63FF',
                    dayTextColor: theme.text,
                    textDisabledColor: '#CCCCCC',
                    dotColor: '#6C63FF',
                    selectedDotColor: '#FFFFFF',
                    arrowColor: '#6C63FF',
                    monthTextColor: '#6C63FF',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14,
                  }}
                />
              ) : (
                <View style={{ height: 350, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator color="#6C63FF" />
                </View>
              )}
            </View>

            <View style={styles.todaySection}>
              <View style={styles.todayHeader}>
                <View>
                  <Text style={styles.todayLabel}>TODAY</Text>
                  <Text style={[styles.todayDate, { color: theme.text }]}>{realTodayDate}</Text>
                  <Text style={[styles.todayDay, { color: theme.subtext }]}>{dayNames[realTodayDay]}</Text>
                </View>
                {filteredEvents.length > 0 && (
                  <View style={styles.eventCount}>
                    <Text style={styles.eventCountText}>
                      {eventOnlyCount} events and {taskCount} tasks
                    </Text>
                  </View>
                )}
              </View>

              {filteredEvents.length > 0 ? (
                filteredEvents.map((event: CalendarEvent) => (
                  <View key={event.id} style={styles.eventItem}>
                    <View style={styles.eventTimeContainer}>
                      <Text style={[styles.eventTime, { color: theme.subtext }]}>{event.time}</Text>
                    </View>
                    <View style={[styles.eventDetails, { backgroundColor: theme.card }]}>
                      <View style={[
                        styles.eventDot,
                        { backgroundColor: event.type === 'task' ? '#FF9800' : '#6C63FF' }
                      ]} />
                      <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
                    </View>
                    <Pressable
                      delayLongPress={0}
                      pressRetentionOffset={0}
                      style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && styles.deleteButtonPressed,
                      ]}
                      onPress={() => handleDeleteEvent(event.id)}
                    >
                      <TrashIcon />
                    </Pressable>
                  </View>
                ))
              ) : (
                <View style={styles.noEvents}>
                  <Text style={styles.noEventsText}>
                    {searchQuery.trim() ? 'No matching events' : 'No events for today'}
                  </Text>
                </View>
              )}

              {filteredEvents.length > 0 && (
                <Pressable 
                  delayLongPress={0}
                  pressRetentionOffset={0}
                  style={({ pressed }) => [
                    styles.viewAllButton,
                    pressed && styles.viewAllButtonPressed,
                  ]}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        ) : (
          renderYearView()
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 20 : 28,
    paddingBottom: 8,
    zIndex: 100,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pressedButton: {
    opacity: 0.5,
    transform: [{ scale: 0.96 }],
  },
  dropdownButtonText: {
    fontSize: 17,
    fontWeight: '600',
    marginRight: 10,
  },
  dropdownArrow: {
    fontSize: 11,
    color: '#666666',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  dropdownMenuWrapper: {
    paddingTop: Platform.OS === 'ios' ? 110 : 130,
    paddingHorizontal: 30,
  },
  dropdownMenu: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 3,
  },
  dropdownItemActive: {
    backgroundColor: '#F0EEFF',
  },
  dropdownItemText: {
    fontSize: 17,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  monthScrollView: {
    flex: 1,
  },
  monthScrollContent: {
    paddingBottom: 100,
  },
  calendarWrapper: {
    paddingHorizontal: 10,
  },
  yearScrollView: {
    flex: 1,
  },
  yearScrollContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 100,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearMonthCard: {
    width: (width - 28) / 3,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  pressedCard: {
    opacity: 0.5,
    transform: [{ scale: 0.97 }],
  },
  yearMonthTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 1,
    textAlign: 'center',
  },
  yearMonthTitleCurrent: {
    color: '#6C63FF',
  },
  todaySection: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 30,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 14,
    color: '#999999',
    letterSpacing: 1.5,
    fontWeight: '500',
    marginBottom: 2,
  },
  todayDate: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 44,
  },
  todayDay: {
    fontSize: 16,
    marginTop: -2,
  },
  eventCount: {
    backgroundColor: '#8B85FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 6,
  },
  eventCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  eventTimeContainer: {
    width: 95,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.5,
    backgroundColor: '#FFE0E0',
  },
  noEvents: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  noEventsText: {
    fontSize: 15,
    color: '#999999',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllButtonPressed: {
    opacity: 0.5,
  },
  viewAllText: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '500',
  },
});