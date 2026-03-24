import React, { useState } from "react";
 import ChordForm  from "../../harmony/harmony-manager.js"
import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"

export default function FormSSPanel({

  cfUI,
  setCFUI2,
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);


  const spId = "formSS-sp";
  const spClass = "chord-quality-subpanel subpanel";

    const ToggleSubPanel = () => {
    // prev is the previous state value - the value that setIsPanelOpen had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setIsPanelOpen(prev =>  prev === spId ? "" : spId );
  };


   const ClickFormSS=(fssId)=>{
    const i = fssId.indexOf(":")
    const string = fssId.slice(i+1, i+2)
    const form =  fssId.slice(0, i)

   
    const newCF = cfUI.chord.getChordform({quality: cfUI.quality, 
                                                  string:  string, 
                                                  form: form, 
                                                  inversion: cfUI.inversion})
    setCFUI2(newCF)  
  }

const uniqueFSS =   [...new Set(dc.HARMONY_MANAGER.chordforms.map(cf=>{return cf.form_ss}))] // unique FSS
const activeCF = cfUI
  return (
    cfUI && (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Form and String Set</div>
          </div>

 {isPanelOpen === spId && (
        <div className="chord-form-ss-container picker-container">
          <div id="form-ss" className="chord-picker-group picker-group">

          {uniqueFSS.map(fss => (
                <div
                  key={fss}

                  className={`chord-form-ss-item picker-group-item ${fss == activeCF.form_ss ? "selected" : ""}`}
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
