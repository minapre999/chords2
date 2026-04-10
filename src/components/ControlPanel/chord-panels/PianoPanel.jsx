
  import React, { useState, useEffect } from "react";

 import ChordForm  from "/src/harmony/harmony-manager.js"
import {HarmonyManager, Chord}  from "/src/harmony/harmony-manager.js"
import "/src/components/ControlPanel/keyboard.css";


export default function PianoPanel(props) {


const {activeSubPanelUI, setActiveSubPanelUI, forceAll,  chordRootUI, setChordRootUI, cfUI, ...rest} = props


  const ClickPiano=(root)=>{
    if(cfUI !== undefined) {
      cfUI.root = root // this was previously set in FretboardSVG render
      setChordRootUI(root)
      }
    if( scaleChoiceUI !== undefined) {
      scaleChoiceUI.root = root
      const clone = scaleChoiceUI.copy()
      setScaleChoiceUI(clone)
    }
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

  
 { (
  <div className="root-grid-container grid-container">
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
