
  import React, { useState, useEffect } from "react";

 import ChordForm  from "../../harmony/harmony-manager.js"
import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"


export default function PianoPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,

   cfUI,
  setCFUI,
  onKeyClick,
  chordRootUI,
  setChordRootUI,
  forceAll

}) {


const [isOpen, setIsOpen] = useState(true);

  // console.log("PianoPanel component forceAll: ", forceAll, "isOpen:", isOpen, "setCFUI: ", setCFUI)




 // Respond to global force command
  useEffect(() => {
    if (forceAll === "open") setIsOpen(true);
    if (forceAll === "close") setIsOpen(false);
  }, [forceAll]);
  
  
const toggle = () => setIsOpen(prev => !prev);


 


const oldCF = cfUI
  const ClickPiano=(root)=>{
    cfUI.root = root // this was previously set in FretboardSVG render
    setChordRootUI(root)
 // this doesn't work as eact state updates only fire when the reference changes.
 // would need to make a clone - don't want to do this as chordforms are all linked to chords and harmonies
    // oldCF.root = root
    // setCFUI(oldCF)  
  }



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

// console.log("rendering piano with cfUI: " , cfUI)

 const spId = "piano-sp";
  const spClass = "root-subpanel subpanel";

  
 return (
  cfUI && (
    
    
    <div id={spId} className={spClass}>

      <div className="title-bar" onClick={toggle}>
        <div className="title">Root</div>
      </div>

 {isOpen  && (
  <div className="root-picker-container picker-container">
      <div className="keyboard">
        {KEYS.map(k => (
          <div
            key={k.note}
            className={`key ${k.class} ${cfUI.root  === k.note ? "selected" : ""}`}
            onClick={() => ClickPiano(k.note)}
          >
            <span>{k.note}</span>
          </div>
        ))}
      </div>
      </div>
 )}
    </div>

  )
);

}
