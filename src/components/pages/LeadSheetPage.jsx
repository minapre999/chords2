import React, { useState, useCallback, useEffect, useRef } from "react";
import Toolbar from "/src/components/toolbar/toolbar.jsx";

import { TransportBar } from "../lead-sheet/TransportBar";
import  LeadSheetRenderer, { durationMap}  from "../lead-sheet/LeadSheetRenderer";
// import { FretboardPreview } from "../lead-sheet/FretboardPreview";
import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";
import { useLeadSheetPlayer } from "/src/hooks/useLeadSheetPlayer";
import RenderData, {RenderNote} from "/src/render-notes.js"
// import NoteInputCursor  from "/src/components/lead-sheet/NoteInputCursor.jsx"
import NoteInputCursorOverlay  from "/src/components/lead-sheet/cursor/NoteInputCursorOverlay.jsx"
import NoteInputCaret  from "/src/components/lead-sheet/NoteInputCaret.jsx"
import {staveRef} from "/src/components/lead-sheet/cursor/staveRef"
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
  { string: 1, midi: 76 }, // E4, E5 == 88, B5=83
  { string: 2, midi: 71 }, // B3 (C4 is middle C, 72)
  { string: 3, midi: 67 }, // G3
  { string: 4, midi: 62 }, // D3
  { string: 5, midi: 57 }, // A2
  { string: 6, midi: 52 }, // E2
 
];

