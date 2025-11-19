import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-950 w-full">
      <div className="relative w-16 h-16">
        {/* Static Ring - Darker to match theme */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-neutral-900 rounded-full"></div>
        {/* Spinning Arc - Rose */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-600 border-r-rose-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;
