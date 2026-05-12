import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../theme/colors';

const CalendarViewScreen = () => {
  const [selectedDate, setSelectedDate] = useState('2024-02-07');
  
  const events = [
    { time: '6:00 AM', title: 'Daily Yoga', type: 'task' },
    { time: '9:00 - 10:00 AM', title: 'Gym Time!', type: 'event' },
    { time: '6:00 PM', title: 'Family Dinner', type: 'event' },
  ];

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const getMarkedDates = () => {
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: colors.primary,
      },
      '2024-02-15': { marked: true, dotColor: colors.primary },
      '2024-02-20': { marked: true, dotColor: colors.warning },
      '2024-02-25': { marked: true, dotColor: colors.success },
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>MindU</Text>
      </View>

      {/* Month and Year */}
      <View style={styles.monthContainer}>
        <Text style={styles.monthText}>FEBRUARY</Text>
      </View>

      {/* Calendar */}
      <Calendar
        current={'2024-02-07'}
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: colors.white,
          calendarBackground: colors.white,
          textSectionTitleColor: colors.gray[700],
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.white,
          todayTextColor: colors.primary,
          dayTextColor: colors.gray[900],
          textDisabledColor: colors.gray[300],
          dotColor: colors.primary,
          selectedDotColor: colors.white,
          arrowColor: colors.primary,
          monthTextColor: colors.primary,
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />

      {/* Today's Events */}
      <View style={styles.todaySection}>
        <View style={styles.todayHeader}>
          <View>
            <Text style={styles.todayLabel}>TODAY</Text>
            <Text style={styles.todayDate}>7</Text>
            <Text style={styles.todayDay}>Thursday</Text>
          </View>
          <View style={styles.eventCount}>
            <Text style={styles.eventCountText}>1 events and 2 tasks</Text>
          </View>
        </View>

        {/* Events List */}
        <ScrollView style={styles.eventsList}>
          {events.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <View style={styles.eventTimeContainer}>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventDot} />
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Need to add TouchableOpacity import
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  monthContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    letterSpacing: 1,
  },
  todaySection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  todayLabel: {
    fontSize: 14,
    color: colors.gray[500],
    letterSpacing: 1,
  },
  todayDate: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  todayDay: {
    fontSize: 18,
    color: colors.gray[700],
  },
  eventCount: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  eventCountText: {
    color: colors.white,
    fontSize: 12,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  eventTimeContainer: {
    width: 100,
  },
  eventTime: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  eventDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 10,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 15,
    color: colors.gray[900],
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CalendarViewScreen;