import React, { useState, useEffect, useMemo } from "react";
import Toolbar from "/src/components/toolbar/toolbar.jsx";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import "/src/globals.js";
 import ChordForm  from "../../harmony/harmony-manager.js"
 import {Chord}  from "../../harmony/harmony-manager.js"
import ChordInfo from "./chord-info.jsx"

import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
import {PlayChord} from "/src/sound/Play.js"




export default function ChordModule(
  props
) { 

  const {showOpenStringsUI, setShowOpenStringsUI, showInlaysUI, setShowInlaysUI, ...rest} = props

//Always put hooks at the top of the component, before any conditional return.
   const [fretboardColor, setFretboardColor] = useState("#4a2619");
  const [fretboardImage, setFretboardImage] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  const [showNoteNamesUI, setShowNoteNamesUI] = useState(true);


  const [openMarkers, setOpenMarkers] = useState(true);
  const [showAllNotesUI, setShowAllNotesUI] = useState(false);
  const [zoom, setZoom] = useState(1);
const [displayMode, setDisplayMode] = useState("singleInversion") // dislay one at a time or all at once
const [cfUI, setCFUI] = useState(null)
const [chordRootUI, setChordRootUI] = useState("C")
const [chordStringUI, setChordStringUI] = useState("1") // "D2:1"
const [noteMode, setNoteMode] = useState("note");


  

   const [ready, setReady] = useState(false);

     // Open markers persistence
  useEffect(() => {
    localStorage.setItem("openMarkers", openMarkers);
  }, [openMarkers]);

  useEffect(() => {
    const saved = localStorage.getItem("openMarkers");
    if (saved !== null) setOpenMarkers(saved === "true");
  }, []); // runs once only


 useEffect(() => {
  // console.log("Effect triggered: chordRootUI =", chordRootUI);

  try {
 
    PlayChord(cfUI);
  } catch (e) {
    // console.error("Effect error:", e);
  }
}, [chordRootUI, cfUI]);



  // useEffect(() => {

  // }, [chordRootUI]);


 useEffect(() => {
    async function init() {
      console.log("ChordModule load_harmonies")
      await dc.HARMONY_MANAGER.load_harmonies();
      console.log("ChordModule ready")
      setReady(true);
    }
    init();
  }, []);




   // -------------------------
  // SAFE COMPUTATION OF cf
  // (must be BEFORE conditional return)
  // -------------------------
  let cf = null;
let formLabel = "";
let strCF = "";


  if (ready) {
      const chord = dc.HARMONY_MANAGER.chordsWithSymbol("maj7")[0]

     cf = chord.getChordform({quality: "maj7", string: "1", form: "D2", inversion: "3"})
    cf.root=chordRootUI


    // console.log("cf: ", cf)

    // Map form → label
    const formLabels = {
      D2: "Drop 2",
      D3: "Drop 3",
      D4: "Drop 2+4",
    };

    // Get the label safely
    const formKey = cf.form;
     formLabel = formLabels[formKey] || formKey;

    // Build the final string
     strCF = `${formLabel}, strings ${cf.stringset}, inversion ${cf.inversion}`;

// console.log("strCF: ", strCF)

  }

  // -------------------------
  // EFFECT THAT USES cf
  // (hooks must be before return)
  // -------------------------
  useEffect(() => {
    // console.log("ChordModule useEffect for setCFUI: cf", cf)
    if (cf?.id !== undefined) {
      // console.log("ChordModule Setting cfUI: ", cf, "cf.root: ", cf.root)

      setCFUI(cf);

            // console.log("ChordModule complet setting cfUI: ", cfUI, "cfUI.root", cfUI)


    }
  }, [cf]);





  // -------------------------
  // CONDITIONAL RETURN
  // -------------------------
  if (!ready) {
    return <div>Loading chords…</div>;
  }

  // -------------------------
  // NOW SAFE TO USE cf
  // -------------------------
  // console.log("ChordModule checking harmony is loaded", cf);
// console.log('ChordModule cfUI:', cfUI)


  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
 
    <Toolbar
      {...props}
      page="chords"
      cfUI={cfUI}
      setCFUI={setCFUI}

      chordRootUI={chordRootUI}
      setChordRootUI={setChordRootUI}
      chordStringUI={chordStringUI}
      setChordStringUI={setChordStringUI}
   
      zoom={zoom}
      setZoom={setZoom}
      showNoteNamesUI={showNoteNamesUI}
      setShowNoteNamesUI={setShowNoteNamesUI}
      showAllNotesUI={showAllNotesUI}
      setShowAllNotesUI={setShowAllNotesUI}
  
  
      noteMode={noteMode}
      setNoteMode={setNoteMode}
    />

<div id="content">

    <FretboardSVG
  {...props}
        cfUI={cfUI}
      
      chordRootUI={chordRootUI}
      width={1800}
      height={220}
      fretboardColor={fretboardColor}
      fretboardImage={fretboardImage}
  
      zoom={zoom}
      setZoom={setZoom}
      showNoteNamesUI={showNoteNamesUI}
      showAllNotesUI={showAllNotesUI}
   
      noteMode={noteMode}
    />


   
    <ChordInfo   cfUI={cfUI}  />

    {/* {showPanel && (
      <Picker
        options={pickerOptions}
        onClose={() => setShowPanel(false)}
      />
    )} */}

    


</div> 
  </div>
);

}
