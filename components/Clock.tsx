import React from 'react';

interface ClockProps {
  time: Date;
}

const Clock: React.FC<ClockProps> = ({ time }) => {
  // Robust time formatting manually to ensure 2-digits
  let hoursRaw = time.getHours();
  const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
  hoursRaw = hoursRaw % 12;
  hoursRaw = hoursRaw ? hoursRaw : 12; // the hour '0' should be '12'
  const hours = hoursRaw.toString().padStart(2, '0');
  
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  // Colon visibility is now derived from the passed time prop, ensuring sync with other colons
  const showColon = time.getSeconds() % 2 === 0;

  return (
    <div className="flex flex-col items-end">
      <div className="text-[5rem] font-bold font-heading text-white tracking-wider leading-none flex items-baseline">
        <span>{hours}</span>
        <span className={`mx-1 transition-opacity duration-200 ${showColon ? 'opacity-100' : 'opacity-0'}`}>:</span>
        <span>{minutes}</span>
        <span className="text-4xl text-yellow-500 ml-4">{ampm}</span>
      </div>
      <div className="text-3xl text-gray-400 font-light mt-2">
        {time.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  );
};

export default Clock;