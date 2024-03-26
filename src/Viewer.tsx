
import React, { useState, useEffect } from 'react';
import * as OBC from "openbim-components";
import * as THREE from "three";
import { db } from '../firebase_config';
import { getDocs, collection } from 'firebase/firestore';

// Define la interfaz para un lote
interface Lote {
  docId: string;
  nombre: string;
}


export default function ViewerComponent() {
  const [modelCount, setModelCount] = useState(0);
  const [lotes, setLotes] = useState<Lote[]>([]);

  useEffect(() => {
    const obtenerLotes = async () => {
      try {
        const lotesRef = collection(db, "lotes");
        const querySnapshot = await getDocs(lotesRef);
        const lotesData = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        })) as Lote[];
        setLotes(lotesData);
      } catch (error) {
        console.error('Error al obtener los lotes:', error);
      }
    };

    obtenerLotes();
  }, []);

  useEffect(() => {
    let viewer;
    let grid;
    let fragmentManager;
    let ifcLoader;
    let highlighter;
    let propertiesProcessor;
    let mainToolbar;

    const initViewer = () => {
      viewer = new OBC.Components();

      const sceneComponent = new OBC.SimpleScene(viewer);
      sceneComponent.setup();
      viewer.scene = sceneComponent;

      const viewerContainer = document.getElementById("viewerContainer") as HTMLDivElement;
      const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer);
      viewer.renderer = rendererComponent;

      const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
      viewer.camera = cameraComponent;

      const raycasterComponent = new OBC.SimpleRaycaster(viewer);
      viewer.raycaster = raycasterComponent;

      viewer.init();
      cameraComponent.updateAspect();
      rendererComponent.postproduction.enabled = true;

      grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666));
      rendererComponent.postproduction.customEffects.excludedMeshes.push(grid.get());

      fragmentManager = new OBC.FragmentManager(viewer);
      ifcLoader = new OBC.FragmentIfcLoader(viewer);

      highlighter = new OBC.FragmentHighlighter(viewer);
      highlighter.setup();

      propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
      highlighter.events.select.onClear.add(() => {
        propertiesProcessor.cleanPropertiesList();
      });

      ifcLoader.onIfcLoaded.add(model => {
        setModelCount(fragmentManager.groups.length);
        propertiesProcessor.process(model);
        highlighter.events.select.onHighlight.add((selection) => {
          const fragmentID = Object.keys(selection)[0];
          const expressID = Number([...selection[fragmentID]][0]);
          
          // Asumiendo que `getProperties` te da acceso a todas las propiedades del objeto seleccionado.
          // Debes verificar cómo tu implementación específica devuelve estas propiedades.
          const properties = propertiesProcessor.getProperties(model, expressID.toString());
          if (properties) {
            // Busca la propiedad `GlobalId` dentro del conjunto de propiedades obtenidas.
            const globalIdProperty = properties.find(prop => prop.Name === 'GlobalId' || (prop.GlobalId && prop.GlobalId.value));
            const globalId = globalIdProperty ? globalIdProperty.GlobalId.value : 'No disponible';
      
            console.log(`GlobalId del elemento seleccionado: ${globalId}`);
            console.log(properties)
          } else {
            console.log(`No se encontraron propiedades para el elemento con ExpressID: ${expressID}`);
          }
      
          // La llamada a renderProperties parece estar correcta, asumiendo que es la forma
          // en que deseas que se maneje la visualización de las propiedades en tu aplicación.
          propertiesProcessor.renderProperties(model, expressID);
        });
        highlighter.update();
      });

      mainToolbar = new OBC.Toolbar(viewer);
      mainToolbar.addChild(
        ifcLoader.uiElement.get("main"), // Botón para cargar modelos
        propertiesProcessor.uiElement.get("main") // Botón para procesar propiedades
      );
      viewer.ui.addToolbar(mainToolbar);
    };

    initViewer();

    return () => {
      if (viewer) {
        viewer.dispose(); // Reemplazar con el método de limpieza correcto
      }
      // Agregar aquí la limpieza de otros componentes si es necesario
    };
  }, []);

  return (
    <>
      <div id="viewerContainer" className='w-full h-full'>
        <h3>Modelo: {modelCount}</h3>
        <div>
          {lotes.map((lote, index) => (
            <button className='bg-green-500 text-white p-2 m-1' key={index}>
              {lote.nombre}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
