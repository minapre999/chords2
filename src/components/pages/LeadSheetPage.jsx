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

import FloatingPalette from "/src/components/panels/FloatingPalette.jsx"

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


// Helpers
const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONIC_EQUIV = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb"
};

// Standard tuning: [stringNumber, midiNote]
const TUNING = [
  { string: 6, midi: 40 }, // E2
  { string: 5, midi: 45 }, // A2
  { string: 4, midi: 50 }, // D3
  { string: 3, midi: 55 }, // G3
  { string: 2, midi: 59 }, // B3
  { string: 1, midi: 64 }  // E4
];

// Convert MIDI -> { name: "C#4", base: "C#", octave: 4 }
function midiToNote(midi) {
  const noteIndex = (midi + 3) % 12; // so that 60 -> C
  const octave = Math.floor(midi / 12) - 1;
  const base = NOTE_NAMES_SHARP[noteIndex];
  return { name: `${base}${octave}`, base, octave };
}

function pitchToGuitar({
  minMidi = 40,  // E2
  maxMidi = 76,  // E5
  maxFret = 17
} = {}) {
  // console.log("pitchToGuitar")
  const map = {};

  for (const { string, midi: openMidi } of TUNING) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const noteMidi = openMidi + fret;
      if (noteMidi < minMidi || noteMidi > maxMidi) continue;

      const { name, base, octave } = midiToNote(noteMidi);

      // Prefer lowest-fret occurrence: only set if not already mapped
      if (!map[name]) {
        map[name] = { string, fret };
      }
      // console.log("PITCH TO GUITAR MAP: ", map)
      // Add enharmonic flat name if exists (e.g., C# -> Db)
      if (ENHARMONIC_EQUIV[base]) {
        const flatName = `${ENHARMONIC_EQUIV[base]}${octave}`;
        if (!map[flatName]) {
          map[flatName] = { string, fret };
        }
      }
    }
  }

  return map;
}








