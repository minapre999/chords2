import React, { useState, useEffect } from "react";

 import ChordForm  from "../../harmony/harmony-manager.js"
import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"

export default function FormSSPanel({
  cfUI,
  setCFUI,
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick,
  forceAll
}) {
  
  const [isPanelOpen, setIsPanelOpen] = useState(true);
const [isOpen, setIsOpen] = useState(true);
 // Respond to global force command
  useEffect(() => {
    if (forceAll === "open") setIsOpen(true);
    if (forceAll === "close") setIsOpen(false);
  }, [forceAll]);


  const toggle = () => setIsOpen(prev => !prev);



  const spId = "formSS-sp";
  const spClass = "chord-form-ss-subpanel subpanel";

 


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
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={toggle}>
            <div className="title">Form and String Set</div>
          </div>

 {isOpen && (
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
