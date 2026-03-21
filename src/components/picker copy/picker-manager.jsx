import { useState, useEffect, useRef } from "react";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
import "jspanel4/dist/jspanel.css";
import "./picker-manager.css"


function PianoPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "piano-sp";
  const spClass = "root-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Root</div>
          </div>

 {activeSubPanelUI === spId && (
          <div className="root-picker-container picker-container">
            <div className="keyboard">
              <div className="key white-key c selected"><span>C</span></div>
              <div className="key black-key c_sharp"><span>C#</span></div>
              <div className="key white-key d"><span>D</span></div>
              <div className="key black-key d_sharp"><span>D#</span></div>
              <div className="key white-key e"><span>E</span></div>
              <div className="key white-key f"><span>F</span></div>
              <div className="key black-key f_sharp"><span>F#</span></div>
              <div className="key white-key g"><span>G</span></div>
              <div className="key black-key g_sharp"><span>G#</span></div>
              <div className="key white-key a"><span>A</span></div>
              <div className="key black-key a_sharp"><span>A#</span></div>
              <div className="key white-key b"><span>B</span></div>
            </div>
          </div>
            )}
        </div>
    
    </>
  );
}


function QualityPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "quality-sp";
  const spClass = "root-subpanel subpanel";

  const ToggleSubPanel = () => {
    setActiveSubPanelUI(prev =>
      prev === spId ? "" : spId
    );
  };

  return (
    <>
      {activeSubPanelUI === spId && (
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Quality</div>
          </div>

         
        </div>
      )}
    </>
  );
}


function FormSSPanel({ message }) {
  return (
    <div style={{ padding: "10px" }}>
      <h2>FormSSPanel</h2>
  
    </div>
  );
}

function InversionPanel({ message }) {
  return (
    <div style={{ padding: "10px" }}>
      <h2>FormSSPanel</h2>
  
    </div>
  );
}

function PickerContent({ activeSubPanelUI, setActiveSubPanelUI }) {
  return (
    <div className="pm-container">
      <PianoPanel
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}
      />
      <QualityPanel />
      <FormSSPanel />
      <InversionPanel />
    </div>
  );
}

// need a react component for the useStates
export default function OpenPicker() {
  const [activeSubPanelUI, setActiveSubPanelUI] = useState("piano-sp");
  const panelRootRef = useRef(null);

  const openPanel = () => {
    CreatePanel().then(root => {
      panelRootRef.current = root;

      root.render(
        <PickerContent
          activeSubPanelUI={activeSubPanelUI}
          setActiveSubPanelUI={setActiveSubPanelUI}
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
        />
      );
    }
  }, [activeSubPanelUI]);

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
      theme: "none",
      position: { my: "center", at: "center", offsetX: -112 },
      headerTitle: "Chord",
      contentSize: "400 250",
      content: container,

      callback: panel => {
        const root = ReactDOM.createRoot(container);
        panel.classList.add("pick-master")
        window.__pickerRoot = root;
        resolve(root);   // ⭐ important
      }
    });
  });
}









