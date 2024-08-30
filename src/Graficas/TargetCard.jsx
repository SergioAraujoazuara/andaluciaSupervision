import React from 'react';
import { FaSitemap } from "react-icons/fa6";
import { FaCalendarCheck } from "react-icons/fa6";
import { FaRegCheckCircle } from "react-icons/fa";

const TargetCard = ({ title, value, message }) => {
  
  return (
    <div className="flex flex-col justify-center items-center text-center px-8 py-4 bg-gray-200
    rounded-lg shadow-lg">
      <div className="text-sm font-semibold text-gray-600 flex items-center gap-2">
        <span>
          {title == "Items inspeccionados:" ? (
            <FaSitemap />
          ) : (
            ""
          )}

          {title == "Inspecciones finalizadas:" ? (
            <FaCalendarCheck />
          ) : (
            ""
          )}
          {title == "Inspecciones iniciadas:" ? (
            <FaRegCheckCircle />
          ) : (
            ""
          )}
        </span>

        <span>{title}</span>
        

        {value}
      </div>
      <div className="text-2xl font-bold text-gray-900">

      </div>
      <div className="text-md font-light text-gray-600  text-sm mt-2">
        {message}
      </div>
    </div>
  );
};

export default TargetCard;
