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
import RenderData, {RenderNote} from "/src/render-notes.js"



import { autumnLeaves } from "/src/data/autumnLeaves";


const initialLeadSheet = autumnLeaves 
// console.log("initialLeadSheet: ",initialLeadSheet )




/*
How the user interacts (the UX)
1. Click a note

The note highlights (optional glow).
2. Drag left or right

    Drag right → longer duration

    Drag left → shorter duration

3. Duration snaps to the nearest value

Your duration ladder:
Code

"s" → "e" → "q" → "h" → "w"
16th → 8th → quarter → half → whole

4. The note visually updates in real time

    Stem length changes

    Flags appear/disappear

    Notehead spacing adjusts

    Measure reflows

    Fretboard updates

    Playback pitch stays the same

5. Release mouse to commit

The new duration is saved into your lead sheet model.
*/




function pitchToMidi(pitch) {
  const note = pitch.slice(0, -1);
  const octave = Number(pitch.slice(-1));

  const map = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };

  return 12 * (octave + 1) + map[note];
}

function midiToPitch(midi) {
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const note = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return note + octave;
}

function transposeToken(token, semitones) {
  const pitch = token.slice(0, -1);
  const dur = token.slice(-1);

  const midi = pitchToMidi(pitch);
  const newMidi = midi + semitones;
  const newPitch = midiToPitch(newMidi);

  return newPitch + dur;
}


// This is the mid‑register jazz guitar map:
const pitchToGuitar = {
  "C4": { string: 3, fret: 5 },
  "C#4": { string: 2, fret: 2 },
  "D4": { string: 2, fret: 3 },
  "Eb4": { string: 2, fret: 4 },
  "E4": { string: 2, fret: 5 },
  "F4": { string: 2, fret: 6 },
  "F#4": { string: 2, fret: 7 },
  "G4": { string: 2, fret: 8 },
  "Ab4": { string: 2, fret: 9 },
  "A4": { string: 1, fret: 5 },
  "Bb4": { string: 1, fret: 6 },
  "B4": { string: 1, fret: 7 },

  "Bb3": { string: 3, fret: 3 },
  "B3": { string: 3, fret: 4 },
  "A3": { string: 3, fret: 2 },
  "G3": { string: 4, fret: 5 },
  "F3": { string: 4, fret: 3 },
  "Eb3": { string: 4, fret: 1 },
  "D3": { string: 4, fret: 0 },
  "C3": { string: 5, fret: 3 }
};







