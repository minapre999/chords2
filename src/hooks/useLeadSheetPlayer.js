import { useEffect, useRef, useState, useCallback } from "react";
import RenderData, {RenderNote} from "/src/render-notes.js"
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";


export function useLeadSheetPlayer(props ) {
   const {leadSheet, rendererRef, renderDataUI, setRenderDataUI,
    isPlaying, setIsPlaying}  =props
 
  const seqRef = useRef(null);
  const { startAudio, scaleSampler,  samplerReady, setSamplerReady} = useToneEngine();

  // Wait for sampler to load
  useEffect(() => {
    console.log("useEffect for sampler")
    if (!scaleSampler) return;
    if (scaleSampler.loaded) setSamplerReady(true);
    else scaleSampler.onload = () => setSamplerReady(true);
  
  }, [scaleSampler]);



   // Wait for sampler to load
  useEffect(() => {
    console.log("useEffect for leadSheet")
  
  
    const steps = buildSteps();
    if (!steps.length) return;

    console.log("steps: ", steps)
  }, [leadSheet]);



  
  // Convert lead sheet → sequence steps
  const buildSteps = useCallback(() => {
  const steps = [];

  for (const measure of leadSheet.measures) {
    for (const n of measure.melody) {
      const token = n.token;
      const isRest = token.endsWith("r");

      // ⭐ Extract duration symbol (first character or number)
      const durSymbol = token.replace(/r$/, "").replace(/[A-G#b0-9]/gi, "");

      const durationMap = {
        w: "1n",
        h: "2n",
        q: "4n",
        "8": "8n",
        "16": "16n"
      };

      const duration = durationMap[durSymbol] || "4n";

      const pitch = token.replace(/r$/, "");

      steps.push([
        {
          id: n.id,
          measureId: measure.id,
          token,
          isRest,
          pitch
        },
        duration
      ]);
    }
  }

  return steps;
}, [leadSheet]);









  // Main sequencing effect (mirrors your scale player)

  useEffect(() => {
  console.log("useEffect for configuring transport , scaleSampler: ", scaleSampler, "leadSheet: " ,leadSheet)

  if (!scaleSampler || !samplerReady) return;   // ⭐ REQUIRED
  if (!leadSheet) return;

  const steps = buildSteps();
  console.log("steps: ", steps);
  if (!steps.length) return;

  if (seqRef.current) {
    seqRef.current.stop();
    seqRef.current.dispose();
    seqRef.current = null;
  }

  const transport = Tone.getTransport();
  transport.stop();
  transport.position = 0;

  seqRef.current = new Tone.Sequence(
    (time, step) => {
      if (!step.isRest) {
      
        scaleSampler.triggerAttackRelease(step.token.slice(0, -1), step.subdivision, time);
      }

      Tone.Draw.schedule(() => {
        rendererRef.current?.highlightNote(step.id);
        rendererRef.current?.highlightMeasure(step.measureId);
      }, time);
    },
    steps,
    "4n"
  );
 console.log("seqRef.current: ", seqRef.current, "isPlaying: ", isPlaying)
if (isPlaying) {
    console.log("starting Tone.")
  seqRef.current.start(0);
    transport.start();
}


  return () => {
    if (seqRef.current) {
      seqRef.current.stop();
      seqRef.current.dispose();
      seqRef.current = null;
    }
  };
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
