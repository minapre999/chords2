
import React, { useState, useEffect, useMemo, useRef } from "react";
import dc from '/src/globals.js' // need to import first as it sets up database
import Scale, {ScaleManager, ScaleDictionary} from "/src/harmony/scale-manager.js"
import Toolbar from "/src/components/toolbar/toolbar.jsx";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import RenderData, {RenderNote} from "/src/render-notes.js"
import ScaleInfo from "/src/components/scale/ScaleInfo.jsx"
import "/src/harmony/scale-manager.js"
import "/src/components/scale/ScaleModule.css"



export default function ScalePage( props ) {

  const {setRenderDataUI, showOpenStringsUI, setShowOpenStringsUI, showInlaysUI, setShowInlaysUI, ...rest} = props

    // active scale note being displayed / played
  const [scaleNoteName, setScaleNoteName] = useState(null)
  const [ready, setReady] = useState(false);
  const [scaleChoiceUI, setScaleChoiceUI] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [scaleChanged, setScaleChanged] = useState(1)
/* too many problems using objects as useState.  It requires deep cloning for react to recognise change
This is causing issues with lag in interface possible due to React seeing a new reference every timne
and re-rerending
Best solution is to only store primitives in the useState
  */
const [scaleQualityUI, setScaleQualityUI] = useState("Maj")
const [scaleModeUI, setScaleModeUI] = useState("Major")
const [scaleRootUI, setScaleRootUI] = useState("C")
const [scaleFormUI, setScaleFormUI] = useState("1")


useEffect(() => {
  // console.log("Effect triggered: chordRootUI =", chordRootUI);

  try {
 
    // PlayNote(scaleNote);
  } catch (e) {
    // console.error("Effect error:", e);
  }
}, [scaleNoteName]);



useEffect(() => {
  let cancelled = false;   // 1. Track whether the component is still mounted
  if( dc.SCALE_MANAGER == null) dc.SCALE_MANAGER = new ScaleManager() 

  async function init() {
    await dc.SCALE_MANAGER.load_scales();       // 2. Wait for the real load
    // console.log("AFTER AWAIT")
    // console.log(".load_scales complete. sDict", dc.SCALE_MANAGER.activeDict , "scales: ", dc.SCALE_MANAGER.activeDict.scales )
    if (!cancelled) setReady(true);             // 3. Only update state if mounted
  }

  init();                                       // 4. Kick off the async load

  return () => { cancelled = true };            // 5. Cleanup: mark as unmounted
}, []);


  

  // -------------------------
  // EFFECT THAT USES cf
  // (hooks must be before return)
  // -------------------------
  // useEffect(() => {
  //   // console.log("ChordModule useEffect for setCFUI: cf", cf)
  //   if (scale?.id !== undefined) {
  //     // console.log("ChordModule Setting cfUI: ", cf, "cf.root: ", cf.root)

      
  //     setScaleChoiceUI({root: scale.root, quality: scale.quality, form: scale.form})
  //     setScaleChanged(scale.id)
  //     // setScaleChanged(1)
  //   }
  // }, [scaleUI]);

  

  useEffect(() => {
  
     if (!ready) return;

    const sDict = dc.SCALE_MANAGER.activeDict 
    // console.log("dict scales: ", sDict.scales)

    const scale = sDict.scaleWithQualityAndForm(scaleQualityUI,scaleFormUI)
    scale.mode = scaleModeUI
    scale.root= scaleRootUI
     

  const rData = new RenderData()
   
    if (scale?.id !== undefined) {
      //  console.log("getting render data for scale: ", scale)   
      scale.notes.forEach((n)=>{
  
          let fillColor = 'gray'
          // if(n.interval=="1" ) { fillColor = dc.ROOT_NOTE_COLOR}  
          //     else if(n.interval=="3"){ fillColor=dc.THIRD_NOTE_COLOR}  
          //     else if(n.interval=="5"){ fillColor=dc.FIFTH_NOTE_COLOR}  
          //     else if(n.interval=="7"){ fillColor=dc.SEVENTH_NOTE_COLOR} 
  
          let text = n.letter 

          // let text = ""
            // if(noteMode == "note") { text = n.letter } 
            //   else if (noteMode == "interval"){text= n.interval } 
            //   else if (noteMode == "fingering"){ text= n.finger }
  
            let color = 'white'
            const rn = new RenderNote({fillColor: fillColor, note: n, color: color, width: 18, text: text })
          rData.add(rn, n.stringNumber)
          })
  
   // if this doesn't work may need to create a boolean primitive to flag needs rendering
          setRenderDataUI( rData);
      }      

    }, [ready, scaleModeUI, scaleQualityUI, scaleFormUI, scaleRootUI]);
  
    
   


  // -------------------------
  // CONDITIONAL RETURN
  // -------------------------
  if (!ready) {
    return <div>Loading scales…</div>;
  }



  
  return (

    
<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
  <Toolbar
    {...props}
    page="scales"
    scaleRootUI={scaleRootUI}       setScaleRootUI={setScaleRootUI}
    scaleModeUI={scaleModeUI}       setScaleModeUI={setScaleModeUI}
    scaleQualityUI={scaleQualityUI} setScaleQualityUI={setScaleQualityUI}
    scaleFormUI={scaleFormUI}       setScaleFormUI={setScaleFormUI}
    scaleNoteName={scaleNoteName}   setScaleNoteName={setScaleNoteName}
    zoom={zoom}                     setZoom={setZoom}

  />


  <div id="content">
 <FretboardSVG
    {...props}
    setRenderDataUI={setRenderDataUI}
    scaleRootUI={scaleRootUI}       setScaleRootUI={setScaleRootUI}
    scaleModeUI={scaleModeUI}       setScaleModeUI={setScaleModeUI}
    scaleQualityUI={scaleQualityUI} setScaleQualityUI={setScaleQualityUI}
    scaleFormUI={scaleFormUI}       setScaleFormUI={setScaleFormUI}
    scaleNoteName={scaleNoteName}   setScaleNoteName={setScaleNoteName}
    width={1800}                    height={220}
    zoom={zoom}                     setZoom={setZoom}
    // showNoteNamesUI={showNoteNamesUI}
    // showAllNotesUI={showAllNotesUI}
    // noteMode={noteMode}
    />
    
  </div>
   <ScaleInfo
   {...props} 
    scaleRootUI={scaleRootUI}       setScaleRootUI={setScaleRootUI}
    scaleModeUI={scaleModeUI}       setScaleModeUI={setScaleModeUI}
    scaleQualityUI={scaleQualityUI} setScaleQualityUI={setScaleQualityUI}
    scaleFormUI={scaleFormUI}       setScaleFormUI={setScaleFormUI}
   />
</div>
)
}