import React from 'react';

const PowerBiCard = ({ title, value, messagge }) => {
  return (
    <div className="flex flex-col justify-center items-center text-center w-60 h-26 items-center bg-gray-200 
    rounded-lg shadow-lg p-4">
      <div className="text-sm font-semibold text-gray-600 mb-2">
        {title}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>
      <div className="text-md font-light text-gray-600">
        {messagge}
      </div>
    </div>
  );
};

export default PowerBiCard;
