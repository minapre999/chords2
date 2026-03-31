import { useState, useEffect, useRef } from "react";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
// import "jspanel4/dist/jspanel.css";
import "/src/components/toolbar/toolbar.css";

import "/src/globals.js";
 import {Chord}  from "/src/harmony/harmony-manager.js"
import PianoPanel from "/src/components/picker/piano-panel.jsx"
import ChordQualityPanel from "/src/components/picker/ChordQualityPanel"
import FormSSPanel from "/src/components/picker/formss-panel.jsx"
import InversionPanel from "/src/components/picker/inversion-panel.jsx"
import "/src/components/picker/picker-manager.css"




function PickerContent(props) {

  // console.log("PickerContent cfUI: ",cfUI)
  return (
    <div className="pm-container">
      <PianoPanel  {...props}  />
      <ChordQualityPanel  {...props}  />     
      <FormSSPanel  {...props}/>
      <InversionPanel  {...props}  />
    </div>
  );
}

// need a react component for the useStates
export default function ChordPicker(props) {
const { cfUI, chordRootUI }=props
  const [activeSubPanelUI, setActiveSubPanelUI] = useState("piano-sp");
  const [forceAll, setForceAll] = useState(null); // force subpanels to open / close
// values: "open", "close", or null
   useEffect(() => {
    window.__forceAll = (cmd) => {
      console.log("FORCE ALL:", cmd);   // add this for debugging
      setForceAll(cmd);
    };
  }, []);

  const panelRootRef = useRef(null);

  // console.log("ChordPicker cfUI: ",cfUI)

//  console.log("ChordPicker chordRootUI: ", chordRootUI)

  const openPanel = () => {

    if(  window.__chordPicker ) {
      // window.__scalePicker .showPanel()
       const el = document.getElementById("chord-picker");
      if (el) {


              el.style.display = "";
            el.style.pointerEvents = "auto";  // restore interactivity
            el.style.opacity = "1";           // ensure visible
            el.jsPanel.status = "normalized"; // restore jsPanel internal state
          }

      return
    }


    CreatePanel().then(root => {
      panelRootRef.current = root;

      root.render(  <PickerContent  
        {...props}
        forceAll={forceAll}  setForceAll={setForceAll} 
        activeSubPanelUI={activeSubPanelUI} setActiveSubPanelUI={setActiveSubPanelUI}

        />  );

      // Wire jsPanel title-bar buttons
      document.getElementById("open-all").onclick = () => setForceAll("open");
      document.getElementById("close-all").onclick = () => setForceAll("close");

    });
  };

  // Re-render when state changes
  useEffect(() => {
    if (panelRootRef.current) {
      panelRootRef.current.render(  <PickerContent 
         {...props} 
        forceAll={forceAll}  setForceAll={setForceAll} 
        activeSubPanelUI={activeSubPanelUI} setActiveSubPanelUI={setActiveSubPanelUI}

                 />
      );
    }
  }, [activeSubPanelUI, cfUI, chordRootUI, forceAll]);

  return (

<button className = "picker-button" onClick={openPanel}>
  <i className="fa-solid fa-music toolbar-icon"></i>
</button>



  );
}


function CreatePanel() {
  return new Promise(resolve => {
    const container = document.createElement("div");

    
    window.__chordPicker = jsPanel.create({
      id: "chord-picker",
      panelClass: "pick-master",
      theme: "default",
      headerControls: {
  minimize: 'remove',
  maximize: 'remove',
  smallify: 'remove',
  smallifyrev: 'remove'
},
      position: { my: "center", at: "center", offsetX: -72 },
      headerTitle: "Chord",
onbeforeclose: function () {
            const el = document.getElementById("chord-picker");
            if (el) {
              el.style.display = "none";
              this.status = "hidden";   // IMPORTANT: update jsPanel internal state


            }
            return false;                  // prevent jsPanel from destroying it
  },
      headerToolbar: `
       <div class="force-all"> <span id="open-all" class="jspanel-btn my-btn">
      <i class="fa fa-chevron-down"></i>
    </span>
    <span id="close-all" class="jspanel-btn my-btn">
      <i class="fa fa-chevron-up"></i>
    </span>
    </div>
      `,

      resizeit: false,
      contentSize: { width: 255, height: "auto" },
      
      content: container,
      panelCSS: { zIndex: 9999 },

      callback: function(panel) {
        // console.log("jsPanel callback fired");
      panel.classList.add("pick-master");
      panel.header.classList.add('title-center');
        const reactRoot = ReactDOM.createRoot(container);

        const openBtn = panel.querySelector("#open-all");
        const closeBtn = panel.querySelector("#close-all");

        // console.log("openBtn:", openBtn);
        // console.log("closeBtn:", closeBtn);

        if (openBtn) {
          openBtn.addEventListener("click", () => {
            console.log("open-all clicked");
            window.__forceAll("open");
          });
        }

        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            console.log("close-all clicked");
            window.__forceAll("close");
          });
        }

        resolve({
          render: (element) => reactRoot.render(element)
        });
      }
    });
  });
}










