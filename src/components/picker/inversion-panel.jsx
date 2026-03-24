
 import React, { useState } from "react";
import ChordForm  from "../../harmony/harmony-manager.js"
import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"

export default function InversionPanel({
  activeCFUI,
  setActiveCFUI,
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "inversion-sp";
  const spClass = "inversion-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  const oldCF = dc.HARMONY_MANAGER.chordformWithId(activeCFUI)

  const ClickInversion=(inv)=>{
    const cf = oldCF.chord.getChordform({quality: oldCF.quality, string:  oldCF.string, form: oldCF.form, inversion: inv})
    cf.root = oldCF.root
    setActiveCFUI(cf.id)  
  }

  const arrInv = [...new Set(oldCF.chord.chordforms.map(cf=>{return cf.inversion}))] // unique inversions
  
  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Inversion</div>
          </div>

 {activeSubPanelUI === spId && (
        <div className="chord-form-ss-container picker-container">
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