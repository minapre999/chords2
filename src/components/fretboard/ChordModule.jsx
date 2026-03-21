import React, { useState, useEffect, useMemo } from "react";
import Toolbar from "../toolbar/toolbar.jsx";
import GuitarFretboardSVG from "./FretboardSVG.jsx";
import "../../globals.js";
 import ChordForm  from "../../harmony/harmony-manager.js"
 import {Chord}  from "../../harmony/harmony-manager.js"

// import Picker from "../picker/picker-manager.jsx";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";




function ChordInfo() {



  

  return (
    <>
     
        <div class="cc-main">
  <div class="current-chord-info fretboard-info">
            
    <div class="chord"> 
     

      <div>
      <span class="root">C</span><span class="quality">maj<sup>7</sup></span>
     
   
    </div> {/*<!-- current-chord-info --> */} 

    <div class="form-stringset">Drop 2, strings 2:5, inversion 1</div>

  </div> {/*<!-- chord --> */} 

         

            {/* <div class="edit-hide">
            <div class="equivalent-chords" style="display: none;">
              <div class="eq-chord-title">Equivalent to:</div>
              <div class="eq-chord eq-chord-1"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-2"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-3"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-4"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-5"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-6"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-7"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-8"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-9"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-10"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-11"> <span class="root"></span><span class="quality"></span></div>
              <div class="eq-chord eq-chord-12"> <span class="root"></span><span class="quality"></span></div>
            </div>
          </div> */}

      </div> {/*<!-- <!-- current-chord-info  --> */} 

       
      <div class="button-wrapper d-flex flex-row">

        {/* <!-- instrument dropdown  -->  */}
      {/* <div class="instrument-dropdown dropdown">
        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="instrument-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">guitar-acoustic</button>
        <div class="dropdown-menu" aria-labelledby="instrument-dropdown"><a class="dropdown-item instrument" data-value="guitar-nylon" href="#">guitar-nylon</a><a class="dropdown-item instrument" data-value="guitar-electric" href="#">guitar-electric</a><a class="dropdown-item instrument" data-value="guitar-acoustic" href="#">guitar-acoustic</a><a class="dropdown-item instrument" data-value="piano" href="#">piano</a><a class="dropdown-item instrument" data-value="bass-electric" href="#">bass-electric</a><a class="dropdown-item instrument" data-value="organ" href="#">organ</a></div>
      </div>  */}
      

      <div class="">
      
  </div> 


  </div> {/*<!-- cc-main  --> */}

   

    

</div>
    
    </>
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
  const [showNoteNamesUI, setShowNoteNamesUI] = useState(true);
  const [zoom, setZoom] = useState(1);
const [displayMode, setDisplayMode] = useState("singleInversion") // dislay one at a time or all at once
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
  }, []);


  



  useEffect(() => {
    async function init() {
      await dc.initialize();   // ⭐ wait for harmony data
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return <div>Loading chords…</div>;
  }





 



console.log("ChordModule dc.HARMONY_MANAGER: ", dc.HARMONY_MANAGER)
console.log("dc.HARMONY_MANAGER._dict: ", dc.HARMONY_MANAGER._dict)
console.log("dc.HARMONY_MANAGER.chordWithId( 1): ", dc.HARMONY_MANAGER.chordWithId( 1))

let activeChordformIndex = 0 
let highFret = false
let chord = dc.HARMONY_MANAGER.chordWithId( 1)// maj7
// let chordforms = chord.getChordforms({root: "C", form: "D2", string:  "1"})
// let cf = chordforms[activeChordformIndex]
// const [activeCFId, setActiveCFId] = useState(cf.id)

 
//         // load all inversions for the chord - default to drop2 and top string
// let root = "C"




  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
 
    <Toolbar
      // onOpenPanel={() => setShowPanel(true)}
      stringColorUI={stringColorUI}
      setStringColorUI={setStringColorUI}
      zoom={zoom}
      setZoom={setZoom}
      showNoteNamesUI={showNoteNamesUI}
      setShowNoteNamesUI={setShowNoteNamesUI}
      showOpenStringsUI={showOpenStringsUI}
      setShowOpenStringsUI={setShowOpenStringsUI}
      showHeadstockUI={showHeadstockUI}
      setShowHeadstockUI={setShowHeadstockUI}
    />

<div id="content">

    <GuitarFretboardSVG
      width={1800}
      height={220}
      fretboardColor={fretboardColor}
      stringColor={stringColor}
      fretboardImage={fretboardImage}
      // onOpenPanel={() => setShowPanel(true)}
      stringColorUI={stringColorUI}
      zoom={zoom}
      setZoom={setZoom}
      showNoteNamesUI={showNoteNamesUI}
      showOpenStringsUI={showOpenStringsUI}
      showHeadstockUI={showHeadstockUI}
    />


<ChordInfo />
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
