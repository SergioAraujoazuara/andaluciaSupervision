import React, { useEffect, useState } from 'react';

import { db, storage } from '../../../firebase_config';
import { addDoc, collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Asegúrate de tener esta línea
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import AlertaContrato from './AlertaContrato';


function CrearProyecto() {
    const proyectoNombre = localStorage.getItem('proyectoNombre')




    const [formValues, setFormValues] = useState({
        codigoTpf: '',
        nombre_corto: '',
        nombre_completo: '',
        importe_tpf: '',
        importe_obra: '',
        contratista: '',
        cliente: '',
        logoURL: '',
    });

    // Crear alerta
    const [alertMessage, setAlertMessage] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Asignar el valor directamente al campo correspondiente en formValues
        setFormValues({ ...formValues, [name]: value });
    };




    const handleLogoChange = async (e) => {
        if (e.target.files[0]) {
            const logoFile = e.target.files[0];

            // Subir el archivo a Firebase Storage
            const logoRef = ref(storage, `logos/${formValues.nombre_corto}_${logoFile.name}`);
            await uploadBytes(logoRef, logoFile);

            // Obtener la URL de descarga del archivo almacenado
            const logoURL = await getDownloadURL(logoRef);

            // Leer el archivo como cadena base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;

                // Crear el objeto de datos del proyecto
                const projectData = {
                    uid: formValues.nombre_corto,  // Asignar el ID automático como el valor del campo 'uid'
                    codigoTpf: formValues.codigoTpf,
                    nombre_corto: formValues.nombre_corto.toLowerCase(),
                    nombre_completo: formValues.nombre_completo,
                    importe_tpf: formValues.importe_tpf,
                    importe_obra: formValues.importe_obra,
                    contratista: formValues.contratista,
                    cliente: formValues.cliente,
                    logoURL: logoURL,
                    logoBase64: base64String, // Agregar la cadena base64 al objeto
                };

                // Actualizar el estado con el nuevo objeto de datos del proyecto
                setFormValues({
                    ...formValues,
                    ...projectData,
                });
            };

            reader.readAsDataURL(logoFile);
        }
    };





    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Crear el objeto de datos del proyecto
            const projectData = {
                codigoTpf: formValues.codigoTpf,
                nombre_corto: formValues.nombre_corto.toLowerCase(),
                nombre_completo: formValues.nombre_completo,
                importe_tpf: formValues.importe_tpf,
                importe_obra: formValues.importe_obra,
                contratista: formValues.contratista,
                cliente: formValues.cliente,
                logo: formValues.logoURL,
                logoBase64: formValues.logoBase64,
            };

            // Agregar el documento a la colección 'proyectos' y obtener su ID generado automáticamente
            const projectRef = await addDoc(collection(db, 'proyectos'), projectData);

            // Obtener el ID generado automáticamente
            const projectId = projectRef.id;

            // Agregar el campo 'uid' al objeto de datos del proyecto con el valor del ID generado
            projectData.uid = projectId;

            // Actualizar el estado con el nuevo objeto de datos del proyecto
            setFormValues({
                ...formValues,
                ...projectData,
            });

            setAlertMessage('Proyecto agregado correctamente!');
            setIsAlertOpen(true);
        } catch (error) {
            setAlertMessage('Error al crear el proyecto.');
            setIsAlertOpen(true);
        }
    };




    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>

            {/* Navigation section */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
              
                <Link to={'/Admin'}>
                    <h1 className='font-base text-gray-500 text-amber-600'>Administración</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/crearProyecto'}>
                    <h1 className='font-medium text-amber-600'>Crear proyecto</h1>
                </Link>
                <button className='bg-sky-600 text-white text-base font-medium px-5 py-2 rounded-md shadow-md' style={{ marginLeft: 'auto' }}>{proyectoNombre}</button>
            </div>



            <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                <div className='flex gap-2 items-center'>

                    <h1 className='font-bold text-xl text-gray-500  px-5 '>Crear proyecto</h1>
                </div>

                <div className='border-t-2 w-full p-0 m-0'></div>

                <div class="w-full  mt-5">
                    <form className="px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>

                        <div className='grid sm:grid-cols-4 grid-cols-1 gap-4'>

                       

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Logo <span className='text-amber-500'>*</span></label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="mt-1 p-2 w-full border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Código TPF <span className='text-amber-500'>*</span></label>
                            <input
                                type="text"
                                name="codigoTpf"
                                value={formValues.codigoTpf}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Nombre Corto <span className='text-amber-500'>*</span></label>
                            <input
                                type="text"
                                name="nombre_corto"
                                value={formValues.nombre_corto}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Nombre Completo </label>
                            <input
                                type="text"
                                name="nombre_completo"
                                value={formValues.nombre_completo}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"

                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Importe TPF </label>
                            <input
                                type="text"
                                name="importe_tpf"
                                value={formValues.importe_tpf}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"

                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Importe Obra</label>
                            <input
                                type="text"
                                name="importe_obra"
                                value={formValues.importe_obra}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"

                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Contratista </label>
                            <input
                                type="text"
                                name="contratista"
                                value={formValues.contratista}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"

                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Clientes </label>
                            <input
                                type="text"
                                name="cliente"
                                value={formValues.cliente}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border rounded-md"

                            />
                        </div>

                   

                        <div className="flex items-center justify-between">
                            <button type="submit" className=" bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Guardar</button>
                        </div>

                        </div>
                    </form>

                </div>

             



                    {isAlertOpen && (
                        <AlertaContrato
                            message={alertMessage}
                            closeModal={closeAlert}
                        />
                    )}
                





            </div>







        </div>
    )
}

export default CrearProyecto