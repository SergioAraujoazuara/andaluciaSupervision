import React, { useState } from 'react';
import Groq from "groq-sdk";

const GrocIA = ({loteInfo}) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(''); 

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
        await main(text); // Asegúrate de esperar la respuesta antes de continuar
    };

    return (
    
            <div className=" shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="textarea">
                        Your Text
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
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Submit
                    </button>
                </div>

                {result && ( // Mostrar el resultado si existe
                <div className="mt-4 p-4 bg-white shadow-md rounded">
                    <h2 className="text-xl font-bold mb-2">Resumen</h2>
                    <p>{result}</p>
                </div>
            )}
            </div>
        
    );
};

export default GrocIA;
