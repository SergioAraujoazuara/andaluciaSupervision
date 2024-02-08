import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";

function FormularioInspeccion() {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedInspectionType, setSelectedInspectionType] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleOptionChangeMultiple = (option) => {
        const selectedIndex = selectedOptions.indexOf(option);
        if (selectedIndex === -1) {
            setSelectedOptions([...selectedOptions, option]);
        } else {
            setSelectedOptions(selectedOptions.filter((item) => item !== option));
        }
    };

    const handleInspectionTypeChange = (option) => {
        const selectedIndex = selectedInspectionType.indexOf(option);
        if (selectedIndex === -1) {
            setSelectedInspectionType([...selectedInspectionType, option]);
        } else {
            setSelectedInspectionType(selectedInspectionType.filter((item) => item !== option));
        }
    };


    return (
        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>

           {/* Navigation section */}
           <div className='flex gap-2 items-center justify start bg-white px-5 py-4 rounded rounded-xl shadow-md text-sm'>
                <GoHomeFill style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-medium text-gray-500 text-amber-600'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='text-gray-500 text-gray-500'>Módulos</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='text-gray-500 text-gray-500'>Elementos</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='font-medium text-amber-600'>Formulario</h1>
                </Link>
            </div>


            <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                <div className='flex gap-2 items-center'>

                    <h1 className='font-bold text-xl text-gray-500 px-5'>Formulario</h1>
                </div>

                <div className='border-t-2 w-full p-0 m-0'></div>

                <div class="w-full rounded rounded-xl">
                    <div className='px-5'>
                        <form>
                            <div className='flex flex-col gap-1 mb-5'>
                                <div>
                                    <div className='font-medium bg-gray-100 rounded-md w-full p-2 my-2'>
                                        <p>Actividad</p>
                                    </div>
                                    <div>
                                        <p>1.1 Inicio de tajo</p>
                                    </div>
                                </div>

                                <div>
                                    <div className='font-medium bg-gray-100 rounded-md w-full p-2 my-4'>
                                        <p>Criterio de Aceptación</p>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <label htmlFor='tajo' className="text-gray-600">El registro de Inicio de tajo para esta actividad se encuentra cumplimentado, firmado y sin incidencias</label>
                                        <input type="checkbox" id="tajo" name="tajo" className="form-checkbox text-sky-500 h-5 w-5" />
                                    </div>
                                </div>

                                <div>
                                    <div className='font-medium bg-gray-100 rounded-md w-full p-2 my-4'>
                                        <p>Documentación de Referencia</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedOptions.includes('Pc')}
                                                onChange={() => handleOptionChangeMultiple('Pc')}
                                            />
                                            <span className="ml-2">Pc</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedOptions.includes('Planos')}
                                                onChange={() => handleOptionChangeMultiple('Planos')}
                                            />
                                            <span className="ml-2">Planos</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedOptions.includes('PPTP')}
                                                onChange={() => handleOptionChangeMultiple('PPTP')}
                                            />
                                            <span className="ml-2">PPTP</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedOptions.includes('EHE')}
                                                onChange={() => handleOptionChangeMultiple('EHE')}
                                            />
                                            <span className="ml-2">EHE</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedOptions.includes('PAC')}
                                                onChange={() => handleOptionChangeMultiple('PAC')}
                                            />
                                            <span className="ml-2">PAC</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <div className='font-medium bg-gray-100 rounded-md w-full p-2 my-4'>
                                        <p>Tipo de inspección</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedInspectionType.includes('Documental')}
                                                onChange={() => handleInspectionTypeChange('Documental')}
                                            />
                                            <span className="ml-2">Documental</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600"
                                                checked={selectedInspectionType.includes('Visual')}
                                                onChange={() => handleInspectionTypeChange('Visual')}
                                            />
                                            <span className="ml-2">Visual</span>
                                        </label>
                                    </div>
                                </div>



                                <div>
                                    <div className='font-medium bg-gray-100 rounded-md w-full p-2 my-4'>
                                        <p>Responsable</p>
                                    </div>
                                    <div>
                                        <select
                                            value={selectedValue}
                                            onChange={handleSelectChange}
                                            className="form-select mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Selecciona una opción...</option>
                                            <option value="Vigilante">Vigilante</option>
                                            <option value="Topógrafo">Topógrafo</option>
                                            <option value="Responsable">Responsable</option>
                                            <option value="Jefe de calidad">Jefe de calidad</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className='font-medium bg-gray-100 rounded-md w-full p-2 my-4'>
                                            <p>Fecha</p>
                                        </div>
                                        <div>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={handleDateChange}
                                                className="form-input mt-1 block w-1/6 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className='mt-8'>
                                        <button className='bg-amber-600 px-5 py-2 text-white font-medium rounded-md'>Enviar</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormularioInspeccion;
