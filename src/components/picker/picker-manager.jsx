import { useState, useEffect, useRef } from "react";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
import "jspanel4/dist/jspanel.css";
import "./picker-manager.css"
import "../../globals.js";
 import {Chord}  from "../../harmony/harmony-manager.js"


function PianoPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick,
  chordRootUI,
  setChordRootUI

}) {

  const spId = "piano-sp";
  const spClass = "root-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  const KEYS = [
  { note: "C", class: "white-key c" },
  { note: "C#", class: "black-key c_sharp" },
  { note: "D", class: "white-key d" },
  { note: "D#", class: "black-key d_sharp" },
  { note: "E", class: "white-key e" },
  { note: "F", class: "white-key f" },
  { note: "F#", class: "black-key f_sharp" },
  { note: "G", class: "white-key g" },
  { note: "G#", class: "black-key g_sharp" },
  { note: "A", class: "white-key a" },
  { note: "A#", class: "black-key a_sharp" },
  { note: "B", class: "white-key b" },
];


  return (
    <>
     
       <div className="keyboard">
          {KEYS.map(k => (
            <div
              key={k.note}
              className={`key ${k.class}`}
              onClick={() => setChordRootUI(k.note)}
            >
              <span>{k.note}</span>
            </div>
          ))}
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
  const spClass = "chord-quality-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  const chords = dc.HARMONY_MANAGER.chords
  const major = chords.filter(function (ch) {
                return ch.isMajor() == true
            })
  const dominant = chords.filter(function (ch) {
                return ch.isDominant() == true
            })
  const minor = chords.filter(function (ch) {
                return ch.isMinor() === true
            })


  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Quality</div>
          </div>

 {activeSubPanelUI === spId && (
          <div className="quality-picker-container picker-container">
            <div id="major" className="chord-picker-group picker-group">
              
              {major.map(ch => (
                <div
                  key={ch.id}
                  className="chord-picker-group-item picker-group-item"
                  data-chord={ch.id}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>

             <div id="dominant" className="chord-picker-group picker-group">
              {dominant.map(ch => (
                <div
                  key={ch.id}
                  className="chord-picker-group-item picker-group-item"
                  data-chord={ch.id}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>

             <div id="minor" className="chord-picker-group picker-group">
              {minor.map(ch => (
                <div
                  key={ch.id}
                  className="chord-picker-group-item picker-group-item"
                  data-chord={ch.id}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>


          </div>
            )}
        </div>
    
    </>
  );
}


function FormSSPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "formSS-sp";
  const spClass = "chord-quality-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Form</div>
          </div>

 {activeSubPanelUI === spId && (
        <div className="chord-form-ss-container picker-container">
            <div id="major" className="chord-picker-group picker-group">
                <div class="chord-form-ss-item picker-group-item selected" data-id="D2:2">
                                    D2:2</div>
                <div class="chord-form-ss-item picker-group-item" data-id="D2:3">
                                    D2:3</div>
                <div class="chord-form-ss-item picker-group-item" data-id="D3:1">
                                    D3:1</div>
                <div class="chord-form-ss-item picker-group-item" data-id="D3:2">
                                    D3:2</div>
            </div>
        </div>
            )}
    </div>
  </>
  );
}



function InversionPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "inversion-sp";
  const spClass = "inversion-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Inversion</div>
          </div>

 {activeSubPanelUI === spId && (
        <div className="chord-form-ss-container picker-container">
            <div class="inversion-picker-group picker-group">
                  <div class="inversion-item picker-group-item selected" data-id="1">1</div>
                  <div class="inversion-item picker-group-item" data-id="3">3</div>
                  <div class="inversion-item picker-group-item" data-id="5">5</div>
                  <div class="inversion-item picker-group-item" data-id="7">7</div>
            </div>
        </div>
            )}
    </div>
  </>
  );
}





function PickerContent({ 
  activeSubPanelUI, 
  setActiveSubPanelUI,
  activeCFUI,
  setActiveCFUI,
  chordRootUI,
  setChordRootUI,

 }) {
  return (
    <div className="pm-container">
      <PianoPanel
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}
        chordRootUI={chordRootUI}
        setChordRootUI={setChordRootUI}
      />
      <QualityPanel 
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}
        activeCFUI={activeCFUI}
        setActiveCFUI ={setActiveCFUI}
        />
         
      <FormSSPanel 
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}
       activeCFUI={activeCFUI}
        setActiveCFUI ={setActiveCFUI}        />
      <InversionPanel 
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}
       activeCFUI={activeCFUI}
        setActiveCFUI ={setActiveCFUI}        />
    </div>
  );
}

// need a react component for the useStates
export default function OpenPicker({
  activeCFUI,
 setActiveCFUI,
  chordRootUI,
  setChordRootUI 
}) {
  const [activeSubPanelUI, setActiveSubPanelUI] = useState("piano-sp");
  const panelRootRef = useRef(null);


//  console.log("OpenPicker chordRootUI: ", chordRootUI)

  const openPanel = () => {
    CreatePanel().then(root => {
      panelRootRef.current = root;

      root.render(
        <PickerContent
          activeSubPanelUI={activeSubPanelUI}
          setActiveSubPanelUI={setActiveSubPanelUI}
          activeCFUI={activeCFUI}
          setActiveCFUI={setActiveCFUI}
          chordRootUI={chordRootUI}
          setChordRootUI={setChordRootUI}
 
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
          activeCFUI={activeCFUI}
          setActiveCFUI={setActiveCFUI}
          chordRootUI={chordRootUI}
          setChordRootUI={setChordRootUI}
          
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









