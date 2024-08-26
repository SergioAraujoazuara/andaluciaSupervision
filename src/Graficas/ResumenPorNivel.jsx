import React from 'react';

const ResumenPorNivel = ({ nivel, titulo, uniqueValues, calcularProgresoPorNivel, contarAptos, contarNoAptos }) => {
    return (
        <div className="w-full mb-8">
            {/* <h3 className="w-full bg-sky-600 text-white text-lg font-semibold px-4 py-2 rounded-t-lg">{titulo}</h3> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {uniqueValues[nivel].map((valor, index) => {
                    const progreso = calcularProgresoPorNivel(`${nivel}Nombre`, valor);

                    return (
                        <div key={index} className="bg-gray-200 border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-md font-semibold text-gray-00">{valor}</span>
                                <div className="relative w-10 h-10">
                                    <svg viewBox="0 0 36 36" className="w-full h-full">
                                        <path
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831"
                                            fill="none"
                                            stroke="#34d399"
                                            strokeWidth="4"
                                            strokeDasharray={`${progreso}, 100`}
                                        />
                                        <text x="18" y="20.35" className="text-xs" fill="#333" textAnchor="middle" dominantBaseline="middle">
                                            {progreso}%
                                        </text>
                                    </svg>
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-green-600">Aptos:</span>
                                    <span>{contarAptos(`${nivel}Nombre`, valor)}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-red-600">No Aptos:</span>
                                    <span>{contarNoAptos(`${nivel}Nombre`, valor)}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-300 h-2 rounded-full">
                                    <div
                                        className="bg-sky-600 h-2 rounded-full"
                                        style={{
                                            width: `${progreso}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResumenPorNivel;
