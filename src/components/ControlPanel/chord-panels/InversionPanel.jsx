
 import React, { useState,useEffect } from "react";

import ChordForm , {HarmonyManager, Chord} from "/src/harmony/harmony-manager.js"
import "/src/components/ControlPanel/ControlPanel.css";

export default function InversionPanel(
  props) {

 const {cfUI, setCFUI, ...rest}=props

   

  if( cfUI == null) return null

  const spId = "inversion-sp";
  const spClass = "inversion-subpanel subpanel";

 
  const oldCF = cfUI
// console.log("inversion pane oldCF: ", oldCF)
  const ClickInversion=(inv)=>{
    const newCF = oldCF.chord.getChordform({quality: oldCF.quality, string:  oldCF.string, form: oldCF.form, inversion: inv})
    newCF.root = oldCF.root
    setCFUI(newCF)  
  }

  let arrInv = [...new Set(oldCF.chord.chordforms.map(cf=>{return cf.inversion}))] // unique inversions
  // console.log("arrInv: ", arrInv)
  arrInv = arrInv.sort((a,b)=>{ return  a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0) } )

 
  // console.log("sorted arrInv: ", arrInv)
  return (
    <>
      <div className="scale-tile">
            <div className="scale-tile-header">Inversion</div>
            <div className="scale-tile-body"></div>

        
 { (
        <div className="root-grid-container grid-container">
       <div className="grid-group">

                   {arrInv.map(inv => (
                <div
                  key={inv}

                  className={`chord-form-ss-item grid-group-item ${inv == oldCF.inversion ? "selected" : ""}`}
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