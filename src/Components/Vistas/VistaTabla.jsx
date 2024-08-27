import React from 'react';
import { Link } from 'react-router-dom';

const VistaTabla = ({ filteredLotes, showSector, handleCaptrurarTrazabilidad, isTableView }) => {
    return isTableView ? (
        <div className="w-full rounded-xl">
            <div className='grid sm:grid-cols-12 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-200'>
                {showSector &&
                    <div className='text-left font-medium text-gray-600 sm:block hidden px-2'>
                        Sector
                    </div>
                }
                <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden px-6'>Sub Sector</div>
                <div className='text-left font-medium text-gray-600 sm:block hidden px-2'>Parte</div>
                <div className='text-left font-medium text-gray-600 col-span-1 sm:block hidden px-2'>Elemento</div>
                <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden px-2'>Pk</div>
                <div className='text-left font-medium text-gray-600 col-span-3 sm:block hidden px-2'>Lote y PPI</div>
                <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden px-2'>Progreso inspección</div>
            </div>

            {filteredLotes.sort((a, b) => {
                const avanceA = (a.actividadesAptas || 0) / a.totalSubactividades;
                const avanceB = (b.actividadesAptas || 0) / b.totalSubactividades;
                return avanceB - avanceA;
            }).map((l, i) => (
                <Link to={`/tablaPpi/${l.id}/${l.ppiNombre}`} onClick={() => handleCaptrurarTrazabilidad(l)} key={i}>
                    <div className='w-full grid grid-cols-1 xl:grid-cols-12 gap-1 items-center text-sm cursor-pointer p-5 border border-b-2 font-normal text-gray-600 hover:bg-gray-100'>
                        {showSector &&
                            <div className='w-full xl:col-span-1 flex xl:block gap-2 px-2'>
                                <p className='xl:hidden font-light'>Sector: </p>{l.sectorNombre}</div>}
                        <div className='w-full xl:col-span-2 flex xl:block gap-2 px-2'>
                            <p className='xl:hidden font-light'>Sub sector: </p>{l.subSectorNombre}</div>
                        <div className='w-full xl:col-span-1 flex xl:block gap-2 px-2'>
                            <p className='xl:hidden font-light'>Parte: </p>{l.parteNombre}</div>
                        <div className='w-full xl:col-span-1 flex xl:block gap-2 px-2'>
                            <p className='xl:hidden font-light'>Elemento: </p>{l.elementoNombre}</div>
                        <div className='w-full xl:col-span-2 xl:text-start flex flex-col xl:flex-row xl:justify-start px-2 gap-2'>
                            <div className='w-full xl:w-auto'><p className='font-light'>Pk Inicial: {l.pkInicial || '-'}</p></div>
                            <div className='w-full xl:w-auto'><p className='font-light'>Pk Final: {l.pkFinal || '-'}</p></div>
                        </div>
                        <div className='w-full flex flex-col items-start justify-center xl:col-span-3 px-2'>
                            <div className='flex gap-2 items-center'>
                                <p className='font-medium'>Lote:</p>
                                <p className='font-medium'>{l.nombre}</p>
                            </div>
                            <div className='flex gap-2 mt-1'>
                                <p className='font-medium'>PPI:</p>
                                <p className='font-medium'>{l.ppiNombre}</p>
                            </div>
                        </div>
                        <div className='w-full xl:col-span-2 px-2'>
                            {l.totalSubactividades > 0 ? (
                                <div className='text-start flex flex-col items-start gap-3'>
                                    <div className='font-medium text-gray-600'>
                                        {((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%
                                    </div>
                                    <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '20px', width: '100%' }}>
                                        <div style={{
                                            background: '#d97706',
                                            height: '100%',
                                            borderRadius: '8px',
                                            width: `${((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%`
                                        }} />
                                    </div>
                                    <div>
                                        <p className='font-medium text-green-600'>{`Apto: ${l.actividadesAptas || 0}`}</p>
                                        <p className='font-medium text-red-700'>{`No Apto: ${l.actividadesNoAptas || 0}`}</p>
                                    </div>
                                </div>
                            ) : "Inspección no iniciada"}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLotes.map((l, i) => (
                <Link to={`/tablaPpi/${l.id}/${l.ppiNombre}`} onClick={() => handleCaptrurarTrazabilidad(l)} key={i}>
                    <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                        <h3 className="text-lg font-bold mb-2">{l.nombre}</h3>
                        <p className="text-gray-600">Sector: {l.sectorNombre}</p>
                        <p className="text-gray-600">Subsector: {l.subSectorNombre}</p>
                        <p className="text-gray-600">Parte: {l.parteNombre}</p>
                        <p className="text-gray-600">Elemento: {l.elementoNombre}</p>
                        <p className="text-gray-600">PK: {l.pkInicial || '-'} - {l.pkFinal || '-'}</p>
                        <p className="mt-2 text-gray-600">Aptos: {l.actividadesAptas || 0}</p>
                        <p className="mt-2 text-gray-600">No Aptos: {l.actividadesNoAptas || 0}</p>
                        {l.totalSubactividades > 0 ? (
                            <div className="mt-4">
                                <div className="font-medium text-gray-600">
                                    Progreso: {((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%
                                </div>
                                <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '20px', width: '100%' }}>
                                    <div style={{
                                        background: '#d97706',
                                        height: '100%',
                                        borderRadius: '8px',
                                        width: `${((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%`
                                    }} />
                                </div>
                            </div>
                        ) : <p className="text-gray-500 mt-4">Inspección no iniciada</p>}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default VistaTabla;
