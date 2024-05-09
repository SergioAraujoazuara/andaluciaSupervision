import React, { useEffect, useState } from 'react';
import * as OBC from "openbim-components";
import * as THREE from "three";

const ViewerComponent = React.memo(({ setSelectedGlobalId, setSelectedNameBim }) => {
    const [modelCount, setModelCount] = useState(0);
    const viewerContainerStyle = {
        width: "100%",
        height: "500px",
        position: "relative",
        gridArea: "viewer",
    };

    useEffect(() => {
        const viewer = new OBC.Components();
        const viewerContainer = document.getElementById("viewerContainer");
        
        if (!viewerContainer) {
            console.error("Viewer container not found.");
            return;
        }

        const sceneComponent = new OBC.SimpleScene(viewer);
        sceneComponent.setup();
        viewer.scene = sceneComponent;
        const scene = sceneComponent.get();

        const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer);
        viewer.renderer = rendererComponent;

        const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
        viewer.camera = cameraComponent;

        const raycasterComponent = new OBC.SimpleRaycaster(viewer);
        viewer.raycaster = raycasterComponent;

        viewer.init();
        cameraComponent.updateAspect();
        rendererComponent.postproduction.enabled = true;

        const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666));
        rendererComponent.postproduction.customEffects.excludedMeshes.push(grid.get());

        const fragmentManager = new OBC.FragmentManager(viewer);
        const ifcLoader = new OBC.FragmentIfcLoader(viewer);

        const highlighter = new OBC.FragmentHighlighter(viewer);
        highlighter.setup();

        async function loadIfcAsFragments() {
            const file = await fetch('../modelos/Viaducto_cortazar.ifc');
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            const model = await ifcLoader.load(buffer, "example");
            scene.add(model);
        }
        loadIfcAsFragments();

        const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
        highlighter.events.select.onClear.add(() => {
            propertiesProcessor.cleanPropertiesList();
            setSelectedGlobalId(null); 
            setSelectedNameBim(null) // Callback to clear the selected global ID
        });

        ifcLoader.onIfcLoaded.add(model => {
            setModelCount(fragmentManager.groups.length);
            propertiesProcessor.process(model);
            highlighter.events.select.onHighlight.add((selection) => {
                const fragmentID = Object.keys(selection)[0];
                const expressID = Number([...selection[fragmentID]][0]);
                const properties = propertiesProcessor.getProperties(model, expressID.toString());
                console.log(properties, '******** properties'); // Esto debería mostrarte todas las propiedades del objeto seleccionado.
                
                if (properties) {
                    // Encuentra la propiedad 'GlobalId'
                    const globalIdProperty = properties.find(prop => prop.Name === 'GlobalId' || (prop.GlobalId && prop.GlobalId.value));
                    const nameProperty = properties.find(prop => prop.Name === 'Name' || (prop.Name && prop.Name.value));
                    const globalId = globalIdProperty ? globalIdProperty.GlobalId.value : 'No disponible';
                    const name = nameProperty ? nameProperty.Name.value : 'No disponible';
                    
              
                    
                    console.log(globalId); // Esto debería mostrarte el GlobalId
                    console.log(name); // Esto debería mostrarte el Name
                    
                    // Aquí llamarías a cualquier función de callback o manejo con globalId y nameElement
                    setSelectedGlobalId(globalId);
                    setSelectedNameBim(name) // Asumiendo que onModelLoad puede tomar globalId y nameElement
                }
            });

           
            
            highlighter.update();
        });

        const mainToolbar = new OBC.Toolbar(viewer);
        mainToolbar.addChild(
           
            propertiesProcessor.uiElement.get("main")
        );
        viewer.ui.addToolbar(mainToolbar);

        return () => {
            if (viewer) {
                viewer.dispose();
            }
        };
    }, [setSelectedGlobalId, setSelectedNameBim ]);

    return <div className='container' id="viewerContainer" style={viewerContainerStyle}></div>;
});

export default ViewerComponent;
