export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: number;
  time: string;
  humidity: number;
  apparentTemperature: number;
  precipitation: number;
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  rainSum: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast;
  hourly: {
    temperature_2m: number[];
    time: string[];
  };
  dailyUnits: {
    temperatureMax: string;
  };
}

export enum WeatherCondition {
  Clear = 'Clear',
  Cloudy = 'Cloudy',
  Rain = 'Rain',
  Snow = 'Snow',
  Thunderstorm = 'Thunderstorm',
  Fog = 'Fog',
  Drizzle = 'Drizzle'
}