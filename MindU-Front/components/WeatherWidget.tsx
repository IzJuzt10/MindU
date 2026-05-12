import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * WeatherData interface - Shape of weather data from the API
 * @property temp - Current temperature in Celsius
 * @property emoji - Weather condition emoji
 * @property dailyForecast - Array of 7-day forecast items
 */
interface WeatherData {
  temp: number;
  emoji: string;
  dailyForecast: { day: string; tempMax: number; tempMin: number; emoji: string }[];
}

/**
 * Maps Open-Meteo weather codes to emoji representations
 * Open-Meteo API is FREE and requires NO API key.
 * Weather codes: https://open-meteo.com/en/docs#weathervariables
 * 
 * @param code - Weather code from Open-Meteo API (0-99)
 * @returns Emoji string representing the weather condition
 */
const getWeatherEmoji = (code: number): string => {
  if (code === 0) return '☀️';      // Clear sky
  if (code <= 3) return '🌤️';      // Mainly clear, partly cloudy
  if (code <= 48) return '☁️';     // Fog, depositing rime fog
  if (code <= 57) return '🌧️';     // Drizzle
  if (code <= 67) return '🌨️';     // Rain
  if (code <= 77) return '❄️';     // Snow
  if (code <= 82) return '🌧️';     // Rain showers
  return '⛈️';                       // Thunderstorm (83-99)
};

/**
 * Converts a date string to a short day name
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Short day name (Sun, Mon, Tue, etc.)
 */
const getDayName = (dateStr: string): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

/**
 * WeatherWidget - Horizontal scrollable weather forecast display
 * 
 * Features:
 * - Current weather (labeled "Now") + 7-day forecast
 * - Horizontal scrolling with snap-to-item for smooth navigation
 * - Uses free Open-Meteo API (no authentication required)
 * - Default location: Manila, Philippines (14.5995, 120.9842)
 * - Gracefully handles errors (shows nothing if weather fails to load)
 * 
 * API DETAILS:
 * - Endpoint: https://api.open-meteo.com/v1/forecast
 * - Parameters:
 *   - latitude, longitude: Location coordinates
 *   - current: temperature_2m, weather_code
 *   - daily: temperature_2m_max, temperature_2m_min, weather_code
 *   - timezone: auto
 *   - forecast_days: 7
 * 
 * TO BACKEND: You can proxy this API call through your backend to:
 * - Cache results for better performance
 * - Add API key for premium weather services
 * - Customize location based on user preferences
 */
const WeatherWidget: React.FC = () => {
  // Weather data state - null while loading or on error
  const [weather, setWeather] = useState<WeatherData | null>(null);
  // Ref for the horizontal scroll view
  const scrollRef = useRef<ScrollView>(null);

  /**
   * Fetches weather data from the Open-Meteo API
   * Called once on component mount.
   * 
   * @param lat - Latitude coordinate
   * @param lon - Longitude coordinate
   */
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
      );
      const data = await response.json();

      // Transform API response into our WeatherData format
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        emoji: getWeatherEmoji(data.current.weather_code),
        dailyForecast: data.daily.time.map((date: string, i: number) => ({
          day: i === 0 ? 'Today' : getDayName(date),
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          emoji: getWeatherEmoji(data.daily.weather_code[i]),
        })),
      });
    } catch (err) {
      // Silently fail - weather is optional, don't disrupt the app
    }
  };

  // Fetch weather on component mount for Manila, Philippines
  useEffect(() => {
    fetchWeather(14.5995, 120.9842);
  }, []);

  // Don't render anything if weather data isn't available
  if (!weather) return null;

  // Combine current weather with forecast into one scrollable list
  const allItems = [
    { day: 'Now', tempMax: weather.temp, tempMin: weather.temp, emoji: weather.emoji },
    ...weather.dailyForecast,
  ];

  // Width of each forecast item in the scroll view
  const itemWidth = 60;

  return (
    <View style={styles.container}>
      {/* Horizontal scrollable weather strip */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + 16} // Snap to each item for smooth scrolling
        decelerationRate="fast"
        pagingEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Render each weather item (Now + 7 days) */}
        {allItems.map((item, index) => (
          <View key={index} style={[styles.item, { width: itemWidth }]}>
            {/* Day label */}
            <Text style={styles.dayText}>{item.day}</Text>
            {/* Weather emoji */}
            <Text style={styles.emoji}>{item.emoji}</Text>
            {/* Temperature - shows high/low for forecast, single temp for "Now" */}
            <Text style={styles.temp}>
              {item.tempMax}°{index > 0 && <Text style={styles.low}> {item.tempMin}°</Text>}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 28,
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  dayText: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 2,
  },
  emoji: {
    fontSize: 20,
  },
  temp: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginTop: 2,
  },
  low: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '400',
  },
});

export default WeatherWidget;