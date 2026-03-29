import React, { useState, useEffect, useMemo } from "react";
import Toolbar from "/src/components/toolbar/toolbar.jsx";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import "/src/globals.js";
 import ChordForm  from "/src/harmony/harmony-manager.js"
 import {Chord}  from "/src/harmony/harmony-manager.js"
import ChordInfo from "./ChordInfo.jsx"


import ReactDOM from "react-dom/client";
import {PlayChord} from "/src/sound/Play.js"
import RenderData, {RenderNote} from "/src/render-notes.js"



export default function ChordModule(
  props
) { 

  const {setRenderDataUI, showOpenStringsUI, setShowOpenStringsUI, showInlaysUI, setShowInlaysUI, ...rest} = props

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
const [cfChanged, setCFChanged] = useState(null)
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
  let cancelled = false;   // 1. Track whether the component is still mounted

  async function init() {
    await dc.TUNING_MANAGER.load_tuning();  // 2. Wait for the real load
    await dc.HARMONY_MANAGER.load_harmonies();  // 2. Wait for the real load
    if (!cancelled) setReady(true);             // 3. Only update state if mounted
  }

  init();                                       // 4. Kick off the async load

  return () => { cancelled = true };            // 5. Cleanup: mark as unmounted
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
      setCFChanged(cf.id)
            // console.log("ChordModule complet setting cfUI: ", cfUI, "cfUI.root", cfUI)

    }
  }, [cf]);



  useEffect(() => {

const rData = new RenderData()

  if (cfUI?.id !== undefined) {
        
    cfUI.notes.forEach((n)=>{

        let fillColor = dc.DEFAULT_NOTE_COLOR
        if(n.interval=="1" ) { fillColor = dc.ROOT_NOTE_COLOR}  
            else if(n.interval=="3"){ fillColor=dc.THIRD_NOTE_COLOR}  
            else if(n.interval=="5"){ fillColor=dc.FIFTH_NOTE_COLOR}  
            else if(n.interval=="7"){ fillColor=dc.SEVENTH_NOTE_COLOR} 


        let text = ""
          if(noteMode == "note") { text = n.letter } 
            else if (noteMode == "interval"){text= n.interval } 
            else if (noteMode == "fingering"){ text= n.finger }

          let color = 'white'
          const rn = new RenderNote({fillColor: fillColor, note: n, color: color, width: 18, text: text })
        rData.add(rn, n.stringNumber)
        })


        setRenderDataUI( rData);
    }      
    // depending on cfUI is a bit hit and miss.  It doesn't always update and it
    // has something to do with object references.  Thus, the cfChanged useState
    // which take the id of the cfUI
  }, [ cfUI, cfChanged, noteMode, chordRootUI]);





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


// function noteNameFromMidi(midi, { preferSharps = true } = {}) {
//   const names = preferSharps ? NOTE_NAMES_SHARPS : NOTE_NAMES_FLATS;
//   const idx = ((midi % 12) + 12) % 12;
//   return names[idx];
// }



  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
 
    <Toolbar
      {...props}
      page="chords"
      cfUI={cfUI}
      setCFUI={setCFUI}
      cfChanged={cfChanged} setCFChanged={setCFChanged}

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
