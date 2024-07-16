import React, { useState } from 'react';
import Groq from "groq-sdk";
import { FaCopy } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { BsStars } from "react-icons/bs";
const GrocIA = ({ loteInfo, setInputGroc, setLocalObservaciones }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [copySuccess, setCopySuccess] = useState(false); // Estado para el mensaje de confirmación

    const handleChange = (event) => {
        setText(event.target.value);
    };

    // Código de configuración GROQ IA
    const GROQ_API_KEY = import.meta.env.VITE_API_KEY;
    const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

    // Variable que debe conectar con el input del front
    const main = async (content) => {
        try {
            const chatCompletion = await getGroqChatCompletion(content);
            setResult(chatCompletion.choices[0]?.message?.content || "");
        } catch (error) {
            console.error("Error getting completion:", error);
        }
    };

    async function getGroqChatCompletion(content) {
        return groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Resume de manera breve y natural como si fueras un supervisor de obra, no comienzes el mensaje con saludos ni explicaiones, el contenido que te muestro a continuación, no mencionar datos sensibles de ID. Utiliza los datos de este objeto: ${JSON.stringify(loteInfo)} y la descripción del mensaje en el input: ${content}`,
                },
            ],
            model: "llama3-8b-8192",
        });
    }

    const handleClick = async () => {
        await main(text);
        setText(''); // Asegúrate de esperar la respuesta antes de continuar
    };

    const handleCopytext = () => {
        setLocalObservaciones(result);
        setCopySuccess(true); // Mostrar el mensaje de confirmación

        setTimeout(() => {
            setCopySuccess(false); // Ocultar el mensaje de confirmación
            setInputGroc(false); // Cerrar el modal
        }, 1000);
    };

    const handleCloseResult = () => {
        setResult('');
        setInputGroc(false);
    };

    return (
        <div className="bg-gray-200 shadow-md rounded px-4 py-4 mb-4 rounded-lg">
            <div className="mb-2">
                <label className="text-sm font-bold mb-2 flex gap-2 items-center text-gray-500" htmlFor="textarea">
                    <BsStars/>Escribe tu mensaje (IA)
                </label>
                <textarea
                    id="textarea"
                    value={text}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="5"
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    type="button" // Cambiado a button con type="button"
                    onClick={handleClick} // Añadir la función handleClick
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Crear
                </button>
            </div>

            {result && (
                <div>
                    <div className="mt-4 p-4 bg-white shadow-md rounded text-gray-500 rounded-lg">
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className="text-lg font-medium mb-2">Resumen</h2>
                            <div className='flex gap-5 items-center'>
                                <div className="relative">
                                    <FaCopy className='text-gray-400 text-lg cursor-pointer' onClick={handleCopytext} />
                                    {copySuccess && (
                                        <div className="absolute top-0 left-8 bg-green-100 text-green-500 text-sm px-2 py-1 rounded-md shadow-md">
                                            ¡Copiado!
                                        </div>
                                    )}
                                </div>
                                <IoCloseCircle className='text-gray-400 text-xl cursor-pointer' onClick={handleCloseResult} />
                            </div>
                        </div>
                        <p>{result}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrocIA;
