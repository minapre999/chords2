  import React, { useState } from "react";
  import ChordForm  from "../../harmony/harmony-manager.js"
  import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"

export default function QualityPanel({

     cfUI,
  setCFUI2,
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const [isPanelOpen, setIsPanelOpen] = useState(true);


  const spId = "quality-sp";
  const spClass = "chord-quality-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that setIsPanelOpen had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setIsPanelOpen(prev =>  prev === spId ? "" : spId );
  };

  let chord = null
  const ClickChordQuality=(chordId)=>{
    try{
    const oldCF = cfUI
     chord = dc.HARMONY_MANAGER.chordWithId(chordId)
    
    // console.log("\nClickChordQuality chord: ", chord, "\noldCF", oldCF)
    const newCF = chord.getChordform({string : oldCF.string, form: oldCF.form, inversion: oldCF.inversion})
    // console.log("setting root for newCF: ", newCF, "oldCF.root: ", oldCF.root)
    newCF.root = oldCF.root
    // console.log("seting cfUI to newCF: " , newCF)


    setCFUI2(newCF)  
    }
    catch(e){
      console.log("\nClickChordQuality error: ", e, "\noldCF: ", oldCF, "\nchord: ", chord, "\ncf: ", newCF)
    }
    
  }

  const chords = dc.HARMONY_MANAGER.chords
  const major = chords.filter( (ch)=>ch.isMajor() )
  const dominant = chords.filter( (ch)=> ch.isDominant() )
  const minor = chords.filter( (ch)=>ch.isMinor() )

 
  // console.log("rendering QualityPanel cfUI: ", cfUI)
  return (
    cfUI && (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Quality</div>
          </div>


 {isPanelOpen === spId && (
          <div className="quality-picker-container picker-container">
            <div id="major" className="chord-picker-group picker-group">
              
              {major.map(ch => (
                <div
                  key={ch.id}

                  className={`chord-picker-group-item picker-group-item ${ch.id == cfUI.chord.id ? "selected" : ""}`}
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
                  className={`chord-picker-group-item picker-group-item ${ch.id == cfUI.chord.id ? "selected" : ""}`}
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
                  className={`chord-picker-group-item picker-group-item ${ch == cfUI.chord.id ? "selected" : ""}`}
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