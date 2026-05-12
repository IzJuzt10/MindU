import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEvents } from './_layout';

const { width } = Dimensions.get('window');

// Urgency level options with their display labels and color codes
// Low = Green (task), Medium = Orange (normal event), High = Red (urgent event)
const urgencyLevels = [
  { id: 'low', label: 'Low', color: '#4CAF50' },
  { id: 'medium', label: 'Medium', color: '#FF9800' },
  { id: 'high', label: 'High', color: '#F44336' },
];

// Abbreviated month names for the month picker
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * AddEventScreen - Form screen for creating new calendar events
 * Users select a date, enter time and description, and set urgency level.
 * On save, navigates back to calendar with a success confirmation.
 * 
 * BACKEND INTEGRATION:
 * The handleSave function calls addEvent() from the EventContext.
 * Replace with POST /api/events endpoint call.
 * Event ID should be generated server-side (UUID).
 */
export default function AddEventScreen() {
  const router = useRouter();
  const { addEvent, theme } = useEvents();
  
  const today = new Date();
  // Date picker state - defaults to today's date
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  // Event detail inputs
  const [eventTime, setEventTime] = useState<string>('');              // User's time input (free text)
  const [eventDescription, setEventDescription] = useState<string>(''); // Event title/name
  const [urgencyLevel, setUrgencyLevel] = useState<string>('medium');   // Default: medium urgency
  // UI state toggles
  const [showSuccess, setShowSuccess] = useState<boolean>(false);       // Controls success popup visibility
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [showDayPicker, setShowDayPicker] = useState<boolean>(false);

  // Calculate the number of days in the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /**
   * handleSave - Validates input and saves the event
   * Checks that time and description are filled in.
   * Formats the date as YYYY-MM-DD and calls addEvent from context.
   * Shows success popup for 500ms then navigates back to calendar.
   * 
   * TO BACKEND: Replace with POST /api/events
   * Request body: { date, time, title, type }
   * type is "task" for low urgency, "event" for medium/high
   */
  const handleSave = (): void => {
    // Input validation
    if (!eventTime.trim() || !eventDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Format date as YYYY-MM-DD for consistent storage
    const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    // Create event object and add to store
    addEvent({
      id: Date.now().toString(), // TO BACKEND: Let server generate UUID
      time: eventTime,
      title: eventDescription,
      type: urgencyLevel === 'low' ? 'task' : 'event',
    }, date);

    // Show success feedback then navigate away
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.replace('/calendar');
    }, 500);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.container}>
        {/* Top bar with back button */}
        <View style={styles.topBar}>
          <Pressable 
            delayLongPress={0}
            pressRetentionOffset={0}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card },
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => router.replace('/calendar')}
          >
            <Text style={[styles.backButtonText, { color: theme.text }]}>← Back</Text>
          </Pressable>
        </View>

        {/* Screen title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: theme.text }]}>Add New Event</Text>
        </View>

        {/* Scrollable form content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Date Selection Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Select Date</Text>
            <View style={styles.datePickerRow}>
              {/* Month picker button */}
              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowDayPicker(false);
                }}
              >
                <Text style={[styles.dateButtonText, { color: theme.text }]}>{months[selectedMonth]}</Text>
              </Pressable>
              
              {/* Day picker button */}
              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {
                  setShowDayPicker(!showDayPicker);
                  setShowMonthPicker(false);
                }}
              >
                <Text style={[styles.dateButtonText, { color: theme.text }]}>{selectedDay}</Text>
              </Pressable>
              
              {/* Year display (static for now) */}
              <View style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.dateButtonText, { color: theme.text }]}>{selectedYear}</Text>
              </View>
            </View>

            {/* Month Picker Grid - Shows all 12 months */}
            {showMonthPicker && (
              <View style={[styles.pickerGrid, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {months.map((month, index) => (
                  <Pressable
                    key={index}
                    delayLongPress={0}
                    pressRetentionOffset={0}
                    style={[
                      styles.pickerItem,
                      selectedMonth === index && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setSelectedMonth(index);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      { color: theme.text },
                      selectedMonth === index && styles.pickerItemTextActive,
                    ]}>
                      {month}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Day Picker Grid - Shows days in selected month */}
            {showDayPicker && (
              <View style={[styles.pickerGrid, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {days.map((day) => (
                  <Pressable
                    key={day}
                    delayLongPress={0}
                    pressRetentionOffset={0}
                    style={[
                      styles.pickerItem,
                      selectedDay === day && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setSelectedDay(day);
                      setShowDayPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      { color: theme.text },
                      selectedDay === day && styles.pickerItemTextActive,
                    ]}>
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Time Input Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Time</Text>
            <TextInput
              style={[styles.timeInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g., 9:00 AM"
              placeholderTextColor={theme.subtext}
              value={eventTime}
              onChangeText={setEventTime}
            />
          </View>

          {/* Description Input Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.descriptionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter event description..."
              placeholderTextColor={theme.subtext}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Urgency Level Selector */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Urgency Level</Text>
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map((level) => (
                <Pressable
                  key={level.id}
                  delayLongPress={0}
                  pressRetentionOffset={0}
                  style={({ pressed }) => [
                    styles.urgencyButton,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    urgencyLevel === level.id && { 
                      backgroundColor: level.color,
                      borderColor: level.color,
                    },
                    pressed && styles.urgencyButtonPressed,
                  ]}
                  onPress={() => setUrgencyLevel(level.id)}
                >
                  {/* Color indicator dot */}
                  <View style={[
                    styles.urgencyDot,
                    { backgroundColor: urgencyLevel === level.id ? '#FFFFFF' : level.color }
                  ]} />
                  <Text style={[
                    styles.urgencyText,
                    { color: theme.text },
                    urgencyLevel === level.id && styles.urgencyTextActive,
                  ]}>
                    {level.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <Pressable 
            delayLongPress={0}
            pressRetentionOffset={0}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Event</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      {/* Success Notification Popup - Shown for 500ms after saving */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={[styles.successModal, { backgroundColor: theme.bg }]}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={[styles.successText, { color: theme.text }]}>Added successfully!</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, paddingTop: Platform.OS === 'ios' ? 20 : 28, paddingBottom: 8, zIndex: 100 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  backButtonPressed: { opacity: 0.5, transform: [{ scale: 0.96 }] },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  titleContainer: { paddingHorizontal: 30, paddingBottom: 16 },
  titleText: { fontSize: 28, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 }, // Extra padding to clear navigation bar
  sectionContainer: { paddingHorizontal: 28, marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  datePickerRow: { flexDirection: 'row', gap: 10 },
  dateButton: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  dateButtonText: { fontSize: 16, fontWeight: '600' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, borderRadius: 14, padding: 10, borderWidth: 1 },
  pickerItem: { width: (width - 100) / 6, paddingVertical: 10, alignItems: 'center', borderRadius: 8, margin: 3 },
  pickerItemActive: { backgroundColor: '#6C63FF' },
  pickerItemText: { fontSize: 14, fontWeight: '500' },
  pickerItemTextActive: { color: '#FFFFFF' },
  timeInput: { borderRadius: 14, padding: 16, fontSize: 16, borderWidth: 1 },
  descriptionInput: { borderRadius: 14, padding: 16, fontSize: 16, borderWidth: 1, minHeight: 100 },
  urgencyContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  urgencyButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, borderWidth: 2, gap: 8 },
  urgencyButtonPressed: { opacity: 0.5, transform: [{ scale: 0.96 }] },
  urgencyDot: { width: 12, height: 12, borderRadius: 6 },
  urgencyText: { fontSize: 14, fontWeight: '600' },
  urgencyTextActive: { color: '#FFFFFF' },
  saveButton: { marginHorizontal: 28, backgroundColor: '#6C63FF', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10 },
  saveButtonPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  successModal: { borderRadius: 20, padding: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successText: { fontSize: 20, fontWeight: '600' },
});