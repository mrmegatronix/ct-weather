import { WeatherData } from '../types.ts';
import { CHRISTCHURCH_COORDS } from '../constants.ts';

export const fetchWeatherData = async (): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: CHRISTCHURCH_COORDS.lat.toString(),
    longitude: CHRISTCHURCH_COORDS.lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'rain_sum'
    ].join(','),
    hourly: 'temperature_2m',
    timezone: 'Pacific/Auckland',
    forecast_days: '8' // 1 current + 7 future
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch weather data: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day,
      time: data.current.time,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
    },
    daily: {
      time: data.daily.time,
      weatherCode: data.daily.weather_code,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      uvIndexMax: data.daily.uv_index_max,
      rainSum: data.daily.rain_sum,
    },
    hourly: data.hourly,
    dailyUnits: {
      temperatureMax: data.daily_units.temperature_2m_max,
    }
  };
};

export const getWeatherDescription = (code: number): string => {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Foggy';
    case 51: case 53: case 55: return 'Drizzle';
    case 56: case 57: return 'Freezing Drizzle';
    case 61: case 63: return 'Rain';
    case 65: return 'Heavy Rain';
    case 66: case 67: return 'Freezing Rain';
    case 71: case 73: case 75: return 'Snow Fall';
    case 77: return 'Snow Grains';
    case 80: case 81: case 82: return 'Rain Showers';
    case 85: case 86: return 'Snow Showers';
    case 95: return 'Thunderstorm';
    case 96: case 99: return 'Thunderstorm & Hail';
    default: return 'Unknown';
  }
};