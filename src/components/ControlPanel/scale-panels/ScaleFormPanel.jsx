
  import React, { useState, useEffect } from "react";

import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";
import "/src/components/ControlPanel/ControlPanel.css"

export default function ScaleFormPanel(props) {

const {scaleFormUI, setScaleFormUI, scaleQualityUI,...rest}=props


// qualities is just a list of chords, one of each quality

let scaleForms = dc.SCALE_MANAGER.activeDict.scaleFormNames(scaleQualityUI) 
           
  console.log("rendering Scale Form panel, scaleFormUI: ", scaleFormUI)
 return (
   scaleFormUI && scaleQualityUI && (
    <div className="grid-tile">
            <div className="grid-tile-header">Form</div>
            <div className="grid-tile-body">
              {/* Root controls */}


    <div className="form-grid-container grid-container">
      <div className="forms">

            <div className="chord-grid-group grid-group">
              {scaleForms.map(f => (
                <div
                  key={f}
                  className={`grid-group-item ${f == scaleFormUI ? "selected" : ""}`}
                  onClick={() => setScaleFormUI(f)}
                >
                  {f}
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
