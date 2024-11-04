import React from 'react'
import emailjs from 'emailjs-com';

function SendMail() {
    const sendEmail = () => {
        emailjs.send(
          VITE_SENDEMAIL_SERVICE_ID,     // Coloca aquí tu Service ID
          VITE_SENDEMAIL_TEMPLATE_ID,    // Coloca aquí tu Template ID
          {
            from_name: 'TPF ingenieria | App inspección',
            to_name: 'Nombre de usuario',
            to_email: 'tpfingenieriaspain@gmail.com',   // Email dinámico del destinatario
            message: 'Se ha generado un informe pdf, ya puedes consultarlo en la app',
          },
          VITE_SENDEMAIL_PUBLIC_KEY      // Coloca aquí tu Public Key
        )
        .then((result) => {
          console.log('Correo enviado con éxito', result.status, result.text);
        })
        .catch((error) => {
          console.error('Error al enviar el correo', error);
        });
      };


    return (
        <div>
            <p>SendMail</p>
            <button className='bg-amber-400 p-4' onClick={sendEmail}>Envar</button>
        </div>
    )
}

export default SendMail
