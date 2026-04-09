
  import React, { useState, useEffect } from "react";

import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";


export default function ScaleFormPanel(props) {

const {scaleFormUI, setScaleFormUI, scaleQualityUI,...rest}=props


// qualities is just a list of chords, one of each quality

let scaleForms = dc.SCALE_MANAGER.activeDict.scaleFormNames(scaleQualityUI) 
           
  console.log("rendering Scale Form panel, scaleFormUI: ", scaleFormUI)
 return (
   scaleFormUI && (
    <div className="scale-tile">
            <div className="scale-tile-header">Form</div>
            <div className="scale-tile-body">
              {/* Root controls */}


    <div className="quality-picker-container picker-container">
      <div className="modes">

            <div className="chord-picker-group picker-group">
              {scaleForms.map(f => (
                <div
                  key={f}
                  className={`picker-group-item ${f == scaleFormUI ? "selected" : ""}`}
                  onClick={() => setScaleFormUI(f)}
                >
                  {f}
                </div>
              ))}
            </div>
          )

          </div>
      
        </div>
      </div>
    </div>
)
);

}
