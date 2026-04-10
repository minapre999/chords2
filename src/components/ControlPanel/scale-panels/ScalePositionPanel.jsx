
  import React, { useState, useEffect } from "react";

import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";
import "/src/components/ControlPanel/ControlPanel.css"

export default function ScalePositionPanel(props) {

const {scaleRootUI, scaleModeUI, scaleFormUI, setScaleFormUI, scaleQualityUI,...rest}=props


// qualities is just a list of chords, one of each quality

  

function ClickFret(f) {

    console.log("Click fret: ", f)
    // required args:  args.fret, args.root, args.quality
    const scale = dc.SCALE_MANAGER.activeDict.getScaleNearestFret(
                          {root: scaleRootUI,
                          quality: scaleQualityUI,
                          mode: scaleModeUI,
                          fret: f})
    console.log("Nearest scale found: ", scale)

    if(scale != null) {
    setScaleFormUI(scale.form)

    }

   
}

const frets = [1,2,3,4,5,6,7,8,9,10,11,12,13]
  // console.log("rendering Scale position panel, scaleFormUI: ", scaleFormUI)
 return (
   scaleFormUI && scaleQualityUI && (
    <div className="scale-tile">
            <div className="scale-tile-header">Position</div>
            <div className="scale-tile-body">
              {/* Root controls */}


    <div className="fret-position-panel grid-container">
      <div className="frets">

            <div className="fret-grid-group grid-group">

           <div class='fretboard'>
            {frets.map(f => (
                <div
                  key={f}
                  className={`fret fret_${f}`}
                  onClick={() => ClickFret(f)}
                   >
                  <span>{f}</span></div> 
              ))}


          </div>

            </div>
          

          </div>
      
        </div>
      </div>
    </div>
)
);

}


