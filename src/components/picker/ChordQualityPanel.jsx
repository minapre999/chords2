  import React, { useState, useEffect } from "react";

  import ChordForm  from "../../harmony/harmony-manager.js"
  import {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"

export default function ChordQualityPanel({

  cfUI,
  setCFUI,
  onKeyClick,
  forceAll
}) {


  const [isPanelOpen, setIsPanelOpen] = useState(true);
const [isOpen, setIsOpen] = useState(true);

  // console.log("\ChordQualityPanel component forceAll: ", forceAll, "\nisOpen:", isOpen, "\ncfUI: ", cfUI, "setCFUI: ", setCFUI)



 // Respond to global force command
  useEffect(() => {
    if (forceAll === "open") setIsOpen(true);
    if (forceAll === "close") setIsOpen(false);
  }, [forceAll]);

const toggle = () => setIsOpen(prev => !prev);

 

  let chord = null
  let newCF = null
  const ClickChordQuality=(chordId)=>{
    try{
   


    // problem here is what is the chord does not have forms or inversions similar to the old chord form?
    // solution: first get the relevant chord form from the same
     chord = dc.HARMONY_MANAGER.chordWithId(chordId) // should always return, b/c it was set in the render
     //dc.HARMONY_MANAGER.chordsWithSymbol()
    // console.log("\nClickChordQuality chord: ", chord, "\noldCF", cfUI)
     newCF = chord.getChordform({string : cfUI.string, form: cfUI.form, inversion: cfUI.inversion})
    // console.log("setting root for newCF: ", newCF, "oldCF.root: ", cfUI.root)

    if( typeof newCF === "undefined" ){
      console.log("no chordforms found for string and inversion so returns first chordform in array: ", dc.HARMONY_MANAGER.chordforms)
        newCF = dc.HARMONY_MANAGER.chordforms[0]
    }
    newCF.root = cfUI.root
    // console.log("seting cfUI to newCF: " , newCF)


    setCFUI(newCF)  
    }
    catch(e){
      console.log("\nClickChordQuality error: ", e, "\cfUI: ", cfUI, "\nchord: ", chord, "\ncf: ", newCF)
    }
    
  }

  const chords = dc.HARMONY_MANAGER.chords
  // for some reason there are still some chords with no chordforms so check for chordforms.length
  const major = chords.filter( (ch)=>ch.isMajor() && ch.chordforms.length )
  const dominant = chords.filter( (ch)=> ch.isDominant() && ch.chordforms.length )
  const minor = chords.filter( (ch)=>ch.isMinor() && ch.chordforms.length )

  const spId = "quality-sp";
  const spClass = "chord-quality-subpanel subpanel";


  // console.log("rendering ChordQualityPanel cfUI: ", cfUI)
  return (
    cfUI && (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={toggle}>
            <div className="title">Quality</div>
          </div>


 {isOpen  && (
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