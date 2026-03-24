
import React, { useState } from "react";
 import ChordForm  from "../../harmony/harmony-manager.js"
import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"


export default function PianoPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  activeCFUI,
  setActiveCFUI,
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



   const oldCF = dc.HARMONY_MANAGER.chordformWithId(activeCFUI)

  const ClickPiano=(root)=>{
    // this won't work if using an id 
    // try passing the cf rather than the cf.id in the props
    cf.root = root
    setActiveCFUI(cf.id)  
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

// console.log("rendering piano with chordRootUI: " , chordRootUI)
 return (
  chordRootUI && (
    
    <div id={spId} className={spClass}>

      <div className="title-bar" onClick={ToggleSubPanel}>
        <div className="title">Root</div>
      </div>

 {activeSubPanelUI === spId && (
      <div className="keyboard">
        {KEYS.map(k => (
          <div
            key={k.note}
            className={`key ${k.class} ${chordRootUI === k.note ? "selected" : ""}`}
            onClick={() => setChordRootUI(k.note)}
          >
            <span>{k.note}</span>
          </div>
        ))}
      </div>
 )}
    </div>

  )
);

}
