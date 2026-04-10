
  import React, { useState, useEffect } from "react";

import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";
import "/src/components/ControlPanel/keyboard.css";

export default function ScaleRootPanel(props) {

const {scaleRootUI, setScaleRootUI, ...rest}=props

const scale = dc.SCALE_MANAGER.activeDict.activeScale
const ClickPiano=(root)=>{
    if( scale !== undefined){
        setScaleRootUI(root)
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
  
 return (
   scaleRootUI && (
    <div className="scale-tile">
            <div className="scale-tile-header">Root</div>
            <div className="scale-tile-body">
              {/* Root controls */}

    <div className="root-grid-container grid-container">
       <div className="grid-group">
          <div className="keyboard">
              {KEYS.map(k => (
                <div
                  key={k.note}
                  className={`key ${k.class} 
                  ${scaleRootUI  === k.note ? "selected" : ""}`}
                  // 
                  onClick={() => ClickPiano(k.note)}
                >
                  <span>{k.note}</span>
                </div>
              ))}
          </div>
         </div>
        </div>
      </div>
    </div>
)
);

}
