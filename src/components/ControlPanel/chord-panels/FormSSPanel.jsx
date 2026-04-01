
 import React, { useState,useEffect } from "react";

import ChordForm, {HarmonyManager, Chord}   from "/src/harmony/harmony-manager.js"

export default function InversionPanel({


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


  if( cfUI == null) return null

    const toggle = () => setIsOpen(prev => !prev);



  const spId = "inversion-sp";
  const spClass = "inversion-subpanel subpanel";

 
  const oldCF = cfUI
// console.log("inversion pane oldCF: ", oldCF)
  const ClickInversion=(inv)=>{
    const newCF = oldCF?.chord.getChordform({quality: oldCF.quality, string:  oldCF.string, form: oldCF.form, inversion: inv})
    newCF.root = oldCF?.root
    setCFUI(newCF)  
  }

  let arrInv = [...new Set(oldCF.chord.chordforms.map(cf=>{return cf.inversion}))] // unique inversions
  // console.log("arrInv: ", arrInv)
  arrInv = arrInv.sort((a,b)=>{ return  a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0) } )

 
  // console.log("sorted arrInv: ", arrInv)
  return (
    <>
     
        <div id={spId} className={spClass}>
         

 {isOpen && (
        <div className="inversion-container picker-container">
            <div class="inversion-picker-group picker-group">

                   {arrInv.map(inv => (
                <div
                  key={inv}

                  className={`chord-form-ss-item picker-group-item ${inv == oldCF.inversion ? "selected" : ""}`}
                  onClick={() => ClickInversion(inv)}
                >
                  {inv}
                </div>
              ))}


            </div>
        </div>
            )}
    </div>
  </>
  );
}