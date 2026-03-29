

import React, { useState, useEffect, useMemo } from "react";
import dc from '/src/globals.js' // need to import first as it sets up database
import Scale, {ScaleManager, ScaleDictionary} from "/src/harmony/scale-manager.js"
import Toolbar from "/src/components/toolbar/toolbar.jsx";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";

import "/src/harmony/scale-manager.js"

import "./ScaleModule.css"

export default function ScaleModule( props) {

    // active scale note being displayed / played
  const [scaleNote, setScaleNote] = useState(null)
  const [ready, setReady] = useState(false);
  const [scaleChoiceUI, setScaleChoiceUI] = useState({root: "C", quality: "Maj", form: "1"});
  const [zoom, setZoom] = useState(1);

useEffect(() => {
  // console.log("Effect triggered: chordRootUI =", chordRootUI);

  try {
 
    PlayNote(scaleNote);
  } catch (e) {
    // console.error("Effect error:", e);
  }
}, [scaleNote]);



useEffect(() => {
  let cancelled = false;   // 1. Track whether the component is still mounted
  if( dc.SCALE_MANAGER == null) dc.SCALE_MANAGER = new ScaleManager() 

  async function init() {
    await dc.SCALE_MANAGER.load_scales();       // 2. Wait for the real load
    if (!cancelled) setReady(true);             // 3. Only update state if mounted
  }

  init();                                       // 4. Kick off the async load

  return () => { cancelled = true };            // 5. Cleanup: mark as unmounted
}, []);





// -------------------------
  // CONDITIONAL RETURN
  // -------------------------
  if (!ready) {
    return <div>Loading scales…</div>;
  }

   
  const sDict = dc.SCALE_MANAGER.activeDict
  const scale = sDict.scaleWithQualityAndForm(scaleChoiceUI.quality, scaleChoiceUI.form)
  scale.setRoot(scaleChoiceUI.root)

  return (

    
<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
  <Toolbar
    {...props}
    page="scales"
    scaleChoiceUI={scaleChoiceUI}
    setScaleChoiceUI={setScaleChoiceUI}
    scaleNote={scaleNote}
    setScaleNote={setScaleNote}
    zoom={zoom}
    setZoom={setZoom}

  />


  <div id="content">
 <FretboardSVG
  {...props}
    scaleChoiceUI={scaleChoiceUI}
    setScaleChoiceUI={setScaleChoiceUI}
    scaleNote={scaleNote}
    setScaleNote={setScaleNote}
    width={1800}
    height={220}
    zoom={zoom}
    setZoom={setZoom}
    // showNoteNamesUI={showNoteNamesUI}
    // showAllNotesUI={showAllNotesUI}
    // noteMode={noteMode}
    />
    
  </div>
    
</div>
)
}