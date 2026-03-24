import React, { useState, useEffect, useMemo } from "react";
import Toolbar from "../toolbar/toolbar.jsx";
import GuitarFretboardSVG from "./FretboardSVG.jsx";
import "../../globals.js";
 import ChordForm  from "../../harmony/harmony-manager.js"
 import {Chord}  from "../../harmony/harmony-manager.js"

// import Picker from "../picker/picker-manager.jsx";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
import {PlayChord} from "../../sound/Play.js"



function ChordInfo({
    cfUI,
   
      chordRootUI,
      setChordRootUI
}) {
  if(!cfUI ) return( <></> )


  // let cf = dc.HARMONY_MANAGER.chordformWithId(cfUI);
  // cf.root=chordRootUI
  // let chord = dc.HARMONY_MANAGER.chordformWithId( cfUI );
  let chord = cfUI.chord
    // let chordforms = chord.getChordforms({ root: "C", form: "D2", string: "1" });
  // chord.root=cfUI.root

    // console.log("cf: ", cf)

    // Map form → label
    const formLabels = {
      D2: "Drop 2",
      D3: "Drop 3",
      D4: "Drop 2+4",
    };

    // Get the label safely
    const formKey = cfUI.form;
    const formLabel = formLabels[formKey] || formKey;
    // Build the final string
     const strCF = `${formLabel}, strings ${cfUI.stringset}, inversion ${cfUI.inversion}`;

// console.log("ChordInfo Chord root: ", chordRootUI, "strCF: ", strCF)

  return ( cfUI && (
        <>
            <div className="mb-4">&nbsp;</div>

            <div>
            {cfUI.root}
            <span
              dangerouslySetInnerHTML={{
                __html: cfUI.chord.harmony.symbols[0]
              }}
            />
          </div>
          <div />
          <div>{strCF}</div>
      </>
      )
  );
}



export default function ChordModule() {
//Always put hooks at the top of the component, before any conditional return.
   const [fretboardColor, setFretboardColor] = useState("#4a2619");
  const [stringColor, setStringColor] = useState("#d0d0d0");
  const [fretboardImage, setFretboardImage] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [stringColorUI, setStringColorUI] = useState("silver");
  const [bassStringColorUI, setBassStringColorUI] = useState("#d4af37");
  const [showOpenStringsUI, setShowOpenStringsUI] = useState(true);
  const [openMarkers, setOpenMarkers] = useState(true);
  const [showAllNotesUI, setShowAllNotesUI] = useState(false);
  const [showNoteNamesUI, setShowNoteNamesUI] = useState(true);
  const [zoom, setZoom] = useState(1);
const [displayMode, setDisplayMode] = useState("singleInversion") // dislay one at a time or all at once
const [cfUI, setCFUI] = useState(null)
const [chordRootUI, setChordRootUI] = useState("C")
const [chordStringUI, setChordStringUI] = useState("1") // "D2:1"

  // Headstock persistence
  const [showHeadstockUI, setShowHeadstockUI] = useState(() => {
    const saved = localStorage.getItem("showHeadstockUI");
    return saved === null ? true : saved === "true";
  });
  const [showInlaysUI, setShowInlaysUI] = useState(() => {
    const saved = localStorage.getItem("showInlaysUI");
    return saved === null ? true : saved === "true";
  });

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
      // console.log("ChordModule Setting cfUI: ", cf.id)

      setCFUI(cf);
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
  

      cfUI={cfUI}
      setCFUI={setCFUI}

      chordRootUI={chordRootUI}
      setChordRootUI={setChordRootUI}
      chordStringUI={chordStringUI}
      setChordStringUI={setChordStringUI}
      // onOpenPanel={() => setShowPanel(true)}
      stringColorUI={stringColorUI}
      setStringColorUI={setStringColorUI}
      bassStringColorUI={bassStringColorUI}
      setBassStringColorUI={setBassStringColorUI}
      zoom={zoom}
      setZoom={setZoom}
      showNoteNamesUI={showNoteNamesUI}
      setShowNoteNamesUI={setShowNoteNamesUI}
      showAllNotesUI={showAllNotesUI}
      setShowAllNotesUI={setShowAllNotesUI}
      showOpenStringsUI={showOpenStringsUI}
      setShowOpenStringsUI={setShowOpenStringsUI}
      showHeadstockUI={showHeadstockUI}
      setShowHeadstockUI={setShowHeadstockUI}
      showInlaysUI={showInlaysUI}
      setShowInlaysUI={setShowInlaysUI}

    />

<div id="content">

    <GuitarFretboardSVG

        cfUI={cfUI}
      
      chordRootUI={chordRootUI}
      width={1800}
      height={220}
      fretboardColor={fretboardColor}
      stringColor={stringColor}
      fretboardImage={fretboardImage}
      // onOpenPanel={() => setShowPanel(true)}
      stringColorUI={stringColorUI}
       bassStringColorUI={bassStringColorUI}
      zoom={zoom}
      setZoom={setZoom}
      showNoteNamesUI={showNoteNamesUI}
      showAllNotesUI={showAllNotesUI}
      showOpenStringsUI={showOpenStringsUI}
      showHeadstockUI={showHeadstockUI}
      showInlaysUI={showInlaysUI}
    />


    <ChordInfo 
  
        cfUI={cfUI}
      setCFUI={setCFUI}


      chordRootUI={chordRootUI}
      setChordRootUI={setChordRootUI}
    />

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
