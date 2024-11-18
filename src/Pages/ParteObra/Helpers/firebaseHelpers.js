import { collection, doc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../../firebase_config";

// Referencia a la colección en Firebase
const collectionRef = collection(db, "opcionesFormulario");

// Obtener los campos desde Firebase
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

// Agregar un nuevo campo
export const addCampo = async (docId, campos, nuevoCampo) => {
  const nuevoObjetoCampo = { id: uuidv4(), nombre: nuevoCampo, valores: [] };
  const nuevosCampos = [...campos, nuevoObjetoCampo];

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al agregar el campo: ${error.message}`);
  }
};

// Agregar un valor a un campo existente
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

// Eliminar un campo
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

// Actualizar un campo
export const updateCampo = async (docId, campos, campoId, nombreEditado) => {
  const nuevosCampos = campos.map((campo) =>
    campo.id === campoId ? { ...campo, nombre: nombreEditado } : campo
  );

  try {
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, { campos: nuevosCampos });
    return nuevosCampos;
  } catch (error) {
    throw new Error(`Error al actualizar el campo: ${error.message}`);
  }
};

// Actualizar un valor
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
