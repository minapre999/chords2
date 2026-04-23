import React, { useState, useCallback, useEffect, useRef } from "react";
import Toolbar from "/src/components/toolbar/toolbar.jsx";

import { TransportBar } from "../lead-sheet/TransportBar";
import  LeadSheetRenderer  from "../lead-sheet/LeadSheetRenderer";
// import { InspectorPanel } from "../lead-sheet/InspectorPanel";
// import { FretboardPreview } from "../lead-sheet/FretboardPreview";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";
import { useLeadSheetPlayer } from "/src/hooks/useLeadSheetPlayer";




import { autumnLeaves } from "/src/data/autumnLeaves";


const initialLeadSheet = autumnLeaves 
// console.log("initialLeadSheet: ",initialLeadSheet )





export default function LeadSheetPage(props) {
  const [leadSheet, setLeadSheet] = useState(initialLeadSheet);
  const [selected, setSelected] = useState(null);

  const [renderDataUI, setRenderDataUI] = useState(null);
const [isPlaying, setIsPlaying] = useState(false);
const [isPaused, setIsPaused] = useState(false);
  const rendererRef = useRef(null);


const { leadSheetSampler } = useToneEngine();

const player = useLeadSheetPlayer({
  leadSheet,
  rendererRef,
  renderDataUI,
  setRenderDataUI,
  isPlaying,
  setIsPlaying

});


     // zoom persistence - zoom is used for scales so persist as different variable
         
         const zoomScope="lead-sheet"
         const storageKey = `fretboard.zoom.${zoomScope}`
         const [zoom, setZoom] = useState(() => {
           const stored = localStorage.getItem(storageKey);
           return stored ? Number(stored) : 1;
         });
       
         useEffect(() => {
           localStorage.setItem(storageKey, zoom);
         }, [zoom, storageKey]);
       
  



  const handleSelect = useCallback((payload) => {
    setSelected(payload);
  }, []);

  const updateLeadSheet = useCallback((update) => {
    setLeadSheet((prev) => {
      const next = structuredClone(prev);

      if (update.type === "note") {
        const bar = next.bars.find((b) => b.id === update.barId);
        if (!bar) return prev;
        const note = bar.melody.find((n) => n.id === update.id);
        if (!note) return prev;
        Object.assign(note, update.patch);
      }

      if (update.type === "chord") {
        const bar = next.bars.find((b) => b.id === update.barId);
        if (!bar || !bar.chord) return prev;
        if (bar.chord.id !== update.id) return prev;
        Object.assign(bar.chord, update.patch);
      }

      return next;
    });
  }, []);




  return (


    <div className="page-wrapper"
     style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
        <Toolbar
          {...props}
      
          page="lead-sheet"
          zoom={zoom}                     setZoom={setZoom}
      isPlaying={isPlaying} setIsPlaying={setIsPlaying}
      isPaused={isPaused} setIsPaused={setIsPaused}
        />
    
    
      <div className="page-content">
        <FretboardSVG
          {...props}
          setRenderDataUI={setRenderDataUI}
          width={1800}                    height={220}
          zoom={zoom}                     setZoom={setZoom}
    
          // showNoteNamesUI={showNoteNamesUI}
          // showAllNotesUI={showAllNotesUI}
          // noteMode={noteMode}
          />
          



    <div
      className="lead-sheet-page"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100vh",   // full viewport
        minHeight: 0
      }}
    >
      {/* <TransportBar leadSheet={leadSheet} /> */}

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0
        }}
      >
        {/* LEFT: scrollable lead sheet */}
        <div
          style={{
            flex: 2,
            minHeight: 0,
            overflowY: "auto",   // this MUST scroll
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: 8,
            boxSizing: "border-box"
          }}
        >
          <LeadSheetRenderer
            leadSheet={leadSheet}
            renderDataUI={renderDataUI}
            ref={rendererRef} 
          />
        </div>

        {/* RIGHT: inspector + fretboard */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 0
          }}
        >
          {/* <InspectorPanel
            selected={selected}
            leadSheet={leadSheet}
            onChange={updateLeadSheet}
          /> */}
          {/* <FretboardPreview
            selected={selected}
            leadSheet={leadSheet}
            onChange={updateLeadSheet}
          /> */}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
