import { useEffect, useRef, useState, useCallback } from "react";
import RenderData, {RenderNote} from "/src/render-notes.js"
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";


export function useLeadSheetPlayer(props ) {
   const {leadSheet, rendererRef, renderDataUI, setRenderDataUI,
    isPlaying, setIsPlaying,isPaused}  =props
 
  const seqRef = useRef(null);


//   const prevSampler = useRef(null)
//     const prevRendererRef = useRef(null)
//  const prevIsPlaying= useRef(null)
// const prevSamplerReady= useRef(null)
//  const prevBuildSteps= useRef(null)
 


  const { startAudio, scaleSampler,  samplerReady, setSamplerReady} = useToneEngine();



  const [tempo, setTempo] = useState(() => {
        const saved = localStorage.getItem("lead-sheet.tempo")
        return saved === null ? 240 : saved 
      });
  useEffect(() => {  localStorage.setItem("lead-sheet.tempo", tempo);
          }, [tempo]);
  




  // Wait for sampler to load
  useEffect(() => {
    // console.log("useEffect for sampler")
    if (!scaleSampler) return;
    if (scaleSampler.loaded) setSamplerReady(true);
    else scaleSampler.onload = () => setSamplerReady(true);
  
  }, [scaleSampler]);


  useEffect(() => {
  Tone.getTransport().bpm.value = tempo;
}, [tempo]);



   // Wait for sampler to load
  useEffect(() => {
    // console.log("useEffect for leadSheet")
  
  
    const steps = buildSteps();
    if (!steps.length) return;

    console.log("steps: ", steps)
  }, [leadSheet]);




  /* 
  buildSteps This produces a clean event list like:
  { time: "0", note: "G4", duration: "4n" },
  { time: "4n", note: "A4", duration: "8n" },
  { time: "4n + 8n", note: "B4", duration: "2n" },
  ...
]
  */

 const buildSteps = useCallback(() => {
  const events = [];
  let cursor = 0;

  for (const measure of leadSheet.measures) {
    for (const n of measure.melody) {
      const token = n.token;
      const isRest = token.endsWith("r");

      const durationMap = {
        w: "1n",
        h: "2n",
        q: "4n",
        "8": "8n",
        "16": "16n"
      };

      const durSymbol = token.match(/w|h|q|8|16/)?.[0] || "q";
      const duration = durationMap[durSymbol] || "4n";

      // ⭐ FIXED: extract pitch correctly
      const pitch = token
        .replace(/r$/, "")        // remove rest marker
        .replace(/w|h|q|8|16/, ""); // remove duration symbol

      events.push({
        time: cursor,
        note: pitch,
        duration,
        isRest,
        id: n.id,
        measureId: measure.id
      });

      cursor += Tone.Time(duration).toSeconds();
    }
  }

  return events;
}, [leadSheet]);











  // Main sequencing effect (mirrors your scale player)

  useEffect(() => {
  if (!scaleSampler || !samplerReady) return;
  if (!leadSheet) return;
  if(isPaused) return;
  


console.log("effect for build steps /nisPaused: ", isPaused, 
    " \nisPlaying", isPlaying, 

    " \nsamplerReady", samplerReady, 
    " \nrendererRef", rendererRef, 
    " \nscaleSampler", scaleSampler, 
     " \nbuildSteps", buildSteps,)


  const events = buildSteps();
  if (!events.length) return;

  // Stop old part but DO NOT reset transport
  if (seqRef.current) {
    seqRef.current.stop();
    seqRef.current.clear();
  } else {
    seqRef.current = new Tone.Part((time, ev) => {
      if (!ev.isRest) {
        scaleSampler.triggerAttackRelease(ev.note, ev.duration, time);
      }

      Tone.Draw.schedule(() => {
     
        rendererRef.current?.highlightNote(ev.id);
        rendererRef.current?.highlightMeasure(ev.measureId);
      }, time);
    }, events);
  }

  // Update events
  events.forEach(ev => seqRef.current.add(ev.time, ev));

 if (isPlaying) {
    const transport = Tone.getTransport()
  // If starting from STOP, restart the Part
    if (transport.state === "stopped") {
        seqRef.current.start(0);
        transport.start("+0.01");
    } else {
        // If resuming from PAUSE, just resume Transport
        transport.start();
    }
    } else {
    // Only stop the Part if user pressed STOP
    if (!isPaused) {
        seqRef.current.stop();
    }



//  const prevSampler = scaleSampler
//     const prevRendererRef = rendererRef
//  const prevIsPlaying= isPlaying
// const prevSamplerReady= samplerReady
//  const prevBuildSteps= buildSteps
}


}, [scaleSampler, buildSteps, rendererRef, isPlaying, samplerReady]);





/**** FRETBOARD RENDER DATA *****/

    useEffect(() => {
    
   if( !leadSheet) return;

       const steps = buildSteps();
    if (!steps.length) return;

    console.log("leadSheet render steps: ", )
  const rData = new RenderData(props)
     
    //   if (leadSheet?.id !== undefined) {
    //     rData.activeNote = null // for sequential playing
  
    //     //  console.log("getting render data for scale ", scale, " with id: ", scale.id, 
    //       // " root: ", scale.root , " form: ", scale.form)   
    //     scale.notes.forEach((n)=>{
    
    //         let text = n.letter 
  
    //         const rn = new RenderNote({note: n, text: text ,})
    //         rData.add(rn, n.stringNumber)
    //         })
    
    //  // if this doesn't work may need to create a boolean primitive to flag needs rendering
    //       //   console.log("old renderDataUI: ", renderDataUI)
    //       // console.log("new render data: ", rData)
    //       setRenderDataUI( rData);
    //     }      
  
      }, [scaleSampler]);
    






  return {
   
  };
}
