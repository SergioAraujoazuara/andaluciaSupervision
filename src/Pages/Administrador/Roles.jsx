import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase_config';
import { collection, getDocs, query, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { FaArrowAltCircleRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { IoArrowBackCircle } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import imageCompression from 'browser-image-compression';


function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [newRole, setNewRole] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [signatureImage, setSignatureImage] = useState(null);

    const handleImagenChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const options = {
                    maxSizeMB: 0.2,
                    maxWidthOrHeight: 500,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                console.log(`Tamaño del archivo comprimido: ${compressedFile.size} bytes`);

                const reader = new FileReader();
                reader.onload = async () => {
                    const imgElement = document.createElement("img");
                    imgElement.src = reader.result;
                    imgElement.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = imgElement.width;
                        canvas.height = imgElement.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
                        const pngDataUrl = canvas.toDataURL("image/png");
                        setSignatureImage(pngDataUrl); // Almacenar la segunda imagen PNG en el estado
                    };
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Error durante la compresión de la segunda imagen:', error);
            }
        }
    };


    // Cargar todos los usuarios al montar el componente
    useEffect(() => {
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        };

        fetchUsers();

        // Suscribirse a cambios en la colección de usuarios
        const unsubscribe = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
            const updatedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(updatedUsers);
        });

        return () => unsubscribe();
    }, []);

    const handleRoleUpdate = async () => {
        if (!selectedUserId) {
            alert('Seleccione un usuario para actualizar.');
            return;
        }

        const userDocRef = doc(db, 'usuarios', selectedUserId);
        const updates = {
            role: newRole,
        };

        // Si hay una imagen nueva, añádela al documento
        if (signatureImage) updates.signature = signatureImage;

        await updateDoc(userDocRef, updates);
        setNewRole(''); // Reset role selection
        setSignatureImage(''); // Reset image state
        setShowSuccessModal(true);
    };


    // Cerrar el modal de éxito
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/admin'); // Esto navega hacia atrás en la historia
    };

    return (
        <div className="container mx-auto min-h-screen text-gray-500 xl:px-14 py-2">

            <div className='flex gap-2 items-center justify-between bg-white px-5 py-3  text-base'>

                <div className='flex gap-2 items-center'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />


                    <Link to={'/admin'}>
                        <h1 className='font-normal text-gray-500'>Administración</h1>
                    </Link>

                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Roles usuario </h1>
                    </Link>
                </div>


                <div className='flex items-center'>
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

                </div>

            </div>

            <div className='w-full border-b-2 border-gray-200'></div>
            <div className="bg-white p-4 mt-2 text-sm">
                <div className="grid grid-cols-1 xl:grid-cols-6 xl:gap-20 gap-5">
                    <div className='col-span-4'>
                        <h2 className="bg-sky-500 text-white text-lg font-semibold px-4 py-1 rounded-t-lg">Lista de Usuarios</h2>
                        <div className="overflow-y-auto max-h-80 lg:max-h-full rounded-xl">
                            <div className="space-y-4">
                                {users.map((user, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{user.nombre}</h3>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <p className="text-sm text-gray-600">{user.role}</p>
                                        </div>
                                        <div className="flex items-center justify-start mt-2 lg:mt-0">
                                            {user.signature ? (
                                                <img className='w-16' src={user.signature} alt="firma" />
                                            ) : (
                                                <p>Sin firma</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>



                    <div className='xl:col-span-2 col-span-4 w full'>
                        <div className="rounded-md p-4">
                        <h2 className="bg-sky-500 text-white text-lg font-semibold px-4 py-1 rounded-t-lg">Actualizar Roles</h2>
                            <h2 className="text-lg font-semibold mb-4"></h2>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full py-2 px-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                            >
                                <option value="">Seleccione un usuario</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.email}</option>
                                ))}
                            </select>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full py-2 px-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                            >
                                <option value="">Seleccione un rol</option>
                                <option value="invitado">Invitado</option>
                                <option value="usuario">Usuario</option>
                                <option value="admin">Admin</option>
                            </select>

                            <input
                                type="file"
                                onChange={handleImagenChange}
                                accept="image/*"
                                className="w-full py-2 px-3 mb-4 border border-gray-300 rounded-md"
                            />

                            <button
                                onClick={handleRoleUpdate}
                                className="text-white text-sm mt-4 flex items-center gap-3 text-lg font-semibold bg-amber-600 py-2 px-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:bg-amber-700 hover:shadow-lg hover:-translate-y-1"
                            >
                                <span className='text-white text-xl transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>  Guardar
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de éxito */}
            {showSuccessModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium text-gray-900" id="modal-headline">
                                            Éxito
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                El rol del usuario ha sido actualizado correctamente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button onClick={handleCloseSuccessModal} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
