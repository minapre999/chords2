
  import React, { useState, useEffect } from "react";

import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";


export default function ScaleModePanel(props) {

const {scaleRootUI, scaleModeUI, setScaleModeUI, ...rest}=props



const mode_names = dc.SCALE_MANAGER.activeDict.scaleNames()  // these come grouped, but not in order
const modeGroups = [
  mode_names.major,
  mode_names.melodic_minor,
  mode_names.harmonic_minor,
  mode_names.other,
  mode_names.arpeggio
];


  
 return (
   scaleModeUI && (
    <div className="scale-tile">
            <div className="scale-tile-header">Scale</div>
            <div className="scale-tile-body">
              {/* Root controls */}


    <div className="quality-grid-container grid-container">
      <div className="modes">

      {modeGroups.map((group, idx) => (
            <div key={idx} className="chord-grid-group grid-group">
              {group.map(s => (
                <div
                  key={s}
                  className={`grid-group-item ${s == scaleModeUI ? "selected" : ""}`}
                  onClick={() => setScaleModeUI(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          ))}

          </div>
      
        </div>
      </div>
    </div>
)
);

}
