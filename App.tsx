import React, { useEffect, useState } from 'react';
import { fetchWeatherData, getWeatherDescription } from './services/weatherService';
import { WeatherData } from './types';
import WeatherBackground from './components/WeatherBackground';
import Clock from './components/Clock';
import { getWeatherIcon } from './components/WeatherIcons';
import { REFRESH_INTERVAL_MS } from './constants';
import { Wind, CloudRain, Sunrise, Sunset as SunsetIcon, Droplets } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  const [showTotalRain, setShowTotalRain] = useState(false);

  const loadData = async () => {
    try {
      const weather = await fetchWeatherData();
      setData(weather);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load weather data", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Toggle Rain Display every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTotalRain(prev => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => setShowForecast(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (loading || !data) {
    return <div className="h-screen w-screen flex items-center justify-center bg-black text-yellow-500 font-heading text-5xl">LOADING WEATHER...</div>;
  }

  const { current, daily } = data;
  const todayMax = daily.temperatureMax[0];
  const todayMin = daily.temperatureMin[0];
  
  // Date Logic
  const now = new Date();
  const todaySunrise = new Date(daily.sunrise[0]);
  const todaySunset = new Date(daily.sunset[0]);
  const tomorrowSunrise = new Date(daily.sunrise[1]);
  const tomorrowSunset = new Date(daily.sunset[1]);

  let nextSunriseTime: Date;
  let nextSunsetTime: Date;
  let nextSunriseLabel = "Sunrise Today";
  let nextSunsetLabel = "Sunset Today";

  // Logic for "Next" events
  if (now < todaySunrise) {
    // Before dawn
    nextSunriseTime = todaySunrise;
    nextSunsetTime = todaySunset;
  } else if (now < todaySunset) {
    // During the day
    nextSunriseTime = tomorrowSunrise; // Next sunrise is tomorrow
    nextSunriseLabel = "Sunrise Tmrw";
    nextSunsetTime = todaySunset;      // Next sunset is today
  } else {
    // After sunset (Night)
    nextSunriseTime = tomorrowSunrise;
    nextSunsetTime = tomorrowSunset;   // Next sunset is tomorrow
    nextSunriseLabel = "Sunrise Tmrw";
    nextSunsetLabel = "Sunset Tmrw";
  }

  const formatTimeShort = (d: Date) => d.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="relative h-screen w-screen text-white overflow-hidden bg-black">
      {/* Dynamic Background - Layer 0 */}
      <div className="absolute inset-0 z-0">
        <WeatherBackground 
          weatherCode={current.weatherCode} 
          isDay={!!current.isDay} 
          sunrise={daily.sunrise[0]}
          sunset={daily.sunset[0]}
        />
      </div>

      {/* Main Content - Layer 10 */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 pb-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-start animate-fade-in-down shrink-0">
          <div>
            <h1 className="text-[4.5rem] font-bold font-heading text-white tracking-wide drop-shadow-lg leading-none">
              CHRISTCHURCH
            </h1>
            <h2 className="text-3xl text-[#D4AF37] font-semibold tracking-[0.2em] uppercase opacity-90 pl-1 mt-1">
              New Zealand
            </h2>
          </div>
          <Clock />
        </header>

        {/* Hero Section: Temp & Icon */}
        <main className="flex-1 flex flex-col justify-center items-center gap-6 -mt-4">
          <div className="flex items-center gap-16 transform scale-100 transition-transform duration-500">
             {/* Icon */}
            <div className="w-56 h-56 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] filter brightness-110">
              {getWeatherIcon(current.weatherCode, !!current.isDay, "w-full h-full")}
            </div>
            
            {/* Temp & Status */}
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-[10rem] font-bold font-heading leading-none drop-shadow-2xl text-white">
                  {Math.round(current.temperature)}
                </span>
                <span className="text-[6rem] font-heading font-light text-[#D4AF37] ml-2">°</span>
              </div>
              <div className="text-6xl font-medium text-gray-100 tracking-wide drop-shadow-md -mt-2">
                {getWeatherDescription(current.weatherCode)}
              </div>
              <div className="text-4xl text-[#D4AF37] mt-3 font-medium tracking-wider">
                H: {Math.round(todayMax)}° <span className="mx-4 text-white/40">|</span> L: {Math.round(todayMin)}°
              </div>
            </div>
          </div>

          {/* Details Row - Improved Readability & Transparency */}
          <div className="grid grid-cols-4 gap-8 w-full max-w-[95vw] mt-4">
             {/* Box 1: Sunrise */}
             <DetailCard 
                icon={<Sunrise size={64} className="text-[#D4AF37]" />}
                label={nextSunriseLabel}
                value={formatTimeShort(nextSunriseTime)}
             />
             
             {/* Box 2: Wind */}
             <DetailCard 
                icon={<Wind size={64} className="text-[#D4AF37]" />}
                label="Wind"
                value={`${Math.round(current.windSpeed)}`}
                unit="km/h"
                subValue={getWindDirection(current.windDirection)}
             />

             {/* Box 3: Rainfall (Toggling) */}
             <div className="relative h-64 w-full">
                <div className={`absolute inset-0 transition-opacity duration-1000 ${showTotalRain ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <DetailCard 
                        icon={<CloudRain size={64} className="text-[#D4AF37]" />}
                        label="Rain (Last Hour)"
                        value={`${current.precipitation}`}
                        unit="mm"
                    />
                </div>
                <div className={`absolute inset-0 transition-opacity duration-1000 ${showTotalRain ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     <DetailCard 
                        icon={<Droplets size={64} className="text-[#D4AF37]" />}
                        label="Rain (Today)"
                        value={`${daily.rainSum[0]}`}
                        unit="mm"
                    />
                </div>
             </div>

             {/* Box 4: Sunset */}
             <DetailCard 
                icon={<SunsetIcon size={64} className="text-[#D4AF37]" />}
                label={nextSunsetLabel}
                value={formatTimeShort(nextSunsetTime)}
             />
          </div>
        </main>

        {/* Forecast Section */}
        <section 
          className={`shrink-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 p-6 transition-all duration-1000 transform ${showForecast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[50px]'}`}
        >
          <div className="flex justify-between items-center text-center divide-x divide-gray-700/50">
            {daily.time.slice(1, 8).map((t, index) => {
              const dailyIndex = index + 1;
              const date = new Date(t);
              const dayName = date.toLocaleDateString('en-NZ', { weekday: 'short' });
              
              return (
                <div key={t} className="flex-1 px-2 flex flex-col items-center justify-center group">
                  <span className="text-2xl text-gray-400 font-bold mb-3 uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">{dayName}</span>
                  <div className="w-16 h-16 my-2 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
                    {getWeatherIcon(daily.weatherCode[dailyIndex], true, "w-full h-full")}
                  </div>
                  <div className="flex space-x-3 mt-2 font-heading text-3xl">
                    <span className="text-white font-bold">{Math.round(daily.temperatureMax[dailyIndex])}°</span>
                    <span className="text-gray-500">{Math.round(daily.temperatureMin[dailyIndex])}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
      
      {/* Time Progress Bar */}
      <div className="absolute bottom-0 left-0 h-3 bg-[#D4AF37] shadow-[0_0_25px_#D4AF37] animate-progress z-50 w-full" />
    </div>
  );
};

// Helper Components
const DetailCard: React.FC<{icon: React.ReactNode, label: string, value: string, unit?: string, subValue?: string}> = ({ icon, label, value, unit, subValue }) => (
  <div className="bg-black/30 border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center text-center backdrop-blur-sm h-64 w-full">
    <div className="mb-4 p-4 bg-white/5 rounded-full border border-white/5 shadow-inner">
      {icon}
    </div>
    <div className="text-gray-300 text-xl font-bold tracking-[0.15em] uppercase mb-1 w-full truncate px-2">{label}</div>
    <div className="flex items-baseline justify-center gap-2">
        <div className="text-6xl font-heading font-bold text-white tracking-tight drop-shadow-md">{value}</div>
        {unit && <div className="text-3xl text-gray-400 font-medium pt-2">{unit}</div>}
    </div>
    {subValue && <div className="text-[#D4AF37] text-3xl font-bold mt-2 tracking-wide drop-shadow-sm">{subValue}</div>}
  </div>
);

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export default App;