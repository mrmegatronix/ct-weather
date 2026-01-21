import React from 'react';

interface IconProps {
  className?: string;
  isDay?: boolean;
}

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} animate-spin-slow overflow-visible`} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" fill="#D4AF37" fillOpacity="0.2" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} animate-float overflow-visible`} viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#E5E7EB" fillOpacity="0.2" />
  </svg>
);

export const CloudIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} animate-float overflow-visible`} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#9CA3AF" fillOpacity="0.2" />
  </svg>
);

export const RainIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14l-2.5 2.5" className="animate-rain" style={{ animationDelay: '0s' }} />
    <path d="M14 15l-2.5 2.5" className="animate-rain" style={{ animationDelay: '0.4s' }} />
    <path d="M9 14l-2.5 2.5" className="animate-rain" style={{ animationDelay: '0.8s' }} />
    <path d="M17.4 8.6A7 7 0 1 0 5 15h13.4" stroke="#9CA3AF" className="animate-float" />
  </svg>
);

export const SnowIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g className="animate-float-sway">
      <path d="M10 14l-2 2" />
      <path d="M14 14l2 2" />
      <path d="M12 16v4" />
      <path d="M12 4v4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <path d="M19.07 4.93l-2.83 2.83" />
      <path d="M7.76 16.24l-2.83 2.83" />
      <path d="M16 10h4" />
      <path d="M4 10h4" />
    </g>
  </svg>
);

export const ThunderIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g className="animate-float">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FBBF24" fillOpacity="0.4" className="animate-flash" />
    </g>
  </svg>
);

export const getWeatherIcon = (code: number, isDay: boolean, className: string) => {
  const icon = (() => {
    // Codes mapping based on Open-Meteo WMO codes
    if (code === 0 || code === 1) {
      return isDay ? <SunIcon className={className} /> : <MoonIcon className={className} />;
    }
    if (code === 2 || code === 3) {
      return <CloudIcon className={className} />;
    }
    if (code >= 45 && code <= 48) {
      return <CloudIcon className={`${className} opacity-50`} />; // Fog
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return <RainIcon className={className} />;
    }
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return <SnowIcon className={className} />;
    }
    if (code >= 95) {
      return <ThunderIcon className={className} />;
    }
    return <CloudIcon className={className} />;
  })();

  return icon;
};