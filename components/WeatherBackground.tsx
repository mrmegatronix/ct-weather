import React, { useEffect, useRef } from 'react';

interface WeatherBackgroundProps {
  weatherCode: number;
  isDay: boolean;
  sunrise?: string;
  sunset?: string;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherCode, isDay, sunrise, sunset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let stars: any[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Determine type of effect
    const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
    const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
    const isCloudy = weatherCode === 2 || weatherCode === 3 || weatherCode === 45;
    const isClearNight = !isDay && (weatherCode === 0 || weatherCode === 1);

    // Init Weather Particles
    const initParticles = () => {
      particles = [];
      const particleCount = isRain ? 800 : isSnow ? 400 : 0;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: Math.random() * 5 + 2,
          length: Math.random() * 20 + 10,
          opacity: Math.random() * 0.5 + 0.1,
          size: Math.random() * 3,
        });
      }
    };

    // Init Stars (only for night)
    const initStars = () => {
        stars = [];
        if (!isDay) {
            for(let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.7, // Keep stars mostly in upper sky
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random(),
                    twinkleSpeed: Math.random() * 0.02 + 0.005
                });
            }
        }
    };

    initParticles();
    initStars();

    const drawCelestialBody = () => {
       if (!sunrise || !sunset) return;

       const now = new Date().getTime();
       const sunriseTime = new Date(sunrise).getTime();
       const sunsetTime = new Date(sunset).getTime();
       
       let percent = 0; // 0 = Left (Start), 1 = Right (End)
       
       if (isDay) {
         // Day: 0% at sunrise, 100% at sunset
         percent = (now - sunriseTime) / (sunsetTime - sunriseTime);
       } else {
         // Night Logic
         const msInDay = 86400000;
         if (now > sunsetTime) {
             // Evening Night: sunset (0%) to midnight
             const progressIntoNight = now - sunsetTime;
             // Assume night is approx 12 hours for visual placement
             percent = progressIntoNight / (msInDay / 2); 
         } else {
             // Morning Night: midnight to sunrise (100%)
             const timeUntilSunrise = sunriseTime - now;
             percent = 1 - (timeUntilSunrise / (msInDay / 2));
         }
       }

       // Clamp and buffer
       // We want the sun/moon to travel from say 10% width to 90% width
       // So map percent 0..1 to 0.1..0.9
       const renderPercent = 0.1 + (Math.max(0, Math.min(1, percent)) * 0.8);

       const x = width * renderPercent;
       // Arc: High noon is highest (lowest Y value)
       // Use sine wave based on percent (0 to 1 -> 0 to PI)
       const y = (height * 0.6) - Math.sin(Math.max(0, Math.min(1, percent)) * Math.PI) * (height * 0.4);

       ctx.save();
       
       if (isDay) {
          // NEST HUB STYLE SUN: Soft, glowing, large
          const sunRadius = 70;
          
          // Large ambient glow
          const glow = ctx.createRadialGradient(x, y, sunRadius, x, y, sunRadius * 6);
          glow.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
          glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
          glow.addColorStop(1, 'rgba(255, 150, 50, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, sunRadius * 6, 0, Math.PI * 2);
          ctx.fill();

          // Core Sun
          const core = ctx.createRadialGradient(x, y, 0, x, y, sunRadius);
          core.addColorStop(0, '#FFFFFF');
          core.addColorStop(0.3, '#FFFACD');
          core.addColorStop(1, '#FFD700');
          ctx.fillStyle = core;
          ctx.shadowColor = '#FFA500';
          ctx.shadowBlur = 50;
          ctx.beginPath();
          ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
          ctx.fill();
       } else {
          // NEST HUB STYLE MOON: Crisp, soft glow
          const moonRadius = 50;
          
          // Moon Glow
          const glow = ctx.createRadialGradient(x, y, moonRadius, x, y, moonRadius * 4);
          glow.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
          glow.addColorStop(1, 'rgba(200, 220, 255, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, moonRadius * 4, 0, Math.PI * 2);
          ctx.fill();

          // Moon Body
          ctx.fillStyle = '#F0F4F8';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
          ctx.fill();
       }
       ctx.restore();
    };

    const drawBackground = () => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        
        if (isDay) {
            if (isCloudy || isRain) {
                // Stormy Grey/Blue
                gradient.addColorStop(0, '#3a4b5c');
                gradient.addColorStop(1, '#6a7b8c');
            } else {
                // Google Nest Hub Day: Rich Blue to Cyan/Orange
                gradient.addColorStop(0, '#1565C0'); // Deep Blue top
                gradient.addColorStop(0.5, '#42A5F5'); // Mid Blue
                gradient.addColorStop(1, '#90CAF9'); // Light Blue horizon
            }
        } else {
             // Google Nest Hub Night: Deep Indigo to Purple/Black
            gradient.addColorStop(0, '#0D1117'); // Almost black top
            gradient.addColorStop(0.4, '#1A237E'); // Deep Indigo
            gradient.addColorStop(1, '#311B92'); // Deep Purple horizon
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    const drawStars = () => {
        if (isDay) return;
        
        stars.forEach(star => {
            ctx.globalAlpha = Math.abs(Math.sin(Date.now() * star.twinkleSpeed + star.x));
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    };

    const drawParticles = () => {
         particles.forEach((p) => {
            ctx.beginPath();
            if (isRain) {
                ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y + p.length);
                ctx.stroke();
                
                p.y += p.speed * 4;
                if (p.y > height) p.y = -p.length;
            } else if (isSnow) {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                p.y += p.speed / 2;
                p.x += Math.sin(p.y / 50) * 0.5;
                if (p.y > height) p.y = -5;
            }
        });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawBackground();
      drawStars(); // Stars behind sun/moon or just generally in background
      drawCelestialBody();
      drawParticles(); // Weather on top

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weatherCode, isDay, sunrise, sunset]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
};

export default WeatherBackground;