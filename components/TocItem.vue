import React from 'react';

const TocHighlight = ({ current, children }) => {
  const baseClasses = "transition-all duration-300";
  const activeClasses = current ? "font-bold text-blue-500" : "text-gray-500";
  
  return (
    <div className={`${baseClasses} ${activeClasses}`}>
      {children}
    </div>
  );
};

export default TocHighlight;
