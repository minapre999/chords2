import { useState, useEffect, useRef } from "react";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
import "jspanel4/dist/jspanel.css";
import "./picker-manager.css"
import "../../globals.js";
 import {Chord}  from "../../harmony/harmony-manager.js"
import PianoPanel from "./piano-panel.jsx"
import QualityPanel from "./quality-panel.jsx"
import FormSSPanel from "./formss-panel.jsx"
import InversionPanel from "./inversion-panel.jsx"







function PickerContent({ 
activeSubPanelUI, 
setActiveSubPanelUI,

  cfUI, 
  setCFUI2,

chordRootUI,
setChordRootUI,
chordStringUI,
setChordStringUI,

 }) {

  // console.log("PickerContent cfUI: ",cfUI)
  return (
    <div className="pm-container">
      <PianoPanel
 
       cfUI={cfUI}
      setCFUI2={setCFUI2}

        activeSubPanelUI={activeSubPanelUI} 
        setActiveSubPanelUI={setActiveSubPanelUI}
        chordRootUI={chordRootUI} setChordRootUI={setChordRootUI}
        
      />
      <QualityPanel 

          cfUI={cfUI}
      setCFUI2={setCFUI2}
        activeSubPanelUI={activeSubPanelUI} 
        setActiveSubPanelUI={setActiveSubPanelUI}
       
        />     
      <FormSSPanel 

  cfUI={cfUI}
      setCFUI2={setCFUI2}

        activeSubPanelUI={activeSubPanelUI} 
        setActiveSubPanelUI={setActiveSubPanelUI}
      
           />

      <InversionPanel 
    
   cfUI={cfUI}
      setCFUI2={setCFUI2}
       

        activeSubPanelUI={activeSubPanelUI} 
        setActiveSubPanelUI={setActiveSubPanelUI}
      
            />
    </div>
  );
}

// need a react component for the useStates
export default function OpenPicker({

  cfUI,
   setCFUI2,
chordRootUI,
setChordRootUI,
chordStringUI,
setChordStringUI,
}) {
  const [activeSubPanelUI, setActiveSubPanelUI] = useState("piano-sp");
  const panelRootRef = useRef(null);

  // console.log("OpenPicker cfUI: ",cfUI)

//  console.log("OpenPicker chordRootUI: ", chordRootUI)

  const openPanel = () => {
    CreatePanel().then(root => {
      panelRootRef.current = root;

      root.render(
        <PickerContent
          activeSubPanelUI={activeSubPanelUI}
          setActiveSubPanelUI={setActiveSubPanelUI}
            cfUI={cfUI}
      setCFUI2={setCFUI2}

 
          chordRootUI={chordRootUI}
          setChordRootUI={setChordRootUI}
          chordStringUI={chordStringUI}
          setChordStringUI={setChordStringUI}

/>
      );
    });
  };

  // Re-render when state changes
  useEffect(() => {
    if (panelRootRef.current) {
      panelRootRef.current.render(
        <PickerContent
          activeSubPanelUI={activeSubPanelUI}
          setActiveSubPanelUI={setActiveSubPanelUI}
  
         cfUI={cfUI}
      setCFUI2={setCFUI2}
          chordRootUI={chordRootUI}
          setChordRootUI={setChordRootUI}
          chordStringUI={chordStringUI}
          setChordStringUI={setChordStringUI}
  
        />
      );
    }
  }, [activeSubPanelUI, cfUI, chordRootUI]);

  return (
    <button onClick={openPanel}>Open picker</button>
  );
}



function CreatePanel() {
  return new Promise(resolve => {
    const container = document.createElement("div");

    jsPanel.create({
      id: "chord-picker",
      panelClass: "pick-master",
      theme: "default",
      position: { my: "center", at: "center", offsetX: -112 },
      headerTitle: "Chord",
      resizeit: false,            // optional, prevents user resizing
      contentSize: { width: 400, height: 'auto' }, // initial width fixed
      content: container,
      panelCSS: {
              zIndex: 9999 // Your desired z-index
          },
      callback: panel => {
        const root = ReactDOM.createRoot(container);
        panel.classList.add("pick-master")

      // console.log("panel z-index:", getComputedStyle(panel).zIndex);
        panel.style.zIndex = 999999;
      //  console.log("panel z-index after set:", getComputedStyle(panel).zIndex);
        window.__pickerRoot = root;
        resolve(root);   // ⭐ important

     
      }
    });
  });
}









