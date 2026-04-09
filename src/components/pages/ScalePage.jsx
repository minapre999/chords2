
import React, { useState, useEffect, useMemo, useRef } from "react";
import dc from '/src/globals.js' // need to import first as it sets up database
import Scale, {ScaleManager, ScaleDictionary} from "/src/harmony/scale-manager.js"
import Toolbar from "/src/components/toolbar/toolbar.jsx";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import RenderData, {RenderNote} from "/src/render-notes.js"
import ScaleInfo from "/src/components/scale/ScaleInfo.jsx"
import "/src/harmony/scale-manager.js"
import "/src/components/pages/ScalePage.css"
import ScaleControlPanel from "/src/components/ControlPanel/ScaleControlPanel.jsx"


export default function ScalePage( props ) {

  const { setRenderDataUI, showOpenStringsUI,
     setShowOpenStringsUI, showInlaysUI, setShowInlaysUI, 
     ...rest} = props



       // zoom persistence - zoom is used for scales so persist as different variable
       
       const zoomScope="scale-module"
       const storageKey = `fretboard.zoom.${zoomScope}`
       const [zoom, setZoom] = useState(() => {
         const stored = localStorage.getItem(storageKey);
         return stored ? Number(stored) : 1;
       });
     
       useEffect(() => {
         localStorage.setItem(storageKey, zoom);
       }, [zoom, storageKey]);
     


    // active scale note being displayed / played
  const [scaleNoteName, setScaleNoteName] = useState(null)
  const [ready, setReady] = useState(false);
  const [scaleChoiceUI, setScaleChoiceUI] = useState(null);

    // zoom persistence - zoom is used for scales so persist as different variable
  //  useEffect(() => {
  //      if( !isNaN(Number(zoom))) {
  //        console.log("setting scale zoom to ", zoom)
  //      localStorage.setItem("scaleZoom", zoom);}
  //    }, [zoom]);
   

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
    // const zoomVal = isNaN(Number(localStorage.getItem("scaleZoom"))) ? 1 : localStorage.getItem("scaleZoom")
    // console.log("zoomVal from storage on page load", zoomVal)
    // setZoom(zoomVal)  


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
    scale.setRoot( scaleRootUI)
     

  const rData = new RenderData()
   
    if (scale?.id !== undefined) {
       console.log("getting render data for scale ", scale, " with id: ", scale.id, 
        " root: ", scale.root , " form: ", scale.form)   
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
        console.log("SCALE RENDER DATA: ", rData)
        setRenderDataUI( rData);
      }      

    }, [ready, scaleModeUI, scaleQualityUI, scaleFormUI, scaleRootUI]);
  
    
   


  // -------------------------
  // CONDITIONAL RETURN
  // -------------------------
  if (!ready) {
    return <div>Loading scales…</div>;
  }


const scaleProps={
  scaleRootUI: scaleRootUI, setScaleRootUI: setScaleRootUI,
  scaleModeUI: scaleModeUI, setScaleModeUI: setScaleModeUI,
  scaleQualityUI: scaleQualityUI, setScaleQualityUI: setScaleQualityUI,
  scaleFormUI: scaleFormUI, setScaleFormUI: setScaleFormUI,

}
  
return (

    
<div className="page-wrapper"
 style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
    <Toolbar
      {...props}
     {...scaleProps}
      page="scales"
     ScaleNoteName={scaleNoteName}   setScaleNoteName={setScaleNoteName}
      zoom={zoom}                     setZoom={setZoom}

    />


  <div className="page-content">
    <FretboardSVG
      {...props}
           {...scaleProps}

      setRenderDataUI={setRenderDataUI}
      scaleNoteName={scaleNoteName}   setScaleNoteName={setScaleNoteName}
      width={1800}                    height={220}
      zoom={zoom}                     setZoom={setZoom}

      // showNoteNamesUI={showNoteNamesUI}
      // showAllNotesUI={showAllNotesUI}
      // noteMode={noteMode}
      />
      
    
    <div className="scale-content-wrapper">
      <ScaleControlPanel 
      {...props} 
      {...scaleProps}
      />

      <ScaleInfo
      {...props} 
      {...scaleProps}
  />
    </div>
  </div>
</div>
)
}