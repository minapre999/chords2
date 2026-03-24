  import React, { useState } from "react";
  import ChordForm  from "../../harmony/harmony-manager.js"
  import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"

export default function QualityPanel({
  activeCFUI,
  setActiveCFUI,
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {
  const spId = "quality-sp";
  const spClass = "chord-quality-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  const ClickChordQuality=(chordId)=>{
    const chord = dc.HARMONY_MANAGER.chordWithId(chordId)
    const oldCF = dc.HARMONY_MANAGER.chordformWithId(activeCFUI)
    console.log("ClickChordQuality chord: ", chord, "oldCF", oldCF)
    const cf = chord.getChordform({string : oldCF.string, form: oldCF.form, inversion: oldCF.inversion})
    cf.root = oldCF.root
    // console.log("New cf: " , cf)
    setActiveCFUI(cf.id)  
  }

  const chords = dc.HARMONY_MANAGER.chords
  const major = chords.filter( (ch)=>ch.isMajor() )
  const dominant = chords.filter( (ch)=> ch.isDominant() )
  const minor = chords.filter( (ch)=>ch.isMinor() )

  const cf = dc.HARMONY_MANAGER.chordformWithId(activeCFUI)
//  console.log("QualityPanel cf: ", cf)
  return (
    activeCFUI && (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Quality</div>
          </div>


 {activeSubPanelUI === spId && (
          <div className="quality-picker-container picker-container">
            <div id="major" className="chord-picker-group picker-group">
              
              {major.map(ch => (
                <div
                  key={ch.id}

                  className={`chord-picker-group-item picker-group-item ${ch.id == cf.chord.id ? "selected" : ""}`}
                  data-chord={ch.id}
                  onClick={() => ClickChordQuality(ch.id)}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>

             <div id="dominant" className="chord-picker-group picker-group">
              {dominant.map(ch => (
                <div
                  key={ch.id}
                  className={`chord-picker-group-item picker-group-item ${ch.id == cf.chord.id ? "selected" : ""}`}
                  data-chord={ch.id}
                  onClick={() => ClickChordQuality(ch.id)}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>

             <div id="minor" className="chord-picker-group picker-group">
              {minor.map(ch => (
                <div
                  key={ch.id}
                  className={`chord-picker-group-item picker-group-item ${ch == cf.chord.id ? "selected" : ""}`}
                  data-chord={ch.id}
                  onClick={() => ClickChordQuality(ch.id)}
                >
                  {ch.preferredSymbol(true)}
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