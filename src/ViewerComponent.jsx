import React, { useEffect } from 'react';
import * as OBC from "openbim-components";
import * as THREE from "three";

const ViewerComponent = React.memo(({ onModelLoad }) => {
    const viewerContainerStyle = {
        width: "100%",
        height: "400px",
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

        const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
        highlighter.events.select.onClear.add(() => {
            propertiesProcessor.cleanPropertiesList();
            onModelLoad(null);  // Callback to clear the selected global ID
        });

        ifcLoader.onIfcLoaded.add(model => {
            propertiesProcessor.process(model);
            highlighter.events.select.onHighlight.add((selection) => {
                const fragmentID = Object.keys(selection)[0];
                const expressID = Number([...selection[fragmentID]][0]);
                const properties = propertiesProcessor.getProperties(model, expressID.toString());
                console.log(properties); // Esto debería mostrarte todas las propiedades del objeto seleccionado.
                
                if (properties) {
                    // Encuentra la propiedad 'GlobalId'
                    const globalIdProperty = properties.find(prop => prop.Name === 'GlobalId' || (prop.GlobalId && prop.GlobalId.value));
                    const globalId = globalIdProperty ? globalIdProperty.GlobalId.value : 'No disponible';
                    
                    // Encuentra la propiedad 'Name'
                    const nameProperty = properties.find(prop => prop.Name === 'Name');
                    const nameElement = nameProperty ? nameProperty.NominalValue.value : 'No disponible'; // Asumiendo que el nombre está en 'NominalValue.value'
                    
                    console.log(globalId); // Esto debería mostrarte el GlobalId
                    console.log(nameElement); // Esto debería mostrarte el Name
                    
                    // Aquí llamarías a cualquier función de callback o manejo con globalId y nameElement
                    onModelLoad(globalId, nameElement); // Asumiendo que onModelLoad puede tomar globalId y nameElement
                }
            });
            
            highlighter.update();
        });

        const mainToolbar = new OBC.Toolbar(viewer);
        mainToolbar.addChild(
            ifcLoader.uiElement.get("main"),
            propertiesProcessor.uiElement.get("main")
        );
        viewer.ui.addToolbar(mainToolbar);

        return () => {
            if (viewer) {
                viewer.dispose();
            }
        };
    }, [onModelLoad]);

    return <div id="viewerContainer" style={viewerContainerStyle}></div>;
});

export default ViewerComponent;