export default function LeadSheetPage(props) {
  const [leadSheet, setLeadSheet] = useState(initialLeadSheet);
  const [selected, setSelected] = useState(null);

  // add an empty RenderData as default for renderDataUI so strings are drawn
  const [renderDataUI, setRenderDataUI] = useState(new RenderData()) ;
//  const [renderDataUI, setRenderDataUI] = useState(null) ;
const [isPlaying, setIsPlaying] = useState(false);
const [isPaused, setIsPaused] = useState(false);
  const rendererRef = useRef(null);
const [selectedNoteId, setSelectedNoteId] = useState(null);



const { leadSheetSampler } = useToneEngine();

const player = useLeadSheetPlayer({
  leadSheet,
  rendererRef,
  renderDataUI,
  setRenderDataUI,
  isPlaying,
  setIsPlaying,
  isPaused,

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
       
  


const [drag, setDrag] = useState(null);

const handleNoteDragStart = useCallback((noteId, startY, startX) => {
  setDrag({ noteId, startY, startX });
}, []);


const handleNoteSelect = (id) => {
  setSelectedNoteId(id);
};


useEffect(() => {
  if (!drag) return;

  const handleMove = (e) => {
    const dy = e.clientY - drag.startY;
    const dx = e.clientX - drag.startX;

    const semitones = Math.round(-dy / 12); // vertical → pitch
    const durationSteps = Math.round(dx / 30); // horizontal → duration

    updateDraggedNote(drag.noteId, semitones, durationSteps);
  };

  const handleUp = () => setDrag(null);

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);

  return () => {
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
  };
}, [drag]);





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


  /*
⭐ What Ripple Edit must do (the rules)

When a note changes duration:
✔ If the note gets longer

You must remove or consume later notes/rests until the measure is full again.
✔ If the note gets shorter

You must insert rests to fill the gap.
✔ The measure must ALWAYS total exactly 4/4

No exceptions.
No incomplete measures.
No overflow.
No underflow.
  */
const durationToTicks = {
  "w": 1024,
  "h": 512,
  "q": 256,
  "e": 128,
  "s": 64
};

function getTicks(token) {
  if (token.endsWith("r")) {
    const dur = token.slice(0, -1); // "qr" → "q"
    return durationToTicks[dur];
  }
  const dur = token.slice(-1); // "C4q" → "q"
  return durationToTicks[dur];
}

function setDuration(token, newDur) {
  if (token.endsWith("r")) {
    return newDur + "r"; // rest
  }
  const pitch = token.slice(0, -1);
  return pitch + newDur; // note
}




const MEASURE_TICKS = 1024;


function applyRippleEdit(measure, editedNoteId, newToken) {

  const notes = measure.melody;

  // 1. Find edited note/rest
  const index = notes.findIndex(n => n.id === editedNoteId);
  if (index === -1) return measure;

  const edited = notes[index];

  // 2. Compute old/new ticks
  const oldTicks = getTicks(edited.token);
  const newTicks = getTicks(newToken);
  const delta = newTicks - oldTicks;

  // 3. Apply new token
  edited.token = newToken;

  // 4. Compute total ticks after change
  let total = notes.reduce((sum, n) => sum + getTicks(n.token), 0);

  // ------------------------------------------------------------
  // ⭐ CASE 1: Overflow → measure too long → remove/shorten later notes
  // ------------------------------------------------------------
  if (total > MEASURE_TICKS) {
    let overflow = total - MEASURE_TICKS;

    for (let i = index + 1; i < notes.length && overflow > 0; i++) {
      const n = notes[i];
      const ticks = getTicks(n.token);

      if (ticks <= overflow) {
        // Remove entire note/rest
        overflow -= ticks;
        notes.splice(i, 1);
        i--;
      } else {
        // Shorten this note/rest
        const remaining = ticks - overflow;

        // Find the largest duration <= remaining
        const newDur = Object.keys(durationToTicks)
          .reverse()
          .find(d => durationToTicks[d] <= remaining);

        n.token = setDuration(n.token, newDur);

        overflow = 0;
      }
    }
  }

  // ------------------------------------------------------------
  // ⭐ CASE 2: Underflow → measure too short → insert rests
  // ------------------------------------------------------------
  if (total < MEASURE_TICKS) {
    let under = MEASURE_TICKS - total;

    while (under > 0) {
      const restDur = Object.keys(durationToTicks)
        .reverse()
        .find(d => durationToTicks[d] <= under);

      notes.push({
        id: crypto.randomUUID(),
        token: restDur + "r",
        string: null,
        fret: null
      });

      under -= durationToTicks[restDur];
    }
  }

  console.log("POST RIPPLE MEASURE: ",measure.melody.map((t)=>t.token))
  return measure;

}





function updateDraggedNote(noteId, semitones, durationSteps) {
  setLeadSheet(prev => {
    const next = structuredClone(prev);

    for (const measure of next.measures) {
      const note = measure.melody.find(n => n.id === noteId);
      if (!note) continue;

      // 1. Compute new pitch token
      const newPitchToken = transposeToken(note.token, semitones);
      const pitch = newPitchToken.slice(0, -1);

      // 2. Compute new duration
      const durations = ["s", "e", "q", "h", "w"];
      const currentDur = newPitchToken.slice(-1);
      let idx = durations.indexOf(currentDur);
      idx = Math.min(Math.max(idx + durationSteps, 0), durations.length - 1);
      const newDur = durations[idx];

      const newToken = pitch + newDur;

      // 3. Apply Ripple Edit
      if( newDur != currentDur) {
            applyRippleEdit(measure, noteId, newToken);
            }

      // 4. Update string/fret for edited note
      const updated = measure.melody.find(n => n.id === noteId);
      const gf = pitchToGuitar[pitch];
      updated.string = gf.string;
      updated.fret = gf.fret;
    }

    return next;
  });
}






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

        <FretboardSVG
          {...props}
          renderDataUI={renderDataUI}
          setRenderDataUI={setRenderDataUI}
          width={1800}                    height={220}
          zoom={zoom}                     setZoom={setZoom}
    
          // showNoteNamesUI={showNoteNamesUI}
          // showAllNotesUI={showAllNotesUI}
          // noteMode={noteMode}
          />
          
          
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
            {...props}
            leadSheet={leadSheet}
            renderDataUI={renderDataUI}
            setRenderDataUI={setRenderDataUI}
            ref={rendererRef} 
            onNoteDragStart={handleNoteDragStart}
             measures={leadSheet.measures}
             onNoteSelect={handleNoteSelect}
             selectedNoteId={selectedNoteId}
             setSelectedNoteId={setSelectedNoteId}
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