// Convert MIDI -> { name: "C#4", base: "C#", octave: 4 }
function midiToNote(midi, preferFlats = false) {
  const noteIndex = midi % 12;              // 60 -> 0 (C), 61 -> 1 (C#), ...
  const octave = Math.floor(midi / 12) - 1; // 60 -> 4, 69 -> 4, etc.

  let base = NOTE_NAMES_SHARP[noteIndex];

  if (preferFlats && ENHARMONIC_EQUIV[base]) {
    base = ENHARMONIC_EQUIV[base];
  }

  return { name: `${base}${octave}`, base, octave };
}
function pitchToGuitar({
  minMidi = 52,  // E2
  maxMidi = 83,  // E6.  // D2=47, D3=59, D4=71, D5=83
  maxFret = 19
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
const onMouseUpRef = useRef(() => {});
const dragRef = useRef(null);
const lsContainerRef = useRef(null);
  const vfCacheRef = useRef(new Map());
 const lastMeasureLayoutRef = useRef(null);


const caretRef = useRef(null)

  // 2. All useState SECOND
  const [leadSheet, setLeadSheet] = useState(initialLeadSheet);


  // add an empty RenderData as default for renderDataUI so strings are drawn
  const [renderDataUI, setRenderDataUI] = useState(new RenderData()) ;
//  const [renderDataUI, setRenderDataUI] = useState(null) ;
const [isPlaying, setIsPlaying] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const playerRef = useRef(null);

const [tieStart, setTieStart] = useState(null); // where T was pressed




/* Replace multiple selection states with ONE selection object 
    where selection is
{
  type: "note" | "tie" | "slur" | "chord" | "rest" | "measure",
  id: string,
  measure: number,
  index: number
}
  e.g. setSelection({
  type: "note",
  id: note.id,
  measure: m,
  index: i
});
setSelection({
  type: "tie",
  id: tie.id
});

setSelection({
  type: "slur",
  id: slur.id
});

This immediately eliminates all selection collisions.
*/

const [selection, setSelection] = useState(null);

// this is the core of the note input system
const [noteInputMode, setNoteInputMode] = useState(false);
const noteInputModeRef = useRef(false);




useEffect(() => {
  noteInputModeRef.current = noteInputMode;
}, [noteInputMode]);




// useEffect(() => {
//   let internalValue = noteInputModeRef.current;

//   Object.defineProperty(noteInputModeRef, "current", {
//     get() {
//       return internalValue;
//     },
//     set(v) {
//       console.log("🔥 noteInputModeRef.current SET TO:", v, new Error().stack);
//       internalValue = v;
//     }
//   });
// }, []);




const [inputAccidental, setInputAccidental] = useState(null);
const [caret, setCaret] = useState({ measure: 0, index: 0 });
const [pendingInsert, _setPendingInsert] = useState(null);


  useEffect(() => {
    console.log("setting caretRef", {caret})
  caretRef.current = caret;
  window.caretRef = caretRef
}, [leadSheet, caret]);

// cursors for note input mode

const [cursorPitch, setCursorPitch] = useState("C4");
const [cursorVisible, setCursorVisible] = useState(false);

useEffect(() => {
  const container = lsContainerRef.current;
  if (!container) return;

  const onEnter = () => {
    // console.log("ENTER CONTAINER");
    setCursorVisible(true);
  };

  const onLeave = () => {
    // console.log("LEAVE CONTAINER");
    setCursorVisible(false);
  };



  container.addEventListener("mouseenter", onEnter);
  container.addEventListener("mouseleave", onLeave);

  return () => {
    container.removeEventListener("mouseenter", onEnter);
    container.removeEventListener("mouseleave", onLeave);
  };
}, []);




// Muscescore like interactivity
// inputDuration - current selected duration
// must always have one selected duration
const [inputDuration, setInputDuration] = useState("q"); // default quarter
// vexflow holds onto the old version of inputDuration 
// react cant update event listererns inside VexFlow groups automatically
// solution is to remove inputDuaration from the dependency array and instead read it from a ref
// update onNoteInput etc. to use the ref, not the stale closure
const inputDurationRef = useRef(inputDuration); 

useEffect(() => {
  inputDurationRef.current = inputDuration;
}, [inputDuration]);






// rest selected is true or false.  If true, then clicking a note 
// will replace it with a rest of the current selected duration
const [selRest, setSelRest] = useState(false); // default quarter
// dotted duration.  If true, then note changes / new notes / rests
// will have dotted duration
const [selDotted, setSelDotted] = useState(false); // dotted duration

const setPendingInsert = (value) => {
  console.groupCollapsed("%c setPendingInsert CALLED", "color:red;font-weight:bold");
  console.trace("Stack:");
  console.log("Value:", value);
  console.groupEnd();
  _setPendingInsert(value);
};


// for debugging - can view the lead sheet contents in the console
useEffect(() => {
  window.leadSheet = leadSheet;
  window.inputDuration = inputDuration
}, [leadSheet, inputDuration]);

useEffect(() => {
  window.selection = selection;
}, [ selection]);




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

function midiToPitchName(midi) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const note = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}


// function applyRippleEdit(measure, editedNoteId, newNoteData, opts = {}) {
// console.log("insertNote before splice: ",{noteIndex, pitchName},  measure.melody.map((n)=>n.pitches[0]+" - " +n.duration))

/*
insertNote logic
- if duration is identical to current duration (inc. dots), then add note as additional note for the beat 
i.e. append to the pitch array
- if duration is not identica and new duration is less than existing duration,  insert the note as a new note at the beat, then subtract the duration of the existing note from the
new duration
- if duration is not identical and the new duration is greater than existing duration, inser the note as a new note at the beat, then apply ripple edit

*/


function insertNoteXXX({ pitch, duration="q", measureIndex=0, noteIndex=0, dots=0}) {
setLeadSheet(prev => {
const next = structuredClone(prev);
return next
})

}



function insertNote({ pitch, duration="q", measureIndex=0, noteIndex=0, dots=0}) {
  setLeadSheet(prev => {
    const next = structuredClone(prev);
    const measure = next.measures[measureIndex];

    // 1. Convert MIDI → pitch name
    const pitchName = midiToPitchName(pitch);

    // 2. Build guitar mapping once per insert
    const guitarMap = pitchToGuitar();   // your function
    const gf = guitarMap[pitchName] || { string: null, fret: null };

    const existing = measure.melody[noteIndex];

    // Helper: ticks
    const newTicks = dottedDurationToTicks[`${duration}${dots}`]
    const existingTicks = existing ? getTicksFromNote(existing) : null;

    // ------------------------------------------------------------
    // CASE 1 — Same duration → chord input
    // ------------------------------------------------------------
    if (existing &&
        existing.duration === duration &&
        (existing.dots || 0) === 0) {

      // Append pitch if not already present
      if (!existing.pitches.includes(pitchName)) {
        existing.pitches.push(pitchName);
      }

      // Append string/fret arrays (parallel to pitches)
      if (!existing.strings) existing.strings = [];
      if (!existing.frets) existing.frets = [];

      existing.strings.push(gf.string);
      existing.frets.push(gf.fret);

      return next;
    }

    // ------------------------------------------------------------
    // CASE 2 — New duration < existing duration
    // Insert new note, then shorten existing note
    // ------------------------------------------------------------
    if (existing && newTicks < existingTicks) {
        

      // Insert new note at noteIndex
      measure.melody.splice(noteIndex, 0, {
        id: crypto.randomUUID(),
        pitches: [pitchName],
        duration,
        dots: dots,
        string: gf.string,
        fret: gf.fret
      });

      // Shorten existing note
      const remainingTicks = existingTicks - newTicks;
      const newDur = ticksToDuration(remainingTicks);

      existing.duration = newDur.duration;
      existing.dots = newDur.dots;

      return next;
    }

    // ------------------------------------------------------------
    // CASE 3 — New duration > existing duration
    // Insert new note, then ripple edit
    // ------------------------------------------------------------
    if (existing && newTicks > existingTicks) {

      // existing.pitches.push(pitchName)
      // existing.durations = duration
      // existing.selDotted = selDotted===true ? 1 : 0 // note: the dots needs to be updated to take into acco
      // // const newId = crypto.randomUUID();

      // make interface like MuseScore - if the duration is different then replace the existing pitches
      // otherwise add the pith to the existing pitches
      
      let newPitches = [pitchName]
      if( existing.duration === duration && existing.dots == dots) {
        newPitches = [...existing.pitches, pitchName]
      }
      applyRippleAcrossMeasures(next.measures, 
                          measureIndex, 
                          existing.id,
                         {
                          pitches: newPitches,
                          dots: dots,
                          duration: duration,
                         },
                          // {insertedIndex: noteIndex}
                          );


       


      return next
    }

    // ------------------------------------------------------------
    // CASE 4 — No existing note → simple insert
    // ------------------------------------------------------------
    measure.melody.splice(noteIndex, 0, {
      id: crypto.randomUUID(),
      pitches: [pitchName],
      duration,
      dots: dots,
      string: gf.string,
      fret: gf.fret
    });

    return next;
  });
}







const onNoteInput = useCallback((pitch, measureIndex, noteIndex) => {
  // console.log("onNoteInput fired:", { pitch, measureIndex, melodyIndex, noteInputMode });
   console.log("onNoteInput fired:",  {pitch, measureIndex, noteIndex,inputDurationRef}, "\n.  noteInputModeRef.current: ", noteInputModeRef.current);

  if (!noteInputModeRef.current) {
    // console.log("IGNORED — mode off");
    return;
  }

   insertNote({
    pitch,
    duration: inputDurationRef.current,
    measureIndex,
    noteIndex,
    dots: selDotted===true ? 1 : 0,
  });
console.log("setting caret", {measureIndex, noteIndex})
setCaret({
  measure: measureIndex,
   index:  noteIndex
  } )
  moveCaretForward();

  // console.log("SETTING pendingInsert from onNoteInput");
  // setPendingInsert({ pitch, measureIndex, melodyIndex });

}, [ leadSheet ]);



const handleUp = useCallback(() => {
  const drag = dragRef.current;
  if (!drag || !dragPreview) return;

  const { noteId, semitones, durationSteps } = dragPreview;

  console.log("HANDLE UP")
  updateDraggedNote(noteId, semitones, durationSteps);

  noteElements.current.forEach(g => g.removeAttribute("transform"));

  dragRef.current = null;
  setDragPreview(null);
}, [dragPreview, updateDraggedNote]);



  const handleSelect = useCallback((payload) => {
    setSelection(payload);
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








function onToolbarSlurClick() {
  if (!selection) return;

  // Find selection note
  let startMeasure = null;
  let startIndex = null;

  leadSheet.measures.forEach((m, mi) => {
    m.melody.forEach((n, ni) => {
      if (n.id === selection.id) {
        startMeasure = mi;
        startIndex = ni;
      }
    });
  });

  if (startMeasure === null) return;

  // Find next note
  let endMeasure = startMeasure;
  let endIndex = startIndex + 1;

  if (endIndex >= leadSheet.measures[startMeasure].melody.length) {
    endMeasure = startMeasure + 1;
    endIndex = 0;
  }

  if (
    endMeasure >= leadSheet.measures.length ||
    leadSheet.measures[endMeasure].melody.length === 0
  ) {
    return;
  }

  const newSlur = {
    id: crypto.randomUUID(),
    startMeasure,
    startIndex,
    endMeasure,
    endIndex
  };

  setLeadSheet(ls => ({
    ...ls,
    slurs: [...ls.slurs, newSlur]
  }));
}



function onToolbarTieClick() {
  if (!selection) return;

  console.log("TOOLBAR TIE CLICK", "   \nselection: ", selection)
  // Find the selection note's measure + index
  let startMeasure = null;
  let startIndex = null;

  leadSheet.measures.forEach((m, mi) => {
    m.melody.forEach((n, ni) => {
      if (n.id === selection.id) {
        startMeasure = mi;
        startIndex = ni;
      }
    });
  });

  if (startMeasure === null) return;

  // Determine the next note
  let endMeasure = startMeasure;
  let endIndex = startIndex + 1;

  // If at end of measure, move to next measure
  if (endIndex >= leadSheet.measures[startMeasure].melody.length) {
    endMeasure = startMeasure + 1;
    endIndex = 0;
  }

  // If no next measure or no next note, abort
  if (
    endMeasure >= leadSheet.measures.length ||
    leadSheet.measures[endMeasure].melody.length === 0
  ) {
    return;
  }

  // Create the tie
  const newTie = {
    id: crypto.randomUUID(),
    startMeasure,
    startIndex,
    endMeasure,
    endIndex
  };

  // Update lead sheet
  setLeadSheet(ls => ({
    ...ls,
    ties: [...ls.ties, newTie]
  }));
}








// user has applied a rest to the highlighted note
// simple switch from a note to a rest.  No duration change.

const noteToDotted = useCallback((newDotted) => {
 
console.log("HANDLE TOGGLE NOTE DOTTED", "   \nnewDotted: ", newDotted)
  if (noteInputMode) {
    // setInputDuration(duration);

    // const { measure, index } = caret;

    // setPendingInsert({
    //   pitches: [],          // REST
    //   duration,
    //   dots: 0,
    //   measureIndex: measure,
    //   melodyIndex: index
    // });

    return;
  }

  // NORMAL MODE
  if (selection?.id && selection?.type === "note") {
    setLeadSheet(prev => {
      const next = structuredClone(prev);

      for (let measureIndex = 0; measureIndex < next.measures.length; measureIndex++) {
          const measure = next.measures[measureIndex];
          const note = measure.melody.find(n => n.id === selection.id);
          // console.log('measureIndex: ', measureIndex)
          if (!note) continue;
        
          newDotted === true ? note.dots = 1 : note.dots = 0
          
            console.log('applying ripple edit ...')
          const updatedMeasures = applyRippleAcrossMeasures(
            leadSheet.measures,
            measureIndex,
            note.id,
            {
              pitches: note.pitches,     // REST
              duration: note.duration,
              dots: note.dots
            }
          );

          next.measures[measureIndex] = updatedMeasures[measureIndex];
          }


      console.log("NOTE TO DOTTED", "   \nnext: ", next)
      return next;
    });
  }
}, [selDotted, noteInputMode, caret, selection]);




// user has applied a rest to the highlighted note
// simple switch from a note to a rest.  No duration change.

const noteToRest = useCallback(() => {
 
 
console.log("HANDLE TOOL BAR REST CHANGE")
  if (noteInputMode) {
     setLeadSheet(prev => {
const next = structuredClone(prev);
return next
})

    // setInputDuration(duration);

    // const { measure, index } = caret;

    // setPendingInsert({
    //   pitches: [],          // REST
    //   duration,
    //   dots: 0,
    //   measureIndex: measure,
    //   melodyIndex: index
    // });

    return;
  }

  // NORMAL MODE
  if (selection?.id && selection?.type === "note") {
    setLeadSheet(prev => {
      const next = structuredClone(prev);

      for (let measureIndex = 0; measureIndex < next.measures.length; measureIndex++) {
        const measure = next.measures[measureIndex];
        const note = measure.melody.find(n => n.id === selection.id);
        if (!note) continue;
        note.pitches=[]
// no change in duration so no need. to apply a ripple edit

        next.measures[measureIndex] = measure;
      }

      return next;
    });
  }
}, [selRest, noteInputMode, caret, selection]);




const handleToolbarDurationChange = useCallback((newDur) => {

  // console.log("HANDLE DURATION CHANGE")

  const duration = newDur;

  if (noteInputMode) {
        if(selection) {
        setInputDuration(duration);

        const { measure, index } = caret;

        setPendingInsert({
          pitches: ["C4"],   // default pitch
          duration,
          dots: selDotted===true ? 1 : 0,
          measureIndex: measure,
          melodyIndex: index
        });
      }
    return;
  }

  // NORMAL MODE
  if (selection?.id && selection?.type === "note") {
    setLeadSheet(prev => {
      const next = structuredClone(prev);

      for (let measureIndex = 0; measureIndex < next.measures.length; measureIndex++) {
        const measure = next.measures[measureIndex];
        const note = measure.melody.find(n => n.id === selection.id);
        if (!note) continue;

        const updatedMeasures = applyRippleAcrossMeasures(
          leadSheet.measures,
          measureIndex,
       
          note.id,
          {
            pitches: note.pitches,   // keep pitch
            duration,
            dots: note.dots || 0
          }
        );

        next.measures[measureIndex] = updatedMeasures[measureIndex];
      }

      return next;
    });
  }
}, [noteInputMode, caret, selection]);





function handleAccidentalClick(acc) {
  if (noteInputMode) {
    setInputAccidental(acc);
    return;
  }

  if (!selection?.id) return;

  setLeadSheet(prev => {
    const next = structuredClone(prev);

    for (let measureIndex = 0; measureIndex < next.measures.length; measureIndex++) {
      const measure = next.measures[measureIndex];
      const note = measure.melody.find(n => n.id === selection.id);
      if (!note) continue;

      if (note.pitches && note.pitches.length > 0) {
        const oldPitch = note.pitches[0];

        // Extract letter + octave
        const letter = oldPitch[0].toUpperCase();
        const octave = oldPitch[oldPitch.length - 1];

        // Build new pitch
        const newPitch = `${letter}${acc}${octave}`;
        note.pitches = [newPitch];

        // Update guitar mapping
        const gf = pitchToGuitar(newPitch);
        if (gf) {
          note.string = gf.string;
          note.fret = gf.fret;
        }
      }

      next.measures[measureIndex] = measure;
    }

    return next;
  });
}





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
  if (!pendingInsert) return;

  const { pitch, measureIndex, melodyIndex } = pendingInsert;

  setLeadSheet(prev => {
    const next = structuredClone(prev);
    const measure = next.measures[measureIndex];

    // ⭐ Build new-format note
    const newNote = {
      id: crypto.randomUUID(),
      pitches: pitch ? [pitch] : [],   // [] = rest
      duration: inputDuration,         // "q", "h", "8", etc.
      dots: selDotted===true ? 1 : 0,
      string: null,
      fret: null
    };

    // Insert into melody
    const newMelody = [
      ...measure.melody.slice(0, melodyIndex),
      newNote,
      ...measure.melody.slice(melodyIndex)
    ];

    // ⭐ Apply ripple edit BEFORE returning state
    const updatedMeasures= applyRippleAcrossMeasures(
      leadSheet.measures,
      measureIndex,
      // { ...measure, melody: newMelody },
      null,                 // editedNoteId
      null,                 // newNoteData
      { insertedIndex: melodyIndex }
    );

    next.measures[measureIndex] = updatedMeasures[measureIndex];
    return next;
  });

  setPendingInsert(null);
}, [pendingInsert, inputDuration]);







function onTieDelete(id) {
  const newLS = {
    ...leadSheet,
    ties: leadSheet.ties.filter(t => t.id !== id)
  };
  setLeadSheet(newLS);
}

function onSlurDelete(id) {
  const newLS = {
    ...leadSheet,
    slurs: leadSheet.slurs.filter(s => s.id !== id)
  };
  setLeadSheet(newLS);
}




/* KEY HANDLER
Delete tie, begin tie creation (press T)
*/
useEffect(() => {



  function onKey(e) {

      let keys = ["a", "b", "c", "d", "e", "f", "g"]
      keys = [...keys, ...keys.map(n=>n.toUpperCase())]
      if( keys.includes(e.key)) {
          HandleKeyNoteInsert(e.key)
           e.preventDefault();
        }

       else if( ["Delete","Backspace" ].includes(e.key)) {
          HandleDelete(e.key)
        }
        // else handleKeyDown(e)
 
    setSelection(null);
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [selection]);


function HandleDelete(c){
 console.log("DELETE KEY DOWN EFFECT", "   \nselected: ", selection)
        if (c!== "Delete" && c !== "Backspace") return;
        if (!selection) return;


        switch (selection.type) {
          case "note":
            console.log("deleting note: ", selection.id)
            noteToRest()
            // deleteNote(selection);
            break;

          case "tie":
            console.log("deleting tie: ", selection.id)
            deleteTie(selection.id);
            break;

          case "slur":
            console.log("deleting slur: ", selection.id)
            deleteSlur(selection.id);
            break;

          case "chord":
            deleteChord(selection);
            break;

          // future types go here
          }

}



// Map keyboard letters → pitch names
const KEY_TO_PITCH = {
  a: "69",
  b: "71",
  c: "72",
  d: "74",
  e: "76",
  f: "77",
  g: "79"
};


// Main key handler
const HandleKeyNoteInsert = useCallback((c) => {
  if (!noteInputModeRef.current) return;

  const key = c.toLowerCase();
  if (!(key in KEY_TO_PITCH)) return;


  const pitch = KEY_TO_PITCH[key]
  const duration = inputDurationRef.current;

  const { measure, index } = caretRef.current;
console.log("KEY DOWN NOTE INSERT", pitch, inputDurationRef, measure, index, )
  insertNote({
    pitch: pitch,
    duration: inputDurationRef.current,
    measureIndex: measure,
    noteIndex: index,
    dots: selDotted===true ? 1 : 0,
  });

 
  moveCaretForward();

}, []);




function deleteTie(id) {
  setLeadSheet(ls => ({
    ...ls,
    ties: ls.ties.filter(t => t.id !== id)
  }));
}

function deleteSlur(id) {
  setLeadSheet(ls => ({
    ...ls,
    slurs: ls.slurs.filter(s => s.id !== id)
  }));
}


function deleteNote(sel) {
  const { measure, index } = sel;


  setLeadSheet(ls => {
    const measures = [...ls.measures];

    measures[measure] = {
      ...measures[measure],
      melody: measures[measure].melody.filter((_, i) => i !== index)
    };
    return { ...ls, measures };
  });
}




useEffect(() => {
  if (!caretRef.current) return;

  if (!leadSheet || !leadSheet.measures) return;

  const { measureIndex, melodyIndex } = caretRef.current;

  advanceCaret(measureIndex, melodyIndex, leadSheet);


}, [leadSheet]);   // ⭐ not pendingInsert




// useEffect(() => {
//   const onKey = (e) => {
//     if (!noteInputMode) return;

//     // A–G pitch entry
//     if ("abcdefg".includes(e.key.toLowerCase())) {
//       const pitch = mapLetterToPitch(e.key);
//       onNoteInput(pitch, caret.measure, caret.index);
//       return;
//     }

//     // 1–5 duration shortcuts
//     const map = { "1": "w", "2": "h", "3": "q", "4": "e", "5": "s" };
//     if (map[e.key]) {
//       setInputDuration(map[e.key]);
//       return;
//     }
//   };

//   window.addEventListener("keydown", onKey);
//   return () => window.removeEventListener("keydown", onKey);
// }, [noteInputMode ]);



function moveCaretForward() {
  setCaret(prev => {
    // assume the caret forwards with each pitch of the melody
    const next = { ...prev };
    const melody = leadSheet.measures[next.measure].melody
    next.index += 1;
    const lastMeasure = leadSheet.measures.length - 1;

    // Move to next measure if needed
    if (next.index >= melody.length) {
      next.index = 0;
      next.measure += 1;
    }

    // Clamp at end of score
    if (next.measure > lastMeasure) {
      next.measure = lastMeasure;
      next.index = melody.length - 1;
    }
console.log("next caret", next)
    return next;
  });
}




const advanceCaret = (measureIndex, tokenIndex, leadSheet) => {
  if( !measureIndex || tokenIndex) return;
  console.log({leadSheet,measureIndex, tokenIndex })
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
  playerRef,
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
  console.log("SELECTING NOTE ID:", id);

  if (!noteInputMode) {
    setSelection({ type: "note", id });

    // Find the selected note
    let selected = null;
    for (const m of leadSheet.measures) {
      for (const n of m.melody) {
        if (n.id === id) {
          selected = n;
          break;
        }
      }
      if (selected) break;
    }

    if (!selected) return;

    // New-format fields
    const pitches = selected.pitches || [];
    const duration = selected.duration || "q";
    const dots = selected.dots || 0;

    // REST?
    const isRest = pitches.length === 0;
    setSelRest(isRest);

    // dotted note
    selected.dots > 0 ?  setSelDotted(true) : setSelDotted( false)
    // Update toolbar duration
    // console.log("SETTING SELECTED DURATION:", duration);
    setInputDuration(duration);

    // If you want to update dots in the UI, do it here:
    // setInputDots(dots);
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
  "s": 64,

  //  "1": 1024,
  // "2": 512,
  // "4": 256,
  // "8": 128,
  // "16": 64

};

const dottedDurationToTicks = {
  // no dots
  "w0": 1024,
  "h0": 512,
  "q0": 256,
  "e0": 128,
  "s0": 64,
  // one dot - extend duration by 50%
  "w1": 1536,
  "h1": 768,
  "q1": 384,
  "e1": 192,
  "s1": 96,
  // two dots - extend duration by 75%
  "w2": 1536,
  "h2": 768,
  "q2": 384,
  "e2": 192,
  "s2": 96,
};





function getTicksFromNote(n) {

  const duration = n.duration
const dots = n.dots
let ticks = null
 for (const [dottedDur, baseTicks] of Object.entries(dottedDurationToTicks)) {
      if (`${duration}${dots}` === dottedDur) {
        ticks = baseTicks
        break;
      }
    }
  

 return ticks

}



function ticksToDuration(ticks) {

let duration = "16"
let dots = 0
 for (const [dottedDur, baseTicks] of Object.entries(dottedDurationToTicks)) {
      if (baseTicks === ticks) {
        duration = dottedDur[0];
        dots = dottedDur[1];
        break;
      }
    }
  

 return { duration: duration, dots: dots };
 
}





const MEASURE_TICKS = 1024;


function applyRippleEdit(measure, editedNoteId, newNoteData, opts = {}) {
  const next = {
    ...measure,
    melody: measure.melody.map(n => ({ ...n }))
  };

  let notes = next.melody;
  let index = -1;

  // --- APPLY EDITED NOTE ---
  if (editedNoteId) {
    index = notes.findIndex(n => n.id === editedNoteId);
    if (index === -1) {
      return { measure: next, overflowTicks: 0, underflowTicks: 0 };
    }
    notes[index] = { ...notes[index], ...newNoteData };
  }

  if (opts.insertedIndex !== undefined) {
    index = opts.insertedIndex;
  }

  // get ticks in the note that has been inserted / amended duration
  const ticksTarg = getTicksFromNote(notes[index])
  // calculate ticks from the note that has been inserted / amended duration to the end of the measure
  
   let total = notes.reduce((s, n) => s + getTicksFromNote(n), 0);
  const measureOverflowTicks = total - MEASURE_TICKS > 0 ? total - MEASURE_TICKS: 0
const targTicks = getTicksFromNote(notes[index])

  let ticksTargToEnd = 0
  for( let i = index; i < notes.length; i++ ){
      const ticks = getTicksFromNote(notes[i])
      ticksTargToEnd += ticks
      }

  let ticksToIncTarg = 0 //. including target
 for( let i = 0; i <= index; i++ ){
      const ticks = getTicksFromNote(notes[i])
      ticksToIncTarg += ticks
      }


  
      // target overflow - does the amended note itself overflow, if so then delete all following note
  const targOverflowTicks = ticksToIncTarg - MEASURE_TICKS     > 0 ? ticksToIncTarg - MEASURE_TICKS    : 0

  
  // where there is measure overflow, delete all notes after the target
  // and set the duration of the target to the ticskTargToend

  let overflowTicks = 0

  if( targOverflowTicks > 0) {
    notes = notes.slice(0, (index +1) ) // only include all from the start to the index, including the index    
    next.melody = notes
    const nTarg = notes[index]
    
    for (const [dottedDur, baseTicks] of Object.entries(dottedDurationToTicks)) {
            const tickDur =  MEASURE_TICKS - (ticksToIncTarg - targTicks)
            if (baseTicks === tickDur) {
              nTarg.duration = dottedDur[0];
              nTarg.dots = dottedDur[1];
              break;
            }
    }
  } 
  
  else {  overflowTicks = measureOverflowTicks
  }

  if( overflowTicks > 0) {
  
    // ==========================================================
    // NORMAL OVERFLOW: shorten/remove notes AFTER edited note
    // ==========================================================

    if (total > MEASURE_TICKS && index >= 0) {
      let overflow = total - MEASURE_TICKS;

      for (let i = index + 1; i < notes.length && overflow > 0; i++) {
        const n = notes[i];
        const ticks = getTicksFromNote(n);

        if (ticks <= overflow) {
          overflow -= ticks;
          notes.splice(i, 1);
          i--;
        } else {
        


          const remaining = ticks - overflow;

          let newDur = null;
          let newDots = 0;

          for (const [dottedDur, baseTicks] of Object.entries(dottedDurationToTicks)) {
            if (baseTicks === remaining) {
              newDur = dottedDur[0];
              newDots = dottedDur[1];
              break;
            }
          }

       

          if (newDur) {
            n.duration = newDur;
            n.dots = newDots;
          }

          overflow = 0;
        
      }
    
      // any leftover (rare) becomes propagated overflow
      const fixedTotal = notes.reduce((s, n) => s + getTicksFromNote(n), 0);
      overflowTicks = Math.max(0, fixedTotal - MEASURE_TICKS);
    }
  }
  }


  // ============================================================
  // UNDERFLOW
  // ============================================================
    total = notes.reduce((s, n) => s + getTicksFromNote(n), 0);
  let underflowTicks = 0;

  if (total < MEASURE_TICKS) {
    let under = MEASURE_TICKS - total;
    underflowTicks = under;

    let insertPos = index + 1;
    const sortedDurations = Object.entries(durationToTicks)
      .sort((a, b) => b[1] - a[1]);

    while (under > 0) {
      const match = sortedDurations.find(([dur, ticks]) => ticks <= under);
      if (!match) break;

      const [dur, ticks] = match;

      notes.splice(insertPos, 0, {
        id: crypto.randomUUID(),
        pitches: [],
        duration: dur,
        dots: 0,
        string: null,
        fret: null
      });

      insertPos++;
      under -= ticks;
    }
  }

  return {
    measure: next,
    overflowTicks: targOverflowTicks, // only overflow when the new / amended note stretches across measures
    underflowTicks: underflowTicks
  };
}



function applyRippleAcrossMeasures(measures, measureIdx, editedNoteId, newNoteData, opts = {}) {
  let result = applyRippleEdit(measures[measureIdx], editedNoteId, newNoteData, opts);
  measures[measureIdx] = result.measure;

  let overflow = result.overflowTicks;
  let idx = measureIdx;

  while (overflow > 0 && idx + 1 < measures.length) {
    idx++;

    const { duration, dots } = ticksToDuration(overflow);

    const overflowNote = {
      id: crypto.randomUUID(),
      pitches: newNoteData.pitches ? [...newNoteData.pitches] : [],
      duration,
      dots,
      string: newNoteData.string ?? null,
      fret: newNoteData.fret ?? null
    };

    const nextMeasure = {
      ...measures[idx],
      melody: [overflowNote, ...measures[idx].melody.map(n => ({ ...n }))]
    };

    result = applyRippleEdit(
      nextMeasure,
      overflowNote.id,
      overflowNote,
      { insertedIndex: 0 }
    );

    measures[idx] = result.measure;
    overflow = result.overflowTicks;
  }

  return measures;
}






function extractPitchFromNote(note) {
  if (!note || !note.pitches || note.pitches.length === 0) return null;
  return note.pitches[0]; // single‑note melody
}



function transposePitch(pitch, semitones) {
  // pitch like "C#4"
  const letter = pitch[0].toUpperCase();
  const accidental = pitch.length === 3 ? pitch[1] : "";
  const octave = parseInt(pitch[pitch.length - 1], 10);

  const pitchClassMap = {
    C: 0, "C#": 1, Db: 1,
    D: 2, "D#": 3, Eb: 3,
    E: 4,
    F: 5, "F#": 6, Gb: 6,
    G: 7, "G#": 8, Ab: 8,
    A: 9, "A#": 10, Bb: 10,
    B: 11
  };

  const pc = pitchClassMap[letter + accidental];
  let midi = octave * 12 + pc;
  midi += semitones;

  const newOct = Math.floor(midi / 12);
  const newPc = midi % 12;

  const reverseMap = {
    0: "C", 1: "C#", 2: "D", 3: "D#",
    4: "E", 5: "F", 6: "F#", 7: "G",
    8: "G#", 9: "A", 10: "A#", 11: "B"
  };

  return reverseMap[newPc] + newOct;
}




function updateDraggedNote(noteId, semitones, durationSteps) {
  console.log("UPDATE DRAGGED NOTE")
  setLeadSheet(prev => {
    const next = structuredClone(prev);

    for (const measure of next.measures) {
      const note = measure.melody.find(n => n.id === noteId);
      if (!note) continue;

      //
      // ⭐ PITCH UPDATE (new format)
      //
      if (note.pitches && note.pitches.length > 0) {
        const oldPitch = note.pitches[0];
        const newPitch = transposePitch(oldPitch, semitones);

        note.pitches = [newPitch];

        // update guitar mapping
        const gf = pitchToGuitar(newPitch);
        if (gf) {
          note.string = gf.string;
          note.fret = gf.fret;
        }
      }

      //
      // ⭐ DURATION UPDATE (new format)
      //
    if (durationSteps !== 0) {
        const order = ["16", "8", "q", "h", "w"];
        let idx = order.indexOf(note.duration);

        // Default to quarter if somehow invalid
        if (idx === -1) idx = 2;

        // ⭐ CLAMP the index so it never escapes the valid range
        idx = Math.min(Math.max(idx + durationSteps, 0), order.length - 1);

        note.duration = order[idx];
      }

    }

    return next;
  });
}


  return (

    
<>
    


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
          noteInputModeRef={noteInputModeRef}
          handleToolbarDurationChange={handleToolbarDurationChange}
          noteToRest={noteToRest}
          handleAccidentalClick={handleAccidentalClick}
          onToolbarTieClick={onToolbarTieClick}
          onToolbarSlurClick={onToolbarSlurClick}
          inputDuration={inputDuration}
          setInputDuration={setInputDuration}
          selection={selection}
          selRest={selRest}
          setSelRest={setSelRest}
          selDotted={selDotted}
          setSelDotted={setSelDotted}
          noteToDotted={noteToDotted}
          
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
        // height: "100vh",   // full viewport
        minHeight: 0,
        // pointerEvents: "none"     // ← ADD THIS
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
        className = "lsScrollContainer"
         style={{
      flex: 2,
      minHeight: 0,
      overflowY: "auto",   // this MUST scroll
      border: "1px solid #ddd",
      borderRadius: 4,
      // padding: 8,    // ⭐ important: don't use padding as this causes the VexFlow svg coordinates to be out by the padding
      boxSizing: "border-box",
      position: "relative"   // ⭐ REQUIRED FOR CURSOR ALIGNMENT
    }}
        >
          <LeadSheetRenderer
            {...props}
        leadSheet={leadSheet}
        lsContainerRef={lsContainerRef}
        renderDataUI={renderDataUI}
        setRenderDataUI={setRenderDataUI}
        rendererRef={rendererRef} 
        playerRef={playerRef}
        onNoteDragStart={handleNoteDragStart}
        measures={leadSheet.measures}
        onNoteSelect={handleNoteSelect}
        dragPreview={dragPreview} 
        setDragPreview={setDragPreview}
        dragRef={dragRef}
        noteInputMode={noteInputMode}
        onNoteInput={onNoteInput}
        caret={caret}
        setCaret={setCaret}
        caretRef={caretRef}
        tieStart={tieStart}
        setTieStart={setTieStart}
        selection={selection}
        setSelection={setSelection}
        onTieDelete={onTieDelete}
        onSlurDelete={onSlurDelete}
        noteInputModeRef={noteInputModeRef}
        inputDurationRef={inputDurationRef}
        staveRef={staveRef} 
        vfCacheRef = {vfCacheRef}
        lastMeasureLayoutRef={lastMeasureLayoutRef}
        // onMouseMove={handleMouseMove}
          />

{/* <NoteInputCursorOverlay

  style={{
        color: "red",
        fill: "red",
   stroke:"#00aaff",
      fill: "#00aaff",
      }}
      /> */}
 {/* {noteInputMode && (
       <NoteInputCursor
            lsContainerRef={lsContainerRef}
            visible={noteInputMode && cursorVisible}
            duration={inputDuration}
            pitch={cursorPitch}
            topLineY={cursorStaveInfo?.topLineY}
            spacing={cursorStaveInfo?.spacing}
            staveRef={staveRef} 
            style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 9999,

   
      }}
          />
  )} */}

 {noteInputMode && (
<NoteInputCaret
            caret={caret}
            caretRef={caretRef}
            vfCacheRef={vfCacheRef}
            leadSheet={leadSheet}
            lastMeasureLayoutRef={lastMeasureLayoutRef}
            style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 9999,

   
      }}
          />
    )}


        </div>

     
      </div>
    </div>
    </div>
    </div>
</>

  );
}