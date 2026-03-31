import React, { useState, useEffect, useRef, useMemo } from "react"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "bootstrap/dist/css/bootstrap.min.css"

import "./toolbar.css"
import "./note-mode.css"
import NoteMode from "./chord-tools/NoteMode.jsx"
import InversionNavigator from "./inv-navigator.jsx"
import FormSSNavigator from "./form-ss-navigator.jsx"
import ChordPicker from "./chord-tools/ChordPicker.jsx"


export default function Toolbar({ 
    onOpenPanel,
    stringColorUI, setStringColorUI,
    bassStringColorUI, setBassStringColorUI,
    showNoteNamesUI, setShowNoteNamesUI,
    showOpenStringsUI, setShowOpenStringsUI,
    zoom, setZoom,
    openMarkers, setOpenMarkers,
    showHeadstockUI, setShowHeadstockUI,
    showInlaysUI, setShowInlaysUI,
    activeChord, setActiveChord,
    showChord, setShowChord,

      cfUI, setCFUI,
    
    chordRootUI, setChordRootUI,
      chordStringUI, setChordStringUI,
noteMode, setNoteMode

}) {




  
  
  useEffect(() => {
    localStorage.setItem("showChord", showChord);
  }, [showChord]);
  
  
  
  
  // This runs automatically whenever the user toggles the show headstock checkbox.
  useEffect(() => {
    localStorage.setItem("showHeadstockUI", showHeadstockUI);
  }, [showHeadstockUI]);
  
  // This runs automatically whenever the user toggles the inlay checkbox.
  useEffect(() => {
    localStorage.setItem("showInlaysUI", showInlaysUI);
  }, [showInlaysUI]);
  



console.log("Rendering InversionNavigator");

// console.log('Toolbar cfUI:', cfUI)
  return (
    <div className="toolbar">
        
    

       {/* TOOLBAR */}
    <div className="toolbar-inner"
     
    >


            {/* Zoom controls */}
      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>–</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>




      <ChordPicker  className="toolbar-btn" 
  
        cfUI={cfUI}
      setCFUI={setCFUI}
      chordRootUI={chordRootUI}
      setChordRootUI={setChordRootUI}
      chordStringUI={chordStringUI}
      setChordStringUI={setChordStringUI}

        >
            <img src="/img/chord-icon.svg" className="toolbar-icon" />
        </ChordPicker>

      {/* Fretboard colour
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Fretboard:
        <input
          type="color"
          value={fretboardColorUI}
          onChange={(e) => setFretboardColorUI(e.target.value)}
        />
      </label> */}

   


      {/* String colours  - toolbar sends update to the parent */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Strings:
        <input
          type="color"
          value={stringColorUI}

          onChange={(e) => setStringColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Bass:
        <input
          type="color"
          value={bassStringColorUI}
          onChange={(e) => setBassStringColorUI(e.target.value)}
        />
      </label>

      {/* Inlays */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showInlaysUI}
          onChange={(e) => {console.log("toolbox inlays"); 
            setShowInlaysUI(e.target.checked)}}
        />
        Inlays
      </label>

  

  <InversionNavigator
  cfUI={cfUI}
  setCFUI={setCFUI}
  // onPrev={() => setCFUI(cfUI.prevForm())}
  // onNext={() => setCFUI(cfUI.nextForm())}
/>

<FormSSNavigator
 cfUI={cfUI}
  setCFUI={setCFUI}
/>



    <NoteMode 
    noteMode={noteMode}
    setNoteMode={setNoteMode}
    />




      {/* Open strings */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showOpenStringsUI}
          onChange={(e) => setShowOpenStringsUI(e.target.checked)}
        />
        Open strings
      </label>


      {/* Headstock toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showHeadstockUI}
          onChange={(e) => setShowHeadstockUI(e.target.checked)}
        />
        Show headstock
      </label>



{/* <select onChange={(e) => {
        const name = e.currentTarget.value 
        console.log("onChange setting active chord to: ", name)
        console.log(CHORDS[name])
         setActiveChord(CHORDS[name])}
                    }>
  <option value="">None</option>
  {Object.keys(CHORDS).map((name) => (
    <option key={name} value={name}>{name}</option>
  ))}
</select> */}

{/* 
<label>
  <input
    type="checkbox"
    checked={showChord}
    onChange={(e) => setShowChord(e.target.checked)}
  />
  Highlight chord
</label> */}

<label style={{ display: "flex", alignItems: "center", gap: 6 }}>
  <input
    type="checkbox"
    checked={openMarkers}
    onChange={(e) => setOpenMarkers(e.target.checked)}
  />
  Show open/muted markers
</label>
    </div>





    {/* SPACER BELOW TOOLBAR */}
    <div style={{ height: "48px" }} />

    
    </div>
  );
}
