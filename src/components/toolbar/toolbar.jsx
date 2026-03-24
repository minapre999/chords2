import React, { useState, useEffect, useRef, useMemo } from "react";
import OpenPicker from "../picker/picker-manager"



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

      cfUI, setCFUI2,
    
    chordRootUI, setChordRootUI,
      chordStringUI, setChordStringUI,


}) {


//  console.log("Toolbar chordRootUI: ", chordRootUI)


  
  
  
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
  


const CHORDS = {
  G:  [3, 2, 0, 0, 0, 3],
  D:  [null, null, 0, 2, 3, 2],
  C:  [null, 3, 2, 0, 1, 0],
  Em: [0, 2, 2, 0, 0, 0],
  Am: [null, 0, 2, 2, 1, 0],
  E:  [0, 2, 2, 1, 0, 0],
};

// console.log('Toolbar cfUI:', cfUI)
  return (
    <div className="toolbar">
        
    

       {/* TOOLBAR */}
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        background: "#222",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "16px",
        zIndex: 99,
        color: "white",
        borderBottom: "1px solid #444",
      }}
    >

      <OpenPicker  
  
        cfUI={cfUI}
      setCFUI2={setCFUI2}
      chordRootUI={chordRootUI}
      setChordRootUI={setChordRootUI}
      chordStringUI={chordStringUI}
      setChordStringUI={setChordStringUI}

        />

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

      {/* Note names */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showNoteNamesUI}
          onChange={(e) => setShowNoteNamesUI(e.target.checked)}
        />
        Note names
      </label>

      {/* Open strings */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showOpenStringsUI}
          onChange={(e) => setShowOpenStringsUI(e.target.checked)}
        />
        Open strings
      </label>

      {/* Zoom controls */}
      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>–</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>

      {/* Headstock toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showHeadstockUI}
          onChange={(e) => setShowHeadstockUI(e.target.checked)}
        />
        Show headstock
      </label>



<select onChange={(e) => {
        const name = e.currentTarget.value 
        console.log("onChange setting active chord to: ", name)
        console.log(CHORDS[name])
         setActiveChord(CHORDS[name])}
                    }>
  <option value="">None</option>
  {Object.keys(CHORDS).map((name) => (
    <option key={name} value={name}>{name}</option>
  ))}
</select>


<label>
  <input
    type="checkbox"
    checked={showChord}
    onChange={(e) => setShowChord(e.target.checked)}
  />
  Highlight chord
</label>

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
