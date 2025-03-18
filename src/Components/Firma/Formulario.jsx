import React, { useState } from "react";
import Firma from "./Firma";

const Formulario = () => {
  const [firma, setFirma] = useState(null);

  const handleSaveFirma = (firmaURL) => {
    setFirma(firmaURL);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Firma enviada:", firma);
  };

  return (
    <div className="p-4 ">
      <h2 className="text-lg font-semibold">Registro de Firma</h2>
      <Firma onSave={handleSaveFirma} />
      <button onClick={handleSubmit} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </div>
  );
};

export default Formulario;
