import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface WeatherData {
  temp: number;
  emoji: string;
  dailyForecast: { day: string; tempMax: number; tempMin: number; emoji: string }[];
}

const getWeatherEmoji = (code: number): string => {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤️';
  if (code <= 48) return '☁️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌨️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  return '⛈️';
};

const getDayName = (dateStr: string): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
      );
      const data = await response.json();

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
      // Silently fail
    }
  };

  useEffect(() => {
    fetchWeather(14.5995, 120.9842);
  }, []);

  if (!weather) return null;

  const allItems = [
    { day: 'Now', tempMax: weather.temp, tempMin: weather.temp, emoji: weather.emoji },
    ...weather.dailyForecast,
  ];

  const itemWidth = 60;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + 16}
        decelerationRate="fast"
        pagingEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allItems.map((item, index) => (
          <View key={index} style={[styles.item, { width: itemWidth }]}>
            <Text style={styles.dayText}>{item.day}</Text>
            <Text style={styles.emoji}>{item.emoji}</Text>
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