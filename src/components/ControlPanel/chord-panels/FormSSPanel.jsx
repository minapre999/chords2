import React, { useState, useEffect } from "react";

import ChordForm, {HarmonyManager, Chord}  from "/src/harmony/harmony-manager.js"
import "/src/globals.js"
import "/src/components/ControlPanel/ControlPanel.css";


export default function FormSSPanel(
  props
  ) {
  
  const {cfUI, setCFUI, ...rest} = props



   const ClickFormSS=(fssId)=>{
    const i = fssId.indexOf(":")
    const string = fssId.slice(i+1, i+2)
    const form =  fssId.slice(0, i)

   
    const newCF = cfUI.chord.getChordform({quality: cfUI.quality, 
                                                  string:  string, 
                                                  form: form, 
                                                  inversion: cfUI.inversion})
    setCFUI(newCF)  
  }

const uniqueFSS =   [...new Set(dc.HARMONY_MANAGER.chordforms.map(cf=>{return cf.form_ss}))] // unique FSS
const activeCF = cfUI
  return (
    cfUI && (
    <>
     
          <div className="scale-tile">
            <div className="scale-tile-header">Form and String Set</div>
            <div className="scale-tile-body"></div>


 {(
        <div className="grid-container">
          <div id="form-ss" className="chord-grid-group grid-group">

          {uniqueFSS.map(fss => (
                <div
                  key={fss}

                  className={`chord-form-ss-item grid-group-item ${fss == activeCF.form_ss ? "selected" : ""}`}
                  onClick={() => ClickFormSS(fss)}
                >
                  {fss}
                </div>
              ))}

          </div>
        </div>
            )}
    </div>
  </>
    )
  );
}