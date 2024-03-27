import React, { useState, useEffect } from 'react';
import * as OBC from "openbim-components";
import * as THREE from "three";
import { db } from '../firebase_config';
import { getDocs, collection } from 'firebase/firestore';

interface Lote {
  docId: string;
  nombre: string;
  idBim: string;
  sectorNombre: string;
  subSectorNombre: string;
  parteNombre: string;
  elementoNombre: string;
  loteNombre: string;
  ppiNombre: string;
}

export default function ViewerComponent() {
  const [modelCount, setModelCount] = useState(0);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  useEffect(() => {
    const obtenerLotes = async () => {
      try {
        const lotesRef = collection(db, "lotes");
        const querySnapshot = await getDocs(lotesRef);
        const lotesData = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data(),
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
        setSelectedGlobalId(null);
      });

      ifcLoader.onIfcLoaded.add(model => {
        setModelCount(fragmentManager.groups.length);
        propertiesProcessor.process(model);
        highlighter.events.select.onHighlight.add((selection) => {
          const fragmentID = Object.keys(selection)[0];
          const expressID = Number([...selection[fragmentID]][0]);
          const properties = propertiesProcessor.getProperties(model, expressID.toString());
          if (properties) {
            const globalIdProperty = properties.find(prop => prop.Name === 'GlobalId' || (prop.GlobalId && prop.GlobalId.value));
            const globalId = globalIdProperty ? globalIdProperty.GlobalId.value : 'No disponible';
            setSelectedGlobalId(globalId);
            const lote = lotes.find(l => l.idBim === globalId);
            setSelectedLote(lote);
          }
        });
        highlighter.update();
      });

      mainToolbar = new OBC.Toolbar(viewer);
      mainToolbar.addChild(
        ifcLoader.uiElement.get("main"),
        propertiesProcessor.uiElement.get("main")
      );
      viewer.ui.addToolbar(mainToolbar);
    };

    initViewer();

    return () => {
      if (viewer) {
        viewer.dispose();
      }
    };
  }, [lotes]);

  return (
    <div className="flex flex-col">
      <div className="w-1/2 p-4">
        {selectedLote ? (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Información del Lote</h2>
            <p><strong>Sector: </strong>{selectedLote.sectorNombre}</p>
            <p><strong>Sub sector: </strong>{selectedLote.subSectorNombre}</p>
            <p><strong>Parte: </strong>{selectedLote.parteNombre}</p>
            <p><strong>Elemento: </strong>{selectedLote.elementoNombre}</p>
            <p className='text-2xl font-semibold text-blue-700'><strong>Lote: </strong>{selectedLote.nombre}</p>
            <p className='text-2xl font-semibold text-blue-700'><strong>Ppi: </strong>{selectedLote.ppiNombre}</p>
          </div>
        ) : (
          <p className="text-lg text-gray-600">Haz click en el visor para ver detalles del lote.</p>
        )}
      </div>
      <div className="w-1/2" id="viewerContainer" style={{ height: '500px' }}></div>
    </div>
  );
}
