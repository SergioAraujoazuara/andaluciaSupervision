import { collection, doc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../../firebase_config";


const collectionRef = collection(db, "opcionesFormulario");

/**
 * Fetches fields from Firebase.
 * If there are no documents in the collection, creates a new document with an empty array of fields.
 * 
 * @returns {Object} - An object containing the fields (`campos`) and the document ID (`docId`).
 */
export const fetchCampos = async () => {
  try {
    const querySnapshot = await getDocs(collectionRef);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { campos: doc.data().campos || [], docId: doc.id };
    } else {
      const docRef = await addDoc(collectionRef, { campos: [] });
      return { campos: [], docId: docRef.id };
    }
  } catch (error) {
    console.error("Error al cargar los campos:", error);
    return { campos: [], docId: null };
  }
};

/**
 * Adds a new field to the Firebase collection.
 * The field can have a type (default is "dropdown") and an empty array of values.
 * 
 * @param {string} docId - The ID of the document where the fields are stored.
 * @param {Array} campos - Current list of fields.
 * @param {string} nuevoCampo - Name of the new field.
 * @param {string} [tipo="dropdown"] - Type of the field.
 * @returns {Array} - Updated list of fields.
 * @throws {Error} - If an error occurs while updating the document in Firebase.
 */
export const addCampo = async (docId, campos, nuevoCampo, tipo) => {
  const nuevoObjetoCampo = {
    id: uuidv4(),
    nombre: nuevoCampo,
    tipo: tipo || "desplegable", // Si no se especifica, asumimos que es un desplegable
    valores: tipo === "desplegable" ? [] : [], // Inicializamos `valores` como array vacío
  };

  const nuevosCampos = [...campos, nuevoObjetoCampo];

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al agregar el campo: ${error.message}`);
  }
};


/**
 * Adds a new value to an existing field in Firebase.
 * Ensures the value is not duplicated before adding it.
 * 
 * @param {string} docId - The ID of the document where the fields are stored.
 * @param {Array} campos - Current list of fields.
 * @param {string} campoSeleccionado - ID of the field to which the value will be added.
 * @param {string} valorCampo - Value to be added.
 * @returns {Array} - Updated list of fields.
 * @throws {Error} - If the selected field does not exist or if an error occurs while updating the document.
 */
export const addValor = async (docId, campos, campoSeleccionado, valorCampo) => {
  const campoSeleccionadoObj = campos.find((campo) => campo.id === campoSeleccionado);

  if (!campoSeleccionadoObj) throw new Error("El campo seleccionado no existe.");
  if (campoSeleccionadoObj.valores.some((v) => v.valor.toLowerCase() === valorCampo.toLowerCase())) {
    throw new Error("El valor ya existe en este campo.");
  }

  const nuevoValor = { id: uuidv4(), valor: valorCampo };
  const nuevosValores = [...campoSeleccionadoObj.valores, nuevoValor];
  const nuevosCampos = campos.map((campo) =>
    campo.id === campoSeleccionado ? { ...campo, valores: nuevosValores } : campo
  );

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al agregar el valor: ${error.message}`);
  }
};

/**
 * Deletes a field from Firebase.
 * Removes the field from the current list of fields and updates the document.
 * 
 * @param {string} docId - The ID of the document where the fields are stored.
 * @param {Array} campos - Current list of fields.
 * @param {string} campoId - ID of the field to be deleted.
 * @returns {Array} - Updated list of fields.
 * @throws {Error} - If an error occurs while updating the document in Firebase.
 */
export const deleteCampo = async (docId, campos, campoId) => {
  const nuevosCampos = campos.filter((campo) => campo.id !== campoId);

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al eliminar el campo: ${error.message}`);
  }
};

// Eliminar un valor de un campo
export const deleteValor = async (docId, campos, campoId, valorId) => {
  const nuevosCampos = campos.map((campo) =>
    campo.id === campoId
      ? { ...campo, valores: campo.valores.filter((valor) => valor.id !== valorId) }
      : campo
  );

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al eliminar el valor: ${error.message}`);
  }
};

/**
 * Updates the name or type of a field in Firebase.
 * Modifies the specified field and updates the document.
 * 
 * @param {string} docId - The ID of the document where the fields are stored.
 * @param {Array} campos - Current list of fields.
 * @param {string} campoId - ID of the field to be updated.
 * @param {string} nombreEditado - New name for the field.
 * @param {string} tipoEditado - New type for the field.
 * @returns {Array} - Updated list of fields.
 * @throws {Error} - If an error occurs while updating the document in Firebase.
 */
export const updateCampo = async (docId, campos, campoId, nombreEditado, tipoEditado) => {
  const nuevosCampos = campos.map((campo) =>
    campo.id === campoId
      ? { ...campo, nombre: nombreEditado, tipo: tipoEditado || campo.tipo }
      : campo
  );

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al actualizar el campo: ${error.message}`);
  }
};


/**
 * Updates the value of a field in Firebase.
 * Modifies the specified value and updates the document.
 * 
 * @param {string} docId - The ID of the document where the fields are stored.
 * @param {Array} campos - Current list of fields.
 * @param {string} campoId - ID of the field containing the value.
 * @param {string} valorId - ID of the value to be updated.
 * @param {string} valorEditado - New value to replace the old one.
 * @returns {Array} - Updated list of fields.
 * @throws {Error} - If an error occurs while updating the document in Firebase.
 */
export const updateValor = async (docId, campos, campoId, valorId, valorEditado) => {
  const nuevosCampos = campos.map((campo) =>
    campo.id === campoId
      ? {
          ...campo,
          valores: campo.valores.map((valor) =>
            valor.id === valorId ? { ...valor, valor: valorEditado } : valor
          ),
        }
      : campo
  );

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al actualizar el valor: ${error.message}`);
  }
};
