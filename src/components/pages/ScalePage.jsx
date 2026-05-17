
import React, { useState, useEffect, useMemo, useRef } from "react";
import dc from '/src/globals.js' // need to import first as it sets up database
import Scale, {ScaleManager, ScaleDictionary} from "/src/harmony/scale-manager.js"
import Toolbar from "/src/components/toolbar/toolbar.jsx";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import {RenderNote, RenderData} from "/src/render-notes.js"
import ScaleInfo from "/src/components/scale/ScaleInfo.jsx"
import "/src/harmony/scale-manager.js"
import "/src/components/pages/ScalePage.css"
import ScaleControlTab from "/src/components/ControlPanel/scale-panels/ScaleControlTab.jsx"
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";

export default function ScalePage( props ) {

  const { showOpenStringsUI, setShowOpenStringsUI, showInlaysUI, setShowInlaysUI, setScaleSampler,
     currentNote, setCurrentNote,  ...rest} = props

const { startAudio, scaleSampler,  samplerReady } = useToneEngine();

const [renderDataUI, setRenderDataUI] = useState(null);

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
  /*scaleSequenceUI
   'sequence', 'block'
   scale synth only applicalbe to sequential view
  */
  const [scaleSequenceUI, setScaleSequenceUI]= useState(false)
  // currentNote is active note of scale being sequenced



    // zoom persistence - zoom is used for scales so persist as different variable
  //  useEffect(() => {
  //      if( !isNaN(Number(zoom))) {
  //        console.log("setting scale zoom to ", zoom)
  //      localStorage.setItem("scaleZoom", zoom);}
  //    }, [zoom]);
   


  /* too many problems using objects as useState.  It requires deep cloning for react to recognise change
This is causing issues with lag in interface possible due to React seeing a new reference every timne
and re-rerending
Best solution is to only store primitives in the useState
  */


const [scaleRootUI, setScaleRootUI] = useState(() => {
      const saved = localStorage.getItem("scaleRootUI")
      return saved === null ? "C" : saved 
    });
useEffect(() => {  localStorage.setItem("scaleRootUI", scaleRootUI);
        }, [scaleRootUI]);

const [scaleFormUI, setScaleFormUI] = useState(() => {
      const saved = localStorage.getItem("scaleFormUI")
      return saved === null ? "1" : saved 
    });
useEffect(() => {  localStorage.setItem("scaleFormUI", scaleFormUI);
        }, [scaleFormUI]);

const [scaleModeUI, setScaleModeUI] = useState(() => {
      const saved = localStorage.getItem("scaleModeUI")
      return saved === null ? "Major" : saved 
    });
useEffect(() => {  localStorage.setItem("scaleModeUI", scaleModeUI);
        }, [scaleModeUI]);

const [scaleQualityUI, setScaleQualityUI] = useState(() => {
      const saved = localStorage.getItem("scaleQualityUI")
      return saved === null ? "Maj" : saved 
    });
useEffect(() => {  localStorage.setItem("scaleQualityUI", scaleQualityUI);
        }, [scaleQualityUI]);


const [noteValueUI, setNoteValueUI] = useState("eighth")
const [patternUI, setPatternUI] = useState("sequential")
const [tempoUI, setTempoUI] = useState(120)
const [swingUI, setSwingUI] = useState(0.1)
const [metronomeLevelUI, setMetronomeLevelUI] = useState("0.6")
const [metronomeMutedUI, setMetronomeMutedUI] = useState(true)
const [directionUI, setDirectionUI] = useState("asc") // "asc", "desc", "asc-desc", "desc-asc"
const [rhythmUI, setRhythmUI] = useState("straight") // "straight", "swing", "triplet", 
const seqRef = useRef(null);


const scaleProps={
  renderDataUI: renderDataUI, setRenderDataUI: setRenderDataUI,
  scaleRootUI: scaleRootUI, setScaleRootUI: setScaleRootUI,
  scaleModeUI: scaleModeUI, setScaleModeUI: setScaleModeUI,
  scaleQualityUI: scaleQualityUI, setScaleQualityUI: setScaleQualityUI,
  scaleFormUI: scaleFormUI, setScaleFormUI: setScaleFormUI,
  scaleSequenceUI: scaleSequenceUI, setScaleSequenceUI: setScaleSequenceUI,
  patternUI: patternUI, setPatternUI: setPatternUI,
  tempoUI: tempoUI, setTempoUI: setTempoUI,
  swingUI: swingUI, setSwingUI: setSwingUI,
  noteValueUI: noteValueUI, setNoteValueUI: setNoteValueUI,
  metronomeLevelUI: metronomeLevelUI, setMetronomeLevelUI: setMetronomeLevelUI,
  metronomeMutedUI: metronomeMutedUI, setMetronomeMutedUI: setMetronomeMutedUI,
  directionUI: directionUI, setDirectionUI: setDirectionUI,
  rhythmUI: rhythmUI, setRhythmUI: setRhythmUI,

  // currentNote: currentNote, setCurrentNote: setCurrentNote
}



useEffect(() => {
    // console.log("useEffect for scale renderData.  directionUI is: ", directionUI," patternUI is: ", patternUI, " scaleSampler: ", scaleSampler, "renderDataUI; ", renderDataUI)
    if (!samplerReady) return;
    if( !renderDataUI ) return;

      renderDataUI.setProps(scaleProps)

      // 1. STOP AND DISPOSE ANY EXISTING SEQUENCE
  if (seqRef.current) {
    seqRef.current.stop();
    seqRef.current.dispose();
    seqRef.current = null;
  }


  
  // 2. CREATE NEW SEQUENCE
 
  // const renderNotes = renderDataUI.renderNotes
  //  const notes = [...scaleNotes, ...[...scaleNotes].reverse()]
  //  console.log("useEffect scaleSampler, notes array: ", notes)

   // need to reset transport, otherwise the first note doesn’t play the first time 
   // //because the Transport is already running before the sequence is created. 
   
const renderNotes = renderDataUI.renderNotes
console.log("renderNotes to be played: ", renderNotes)
  const transport = Tone.getTransport();
  transport.stop();
  transport.position = 0;
console.log("resequencing ...")
   seqRef.current =  new Tone.Sequence((time, rn) => {
    //  console.log("time: ", time, "rn: ", rn)
        scaleSampler.triggerAttackRelease(rn.note.name, rn.subdivision, time);

        Tone.Draw.schedule(() => {
          setCurrentNote(rn.note);
        }, time);
      },
      renderNotes,
      // "8n"
    ).start(0);

  }, [samplerReady, renderDataUI, directionUI, patternUI]);




useEffect(() => {
  console.log("scale page loading, ready: ",ready)
  setRenderDataUI(null)
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

     console.log("ready ...")
    const sDict = dc.SCALE_MANAGER.activeDict 
    // console.log("dict scales: ", sDict.scales)

    const scale = sDict.scaleWithQualityAndForm(scaleQualityUI,scaleFormUI)
    scale.mode = scaleModeUI
    scale.setRoot( scaleRootUI)
     

  const rData = new RenderData(scaleProps)
   
    if (scale?.id !== undefined) {
      rData.activeNote = null // for sequential playing

      //  console.log("getting render data for scale ", scale, " with id: ", scale.id, 
        // " root: ", scale.root , " form: ", scale.form)   
      scale.notes.forEach((n)=>{
  
          let text = n.letter 

          const rn = new RenderNote({note: n, text: text ,})
          rData.add(rn, n.stringNumber)
          })
  
   // if this doesn't work may need to create a boolean primitive to flag needs rendering
        //   console.log("old renderDataUI: ", renderDataUI)
        // console.log("new render data: ", rData)
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
      <ScaleControlTab 
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