export default function LeadSheetPage(props) {



    // 1. All useRef FIRST
const rendererRef = useRef(null);
const applyRippleEditRef = useRef(null);
const advanceCaretRef = useRef(null);
const onMouseUpRef = useRef(() => {});
const dragRef = useRef(null);

  // 2. All useState SECOND
  const [leadSheet, setLeadSheet] = useState(initialLeadSheet);


  const [selected, setSelected] = useState(null);

  // add an empty RenderData as default for renderDataUI so strings are drawn
  const [renderDataUI, setRenderDataUI] = useState(new RenderData()) ;
//  const [renderDataUI, setRenderDataUI] = useState(null) ;
const [isPlaying, setIsPlaying] = useState(false);
const [isPaused, setIsPaused] = useState(false);

const [selectedNoteId, setSelectedNoteId] = useState(null);

// this is the core of the note input system
const [noteInputMode, setNoteInputMode] = useState(false);
const [inputDuration, setInputDuration] = useState("q"); // default quarter
const [caret, setCaret] = useState({ measure: 0, index: 0 });

const [pendingInsert, _setPendingInsert] = useState(null);

const setPendingInsert = (value) => {
  console.groupCollapsed("%c setPendingInsert CALLED", "color:red;font-weight:bold");
  console.trace("Stack:");
  console.log("Value:", value);
  console.groupEnd();
  _setPendingInsert(value);
};



const [showPalette, setShowPalette] = useState(() => {
  const saved = localStorage.getItem("lead-sheet.palette.visible");
  return saved ? JSON.parse(saved) : false;
});
useEffect(() => {
  localStorage.setItem("lead-sheet.palette.visible", JSON.stringify(showPalette));
}, [showPalette]);


const [lsPalettePos, setLsPalettePos] = useState(() => {
  const saved = localStorage.getItem("lead-sheet.palette.cords");
  return saved ? JSON.parse(saved) : { x: 100, y: 500 };
});
useEffect(() => {
  localStorage.setItem("lead-sheet.palette.cords", JSON.stringify(lsPalettePos));
}, [lsPalettePos]);

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



const [dragPreview, setDragPreview] = useState(null);

// 3. Custome hooks

const { leadSheetSampler } = useToneEngine();


        // 4. All useCallback FOURTH


const onNoteInput = useCallback((pitch, measureIndex, melodyIndex) => {
  console.log("onNoteInput fired:", { pitch, measureIndex, melodyIndex, noteInputMode });

  if (!noteInputMode) {
    console.log("IGNORED — mode off");
    return;
  }

  console.log("SETTING pendingInsert from onNoteInput");
  setPendingInsert({ pitch, measureIndex, melodyIndex });

}, [noteInputMode, inputDuration]);



const handleUp = useCallback(() => {
  const drag = dragRef.current;
  if (!drag || !dragPreview) return;

  const { noteId, semitones, durationSteps } = dragPreview;

  updateDraggedNote(noteId, semitones, durationSteps);

  noteElements.current.forEach(g => g.removeAttribute("transform"));

  dragRef.current = null;
  setDragPreview(null);
}, [dragPreview, updateDraggedNote]);



  const handleSelect = useCallback((payload) => {
    setSelected(payload);
  }, []);

  const updateLeadSheet = useCallback((update) => {
    setLeadSheet((prev) => {
      console.trace("updateLeadSheet prev: ", prev, " noteInputMode: ", noteInputMode )
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



const handleToolbarDurationChange = useCallback((newDur) => {
  const duration = newDur;   // ⭐ capture it here


  if (noteInputMode) {
     console.log("setInputDuration: ", duration, "caret: ", caret, "measureIndex: ", measureIndex, "melodyIndex: ", melodyIndex)
    setInputDuration(duration);

    const { measure, index } = caret;

    // Insert a note at the caret
    setPendingInsert({
      pitch: "C4",        // ⭐ default pitch (or last pitch, or caret pitch)
      measureIndex: measure,
      melodyIndex: index
    });

    return;
  }

  // ⭐ NORMAL MODE: edit selected note
  if (!selectedNoteId) return;

  setLeadSheet(prev => {
    const next = structuredClone(prev);

    for (let measureIndex = 0; measureIndex < next.measures.length; measureIndex++) {
      const measure = next.measures[measureIndex];
      const note = measure.melody.find(n => n.id === selectedNoteId);
      if (!note) continue;

      const oldToken = note.token;
      const isRest = oldToken.endsWith("r");

      const newToken = isRest
        ? duration + "r"
        : oldToken.slice(0, -1) + duration;

      console.log("newToken:", newToken, "oldToken:", oldToken);

      // ⭐ APPLY RIPPLE EDIT AND CAPTURE RETURN VALUE
      const updatedMeasure = applyRippleEdit(
        measure,
        note.id,
        newToken
      );

      console.log("ripple returned:", updatedMeasure);

      // ⭐ REPLACE THE MEASURE IN STATE
    next.measures[measureIndex] = updatedMeasure;
  }

  console.log("setLeadSheet returning:", next);
  return next;
  });
}, [noteInputMode, caret, selectedNoteId]);




  // 5. All useEffect FIFTH

/* debugging
This fires after the state updates.
This logs:

    the new leadSheet

    the call stack that triggered the update

    the exact moment React committed the update

This is the cleanest way to track when the setter caused a change.
*/
//   useEffect(() => {
//   console.trace("leadSheet changed:", "noteInputMode: ", noteInputMode, "leadSheet: ",leadSheet);
// }, [leadSheet]);


useEffect(() => {

    console.log("ripple-edit EXECUTING");

  if (!pendingInsert) return;

  const { pitch, measureIndex, melodyIndex } = pendingInsert;

  console.log("ripple-edit effect fired. pendingInsert:", pendingInsert);

  setLeadSheet(prev => {
        

    const next = structuredClone(prev);
    const measure = next.measures[measureIndex];

    const token = pitch + inputDuration;

    const newMelody = [
      ...measure.melody.slice(0, melodyIndex),
      {
        id: crypto.randomUUID(),
        token,
        string: null,
        fret: null
      },
      ...measure.melody.slice(melodyIndex)
    ];

    // IMPORTANT: apply ripple edit *before* returning state
    const updatedMeasure = applyRippleEdit(
      { ...measure, melody: newMelody },
      null,
      null,
      { insertedIndex: melodyIndex }
    );

    next.measures[measureIndex] = updatedMeasure;

    return next;
  });

  setPendingInsert(null);
}, [pendingInsert, inputDuration]);











useEffect(() => {
  if (!advanceCaretRef.current) return;
  if (!leadSheet || !leadSheet.measures) return;

  const { measureIndex, melodyIndex } = advanceCaretRef.current;

  advanceCaret(measureIndex, melodyIndex, leadSheet);

  advanceCaretRef.current = null;

}, [leadSheet]);   // ⭐ not pendingInsert




useEffect(() => {
  const onKey = (e) => {
    if (!noteInputMode) return;

    // A–G pitch entry
    if ("abcdefg".includes(e.key.toLowerCase())) {
      const pitch = mapLetterToPitch(e.key);
      onNoteInput(pitch, caret.measure, caret.index);
      return;
    }

    // 1–5 duration shortcuts
    const map = { "1": "w", "2": "h", "3": "q", "4": "e", "5": "s" };
    if (map[e.key]) {
      setInputDuration(map[e.key]);
      return;
    }
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [noteInputMode ]);


const advanceCaret = (measureIndex, tokenIndex, leadSheet) => {
  const measure = leadSheet.measures[measureIndex];
  const tokenCount = measure.melody.length;

  let newIndex = tokenIndex + 1;
  let newMeasure = measureIndex;

  // Move to next measure
  if (newIndex >= tokenCount) {
    newMeasure = measureIndex + 1;
    newIndex = 0;
  }

  // Clamp to last measure
  if (newMeasure >= leadSheet.measures.length) {
    newMeasure = leadSheet.measures.length - 1;
    newIndex = leadSheet.measures[newMeasure].melody.length - 1;
  }

  setCaret({
    measure: newMeasure,
    index: newIndex
  });
};









const player = useLeadSheetPlayer({
  leadSheet,
  rendererRef,
  renderDataUI,
  setRenderDataUI,
  isPlaying,
  setIsPlaying,
  isPaused,

});





  







// called by LeadSheetRenderer on mousedown
const handleNoteDragStart = (noteId, startX, startY, g) => {
  dragRef.current = {
    noteId,
    startX,
    startY,
    g,
  };
};



// mousemove → update preview (still in screen coords)
const handleMove = (e) => {
  const drag = dragRef.current;
  if (!drag) return;

  const dy = e.clientY - drag.startY;
  const dx = e.clientX - drag.startX;

  // ✅ 5px per semitone (lines AND spaces), not 10
  const semitones = Math.round(-dy / 5);
  const durationSteps = Math.round(dx / 30);

  setDragPreview({
    noteId: drag.noteId,
    semitones,
    durationSteps,
  });
};


// mouseup → commit + clear
onMouseUpRef.current = () => {
  const drag = dragRef.current;
  if (!drag) return;

  setDragPreview(prev => {
    if (!prev) {
      dragRef.current = null;
      return null;
    }

    const { noteId, semitones, durationSteps } = prev;
    updateDraggedNote(noteId, semitones, durationSteps);

    dragRef.current = null;
    return null;
  });
};





 useEffect(() => {
  const onMove = (e) => handleMove(e);
  const onUp = (e) => onMouseUpRef.current(e);

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}, []);


const handleNoteSelect = (id) => {
  console.log("SELECTING NOTE ID: ", id)
    if (!noteInputMode) {
    setSelectedNoteId(id);
  }

};






// global listeners
useEffect(() => {
  const onMove = (e) => handleMove(e);
  const onUp = (e) => onMouseUpRef.current(e);

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
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

function applyRippleEdit(measure, editedNoteId, newToken, opts = {}) {
  console.log("APPLY RIPPLE measure: ", measure, "editedNoteId: ",  editedNoteId, "newToken: ", newToken, " opts: ", opts )
  const next = {
    ...measure,
    melody: measure.melody.map(n => ({ ...n }))
  };

  const notes = next.melody;
  let index = -1;

  if (editedNoteId) {
    index = notes.findIndex(n => n.id === editedNoteId);
    if (index === -1) return next;
    notes[index].token = newToken;
  }

  if (opts.insertedIndex !== undefined) {
    index = opts.insertedIndex;
  }

  let total = notes.reduce((sum, n) => sum + getTicks(n.token), 0);

  if (total > MEASURE_TICKS) {
    console.log("fixing for overflow")
    let overflow = total - MEASURE_TICKS;

    for (let i = index + 1; i < notes.length && overflow > 0; i++) {
      const n = notes[i];
      const ticks = getTicks(n.token);

      if (ticks <= overflow) {
        overflow -= ticks;
        notes.splice(i, 1);
        i--;
      } else {
        const remaining = ticks - overflow;

        const exactDur = Object.keys(durationToTicks)
          .find(d => durationToTicks[d] === remaining);

        if (exactDur) {
          n.token = setDuration(n.token, exactDur);
        } else {
          const fallback = Object.keys(durationToTicks)
            .reverse()
            .find(d => durationToTicks[d] < remaining);

          if (fallback) {
            n.token = setDuration(n.token, fallback);
          }
        }

        overflow = 0;
      }
    }
  }

  total = notes.reduce((sum, n) => sum + getTicks(n.token), 0);

  
if (total < MEASURE_TICKS) {
  console.log("fixing for underflow");
  let under = MEASURE_TICKS - total;
  let insertPos = index + 1;

  // ⭐ Sort durations by tick length descending
  const sortedDurations = Object.entries(durationToTicks)
    .sort((a, b) => b[1] - a[1]); // [duration, ticks]

  while (under > 0) {
    // ⭐ Pick the largest duration <= under
    const [dur, ticks] = sortedDurations.find(([d, t]) => t <= under);

    const newId = crypto.randomUUID();
    console.log(
      "adding rest at", insertPos,
      "id:", newId,
      "token:", dur + "r"
    );

    notes.splice(insertPos, 0, {
      id: newId,
      token: dur + "r",
      string: null,
      fret: null
    });

    insertPos++;
    under -= ticks;
  }
}


  return next;
}







function extractPitch(token) {
  if (!token) return null;

  // Rests
  if (token[0].toUpperCase() === "R") return null;

  // Match: Letter + optional accidental + octave
  // Examples matched: C4, C#4, Db3, F##5 (rare), Bb10
  const match = token.match(/^([A-Ga-g])([#b]?)(\d+)/);
  if (!match) return null;

  const letter = match[1].toUpperCase();
  const accidental = match[2] || "";
  const octave = match[3];

  return `${letter}${accidental}${octave}`;
}


function updateDraggedNote(noteId, semitones, durationSteps) {
  setLeadSheet(prev => {
            console.trace("useEffect setLeadSheet prev: ", prev, " noteInputMode: ", noteInputMode )

    const next = structuredClone(prev);   // ⭐ MUST clone
// console.log("UPDATE DRAGGED NOTE: ", noteId, semitones)
    for (const measure of next.measures) {
      const note = measure.melody.find(n => n.id === noteId);
      if (!note) continue;
      // console.log("Existing note token: ", note.token)
      // transpose pitch
      const newToken = transposeToken(note.token, semitones);
      const pitch = extractPitch(newToken);
// console.log("New token: ", newToken, "pitch: ", pitch)
      if (pitch) {
        const gf = pitchToGuitar(pitch);
        if (gf) {
          note.string = gf.string;
          note.fret = gf.fret;
        }
      }

      note.token = newToken;

      // duration update
      if (durationSteps !== 0) {
        note.durationSteps = (note.durationSteps || 0) + durationSteps;
      }
    }

    return next; // ⭐ MUST return a new object
  });
}








  return (


    <div className="page-wrapper"
     style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
        <Toolbar
          {...props}
          page="lead-sheet"
          zoom={zoom}
          setZoom={setZoom}
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying}
          isPaused={isPaused} 
          setIsPaused={setIsPaused}
          
          showPalette={showPalette} 
          setShowPalette={setShowPalette}
          pos={lsPalettePos} 
          setPos={setLsPalettePos}
          noteInputMode={noteInputMode}
          setNoteInputMode={setNoteInputMode}
          handleToolbarDurationChange={handleToolbarDurationChange}
          setInputDuration={setInputDuration}
        />
    
    
      <div className="page-content">
      

      {showPalette && (
        <FloatingPalette
             pos={lsPalettePos} 
            setPos={setLsPalettePos} 
             onClose={() => setShowPalette(false)}
               >
         this is a palette
        </FloatingPalette>
      )}



 

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
             dragPreview={dragPreview} 
             setDragPreview={setDragPreview}
             dragRef={dragRef}
            noteInputMode={noteInputMode}
            onNoteInput={onNoteInput}
            caret={caret}
            setCaret={setCaret}

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