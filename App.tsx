import React, { useEffect, useState } from 'react';
import { fetchWeatherData, getWeatherDescription } from './services/weatherService.ts';
import { WeatherData } from './types.ts';
import WeatherBackground from './components/WeatherBackground.tsx';
import Clock from './components/Clock.tsx';
import { getWeatherIcon } from './components/WeatherIcons.tsx';
import { REFRESH_INTERVAL_MS } from './constants.ts';
import { Wind, CloudRain, Sunrise, Sunset as SunsetIcon, Droplets, Navigation } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  const [showTotalRain, setShowTotalRain] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Global Clock Ticker (Syncs all blinking colons)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    return <div className="h-screen w-screen flex items-center justify-center bg-black text-yellow-500 font-heading text-5xl animate-pulse">LOADING WEATHER...</div>;
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
  
  const nextSunriseLabel = "Next Sunrise";
  const nextSunsetLabel = "Next Sunset";

  // Logic for "Next" events
  if (now < todaySunrise) {
    nextSunriseTime = todaySunrise;
    nextSunsetTime = todaySunset;
  } else if (now < todaySunset) {
    nextSunriseTime = tomorrowSunrise;
    nextSunsetTime = todaySunset;
  } else {
    nextSunriseTime = tomorrowSunrise;
    nextSunsetTime = tomorrowSunset;
  }

  const showColon = currentTime.getSeconds() % 2 === 0;

  // Format time with blinking colon
  const renderTimeWithBlink = (d: Date) => {
    let hours = d.getHours() % 12;
    hours = hours ? hours : 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';

    return (
      <div className="flex items-baseline justify-center">
        <span>{hours.toString().padStart(2, '0')}</span>
        <span className={`${showColon ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 mx-[2px]`}>:</span>
        <span>{minutes}</span>
        <span className="text-3xl font-medium ml-2 text-gray-400">{ampm}</span>
      </div>
    );
  };

  // Shared Glass Style
  const glassCardBase = "bg-black/30 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl hover:bg-black/40 hover:border-[#D4AF37]/60 hover:scale-[1.02] transition-all duration-500 cursor-default group relative overflow-hidden";

  return (
    <div className="relative h-screen w-screen text-white overflow-hidden bg-black font-sans">
      {/* Dynamic Background - Layer 0 */}
      <div className="absolute inset-0 z-0">
        <WeatherBackground 
          weatherCode={current.weatherCode} 
          isDay={!!current.isDay} 
          sunrise={daily.sunrise[0]}
          sunset={daily.sunset[0]}
        />
      </div>

      {/* Main Content Wrapper - Layer 10 */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        
        {/* UPPER SECTION: Header + Hero + Details (Has Padding) */}
        <div className="flex-1 flex flex-col p-8 pb-4 min-h-0">
            
            {/* Header Section */}
            <header className="flex justify-between items-start shrink-0 mb-4 opacity-0-start animate-fade-in-down" style={{ animationDelay: '0ms' }}>
              <div>
                <h1 className="text-[4.5rem] font-bold font-heading text-white tracking-wide drop-shadow-lg leading-none">
                  CHRISTCHURCH
                </h1>
                <h2 className="text-2xl text-[#D4AF37] font-semibold tracking-[0.2em] uppercase opacity-90 pl-1 mt-1">
                  New Zealand
                </h2>
              </div>
              <Clock time={currentTime} />
            </header>

            {/* Hero Section: Temp & Icon */}
            <main className="flex-1 flex flex-col justify-center items-center min-h-0">
              <div 
                className="flex items-center gap-12 transform scale-95 lg:scale-100 transition-transform duration-500 opacity-0-start animate-scale-in"
                style={{ animationDelay: '200ms' }}
              >
                {/* Icon */}
                <div className="w-48 h-48 drop-shadow-[0_0_40px_rgba(255,215,0,0.3)] filter brightness-110 hover:scale-110 transition-transform duration-700 ease-in-out">
                  {getWeatherIcon(current.weatherCode, !!current.isDay, "w-full h-full")}
                </div>
                
                {/* Temp & Status */}
                <div className="flex flex-col group cursor-default">
                  <div className="flex items-baseline transition-transform duration-500 group-hover:scale-105 origin-left">
                    <span className="text-[9rem] font-bold font-heading leading-none drop-shadow-2xl text-white">
                      {Math.round(current.temperature)}
                    </span>
                    <span className="text-[5rem] font-heading font-light text-[#D4AF37] ml-2">°</span>
                  </div>
                  <div className="text-5xl font-medium text-gray-100 tracking-wide drop-shadow-md -mt-2">
                    {getWeatherDescription(current.weatherCode)}
                  </div>
                  <div className="text-3xl text-[#D4AF37] mt-3 font-medium tracking-wider">
                    H: {Math.round(todayMax)}° <span className="mx-3 text-white/40">|</span> L: {Math.round(todayMin)}°
                  </div>
                </div>
              </div>

              {/* Details Row - Consistent Glass Cards */}
              <div className="grid grid-cols-4 gap-6 w-full mt-8 mb-2">
                {/* Box 1: Sunrise */}
                <DetailCard 
                    className={`${glassCardBase} p-4 flex flex-col items-center justify-center`}
                    icon={<Sunrise size={64} className="text-[#D4AF37]" strokeWidth={1.5} />}
                    label={nextSunriseLabel}
                    value={renderTimeWithBlink(nextSunriseTime)}
                    delay={400}
                />
                
                {/* Box 2: Wind (Combined Line) */}
                <DetailCard 
                    className={`${glassCardBase} p-4 flex flex-col items-center justify-center`}
                    icon={<Wind size={64} className="text-[#D4AF37]" strokeWidth={1.5} />}
                    label="Wind"
                    value={
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-baseline">
                          <span>{Math.round(current.windSpeed)}</span>
                          <span className="text-3xl text-gray-400 font-medium ml-2">km/h</span>
                        </div>
                        <div className="flex items-center text-[#D4AF37] ml-2">
                            <Navigation 
                                size={28} 
                                fill="currentColor" 
                                className="transition-transform duration-700 ease-out"
                                style={{ transform: `rotate(${current.windDirection}deg)` }}
                            />
                            <span className="text-4xl font-heading font-bold ml-1">{getWindDirection(current.windDirection)}</span>
                        </div>
                      </div>
                    }
                    delay={500}
                />

                {/* Box 3: Rainfall (Toggling) */}
                <div 
                    className={`${glassCardBase} opacity-0-start animate-fade-in-up h-56 w-full relative`} 
                    style={{ animationDelay: '600ms' }}
                >
                    {/* Rain Last Hour */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out ${showTotalRain ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                        <DetailCardContent 
                            icon={<CloudRain size={64} className="text-[#D4AF37]" strokeWidth={1.5} />}
                            label="Rain (Last Hour)"
                            value={`${current.precipitation}`}
                            unit="mm"
                        />
                    </div>
                    
                    {/* Rain Today */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out ${showTotalRain ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                        <DetailCardContent 
                            icon={<Droplets size={64} className="text-[#D4AF37]" strokeWidth={1.5} />}
                            label="Rain (Today)"
                            value={`${daily.rainSum[0]}`}
                            unit="mm"
                        />
                    </div>
                </div>

                {/* Box 4: Sunset */}
                <DetailCard 
                    className={`${glassCardBase} p-4 flex flex-col items-center justify-center`}
                    icon={<SunsetIcon size={64} className="text-[#D4AF37]" strokeWidth={1.5} />}
                    label={nextSunsetLabel}
                    value={renderTimeWithBlink(nextSunsetTime)}
                    delay={700}
                />
              </div>
            </main>
        </div>

        {/* BOTTOM SECTION: Forecast - Full Width */}
        <section 
          className={`w-full shrink-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 p-2 pb-6 transition-all duration-1000 transform ${showForecast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[50px]'}`}
        >
          <div className="flex justify-between items-center text-center divide-x divide-gray-700/50 px-4 w-full">
            {daily.time.slice(1, 8).map((t, index) => {
              const dailyIndex = index + 1;
              const date = new Date(t);
              const dayName = date.toLocaleDateString('en-NZ', { weekday: 'short' });
              const delay = 900 + (index * 100);

              return (
                <div 
                  key={t} 
                  className={`flex-1 px-1 flex flex-col items-center justify-center group opacity-0-start ${showForecast ? 'animate-fade-in-up' : ''}`}
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <span className="text-xl text-gray-400 font-bold mb-2 uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors duration-300">{dayName}</span>
                  <div className="w-16 h-16 my-1 drop-shadow-md transform group-hover:scale-125 transition-transform duration-300 ease-out">
                    {getWeatherIcon(daily.weatherCode[dailyIndex], true, "w-full h-full")}
                  </div>
                  <div className="flex space-x-2 mt-1 font-heading text-2xl group-hover:scale-110 transition-transform duration-300">
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

// Reusable DetailCard
const DetailCard: React.FC<{
  className?: string, 
  icon: React.ReactNode, 
  label: string, 
  value: React.ReactNode, 
  unit?: string, 
  subValue?: React.ReactNode, 
  delay: number
}> = ({ className, icon, label, value, unit, subValue, delay }) => (
  <div 
    className={`${className} opacity-0-start animate-fade-in-up h-56 w-full`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <DetailCardContent icon={icon} label={label} value={value} unit={unit} subValue={subValue} />
  </div>
);

// Inner Content
const DetailCardContent: React.FC<{
  icon: React.ReactNode, 
  label: string, 
  value: React.ReactNode, 
  unit?: string, 
  subValue?: React.ReactNode
}> = ({ icon, label, value, unit, subValue }) => (
    <div className="w-full flex flex-col items-center justify-center">
        <div className="mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <div className="text-gray-300 text-lg font-bold tracking-[0.15em] uppercase mb-0.5 w-full truncate px-2 text-center group-hover:text-white transition-colors">{label}</div>
        <div className="flex items-baseline justify-center gap-1">
            <div className="text-6xl font-heading font-bold text-white tracking-tight drop-shadow-md">{value}</div>
            {unit && <div className="text-3xl text-gray-400 font-medium pt-3">{unit}</div>}
        </div>
        {subValue && (typeof subValue === 'string' ? (
             <div className="text-[#D4AF37] text-3xl font-bold mt-1 tracking-wide drop-shadow-sm">{subValue}</div>
        ) : subValue)}
    </div>
);

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export default App;