import React, { useState } from 'react';
import Groq from "groq-sdk";

const TextareaForm = () => {
    const [text, setText] = useState('');

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Submitted text:', text);
        // Aquí puedes agregar la lógica para manejar el envío del formulario
    };


    ///////////////////////////////// Codigo de configuracion GROQ IA/////////////////////////////////////7
    console.log('hello1')

    const GROQ_API_KEY = "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"
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    var content = "Movimiento de tierras terminado. Problemas con el pedido. "

     async function main(content) {
        const chatCompletion = await getGroqChatCompletion();
        // Print the completion returned by the LLM.
        console.log(chatCompletion.choices[0]?.message?.content || "");
    }
    main()
     async function getGroqChatCompletion() {
        return groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Resume de manera formal el contenido que te muestro a continuación, tiene que ser un resumen. No quiero que añadas información de más: " + content,
                },
            ],
            model: "llama3-8b-8192",
        });
    }
    console.log(getGroqChatCompletion())

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TextareaForm;





