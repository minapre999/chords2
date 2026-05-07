import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef,   useLayoutEffect, } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";
import RenderData, {RenderNote} from "/src/render-notes.js"
import Note from "/src/harmony/note.js"
import "./LeadSheetRenderer.css"
import { isNumber } from "tone";



// function debug(label, value) {
//   // console.log(`DEBUG ${label}:`, value);
//   if (value === "4/q" || value === "4q" || value === "r") {
//     console.trace("STACK TRACE FOR BAD VALUE");
//   }
// }








const KEY_SIGNATURES = {
  // No sharps or flats
  C: {},

  // Sharp keys
  G:  { F: "#" },
  D:  { F: "#", C: "#" },
  A:  { F: "#", C: "#", G: "#" },
  E:  { F: "#", C: "#", G: "#", D: "#" },
  B:  { F: "#", C: "#", G: "#", D: "#", A: "#" },
  "F#": { F: "#", C: "#", G: "#", D: "#", A: "#", E: "#" },
  "C#": { F: "#", C: "#", G: "#", D: "#", A: "#", E: "#", B: "#" },

  // Flat keys
  F:  { B: "b" },
  Bb: { B: "b", E: "b" },
  Eb: { B: "b", E: "b", A: "b" },
  Ab: { B: "b", E: "b", A: "b", D: "b" },
  Db: { B: "b", E: "b", A: "b", D: "b", G: "b" },
  Gb: { B: "b", E: "b", A: "b", D: "b", G: "b", C: "b" },
  Cb: { B: "b", E: "b", A: "b", D: "b", G: "b", C: "b", F: "b" }
};




function getKeySigAccidental(key, letter) {
  const map = KEY_SIGNATURES[key] || {};
  return map[letter.toUpperCase()] || null;
}


function shouldShowAccidental({
  writtenAcc,
  keySigAcc,
  previousAcc
}) {
  // Rule 1: differs from key signature
  if (writtenAcc !== keySigAcc) return true;

  // Rule 2: differs from previous accidental in measure
  if (writtenAcc !== previousAcc) return true;

  return false;
}









const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function semitoneToPitch(baseMidi, offset) {
  const midi = baseMidi + offset;
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${PITCH_CLASSES[pc]}${octave}`; // e.g. "C4"
}


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




export const durationMap = {
  w: "1",
  h: "2",
  q: "4",
  "8": "8",
  "16": "16",
  "e": "8",
  "s": "16"
};


export default function LeadSheetRenderer(props) {
  const {
    leadSheet,
    rendererRef,
    onNoteSelect,
    onNoteDragStart,
    dragPreview,
    dragRef,
    caret,
    setCaret,
    noteInputMode,
    tieStart,
    setTieStart,
    onTieDelete,
    selection,
    setSelection,
    noteInputModeRef,
    // onMouseMove,
    lsContainerRef,
    onNoteInput,
    setCursorPos,
    cursorPosRef,
    cursorStaveInfo,
    setCursorStaveInfo,
    vfCacheRef,
    lastMeasureLayoutRef,
    staveRef,
    ...rest
  } = props;



// console.log("onNoteInput: ", onNoteInput)
  const noteElements = useRef(new Map());
  const measureElements = useRef(new Map());
  const playheadRef = useRef(null);
  const isDragging = useRef(false);
  const originalYRef = useRef({});
  const semitoneStepRef = useRef(3);

  const slurCurveLayerRef = useRef(null);
  const slurHitLayerRef = useRef(null);
  const tieCurveLayerRef = useRef(null);
  const tieHitLayerRef = useRef(null);

  const measures = leadSheet?.measures ?? [];
  const effectGuard = useRef(false);

  const lastCtxRef = useRef(null);
  const lastNoteLookupRef = useRef(null);




  // for debugging
  useEffect(() => {
    window.vfCacheRef = vfCacheRef;
    window.caret = caret

  }, [leadSheet, caret]);
 


  //
  // Re-draw ties when selection or ties change
  //
  useEffect(() => {
    if (!lastCtxRef.current) return;

    drawTies({
      ctx: lastCtxRef.current,
      noteLookup: lastNoteLookupRef.current,
      measureLayout: lastMeasureLayoutRef.current,
      leadSheet,
      selection,
      setSelection,
      lsContainerRef,
      tieHitLayerRef,
      tieCurveLayerRef
    });
  }, [selection, leadSheet.ties]);

  //
  // Re-draw slurs when selection or slurs change
  //
  useEffect(() => {
    if (!lastCtxRef.current) return;

    drawSlurs({
      ctx: lastCtxRef.current,
      noteLookup: lastNoteLookupRef.current,
      measureLayout: lastMeasureLayoutRef.current,
      leadSheet,
      selection,
      setSelection,
      lsContainerRef,
      slurHitLayerRef,
      slurCurveLayerRef
    });
  }, [selection, leadSheet.slurs]);


  useEffect(() => {
  updateHitAreasForMode(noteInputMode);
}, [noteInputMode]);

    function updateHitAreasForMode(isInputMode) {
  document.querySelectorAll(".staff-hit").forEach(rect => {
    rect.style.pointerEvents = isInputMode ? "all" : "none";
  });
}



// debugging

// window.addEventListener("mousedown", e => {
//   const el = document.elementFromPoint(e.clientX, e.clientY);
//   // console.log("TOP ELEMENT:", el);
// });




  //
  // Imperative API
  //
  useImperativeHandle(rendererRef, () => ({
    highlightNote(noteId) {
      noteElements.current.forEach(el => el.classList.remove("vf-highlight-note"));
      const el = noteElements.current.get(noteId);
      if (!el) return;
      el.classList.add("vf-highlight-note");
    },

    highlightMeasure(measureId) {
      measureElements.current.forEach(el => el.classList.remove("vf-highlight-measure"));
      const el = measureElements.current.get(measureId);
      if (!el) return;
      el.classList.add("vf-highlight-measure");
    },

    setPlayheadBeat(x, y1, y2) {
      if (!playheadRef.current) return;
      playheadRef.current.setAttribute("x1", x);
      playheadRef.current.setAttribute("x2", x);
      playheadRef.current.setAttribute("y1", y1);
      playheadRef.current.setAttribute("y2", y2);
    }
  }));


  
// DRAW CARET IN USE EFFECT - vfCacheNotes should have been defined
    

  //
  // Draw caret
  //
  const drawCaret = (svg, drawInfo) => {
            //setCaret({ measure: measureIdx, index: idx });
  //   const measure = leadSheet.measures[caret.measure]
  // if(vfCacheRef?.current) {
  //     const { vfNotes } = vfCacheRef?.current?.get(measure.id).vfNotes
  //     const vfNote = vfNotes[caret.index]
  //     console.log("lastMeasureLayoutRef", lastMeasureLayoutRef?.current)

  //       }

// const vfNote = vfNotes.get[]
//   // 3. Compute cursor X
//   const noteX = vfNote.getAbsoluteX();

//   // 4. Store everything for drawing
//   caretDrawInfo = {
//     x: noteX,
//     yTop: staveInfo.topLineY,
//     yBottom: staveInfo.topLineY + staveInfo.spacing * 4,
//     width: vfNote.width,
//     ledgerYs
//   };


    const {x,yTop, yBottom, width} = drawInfo
    console.log("drawCaret", {svg, x, yTop, yBottom})
    const caretLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    caretLine.setAttribute("x1", x);
    caretLine.setAttribute("x2", x);
    caretLine.setAttribute("y1", yTop);
    caretLine.setAttribute("y2", yBottom);
    caretLine.setAttribute("stroke", "#4a7aff");
     caretLine.setAttribute("opacity", "0.3");
    caretLine.setAttribute("stroke-width", width * 2);
    caretLine.setAttribute("pointer-events", "none");
    svg.appendChild(caretLine);
  }; // drawCaret

  //
  // Tie segment drawing (unchanged)
  //
  function drawTieSegment({
    x1, y1, x2, y2,
    isSelected,
    curveLayer,
    hitLayer,
    tie,
    setSelection
  }) {
    const offset = 10;

    const c1x = x1 + (x2 - x1) * 0.33;
    const c2x = x1 + (x2 - x1) * 0.66;
    const c1y = y1 + offset;
    const c2y = y2 + offset;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
    );
    path.setAttribute("stroke", isSelected ? "dodgerblue" : "black");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", isSelected ? 2 : 1);

    curveLayer.appendChild(path);

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    hit.setAttribute("x", Math.min(x1, x2));
    hit.setAttribute("width", Math.abs(x2 - x1));

    const hitHeight = 8;
    const hitYOffset = 4;
    const topLineY = Math.max(y1, y2);

    hit.setAttribute("y", topLineY + hitYOffset);
    hit.setAttribute("height", hitHeight);
    hit.setAttribute("fill", "transparent");

    // debugging 
//     hit.setAttribute("fill", "rgba(204, 255, 0, 0.5)");
// hit.setAttribute("stroke", "rgba(221, 255, 0, 0.5)");


    hit.style.pointerEvents = "all";
    hit.style.cursor = "pointer";

    hit.addEventListener("pointerdown", e => {
      e.stopPropagation();
      setSelection({ type: "tie", id: tie.id });
    });

    hitLayer.appendChild(hit);
  } // drawTieSegment

  //
  // Draw ties (unchanged except: noteLookup now contains new-format notes)
  //
  function drawTies({
    noteLookup,
    measureLayout,
    leadSheet,
    selection,
    setSelection,
    lsContainerRef,
    tieCurveLayerRef,
    tieHitLayerRef
  }) {
    if (!noteLookup) return;

    const svgList = lsContainerRef.current?.querySelectorAll("svg");
    const svg = svgList?.[svgList.length - 1];
    if (!svg) return;

    let curveLayer = tieCurveLayerRef.current;
    if (!curveLayer || !curveLayer.isConnected) {
      curveLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      curveLayer.setAttribute("id", "tie-curve-layer");
      svg.appendChild(curveLayer);
      tieCurveLayerRef.current = curveLayer;
    }
    while (curveLayer.firstChild) curveLayer.removeChild(curveLayer.firstChild);

    let hitLayer = tieHitLayerRef.current;
    if (!hitLayer || !hitLayer.isConnected) {
      hitLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      hitLayer.setAttribute("id", "tie-hit-layer");
      hitLayer.style.pointerEvents = "none";
      svg.appendChild(hitLayer);
      tieHitLayerRef.current = hitLayer;
    }
    while (hitLayer.firstChild) hitLayer.removeChild(hitLayer.firstChild);

    leadSheet.ties.forEach(tie => {
      const start = noteLookup.get(`${tie.startMeasure}:${tie.startIndex}`);
      const end   = noteLookup.get(`${tie.endMeasure}:${tie.endIndex}`);
      if (!start || !end) return;

      const startLayout = measureLayout[tie.startMeasure];
      const endLayout   = measureLayout[tie.endMeasure];

      const startSystem = startLayout.systemIndex;
      const endSystem   = endLayout.systemIndex;

      const isSelected = selection?.type === "tie" && selection.id === tie.id;

      if (startSystem === endSystem) {
        drawTieSegment({
          x1: start.vfNote.getAbsoluteX(),
          y1: start.vfNote.getYs()[0],
          x2: end.vfNote.getAbsoluteX(),
          y2: end.vfNote.getYs()[0],
          isSelected,
          curveLayer,
          hitLayer,
          tie,
          setSelection
        });
        return;
      }

      const rightX = startLayout.stave.getTieEndX();
      const yA = start.vfNote.getYs()[0];

      drawTieSegment({
        x1: start.vfNote.getAbsoluteX(),
        y1: yA,
        x2: rightX,
        y2: yA,
        isSelected,
        curveLayer,
        hitLayer,
        tie,
        setSelection
      });

      const leftX = endLayout.stave.getTieStartX();
      const yB = end.vfNote.getYs()[0];

      drawTieSegment({
        x1: leftX,
        y1: yB,
        x2: end.vfNote.getAbsoluteX(),
        y2: yB,
        isSelected,
        curveLayer,
        hitLayer,
        tie,
        setSelection
      });
    });
  } // drawTies




function drawSlurs({
  ctx,
  noteLookup,
  measureLayout,
  leadSheet,
  selection,
  setSelection,
  lsContainerRef,
  slurHitLayerRef,
  slurCurveLayerRef,
  
}) {
  const svgList = lsContainerRef.current?.querySelectorAll("svg");
  const svg = svgList?.[svgList.length - 1];
  if (!svg) return;

  //
  // --- CREATE OR ATTACH CURVE LAYER ---
  //
  let curveLayer = slurCurveLayerRef.current;
  if (!curveLayer || !curveLayer.isConnected) {
    curveLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    curveLayer.setAttribute("id", "slur-curve-layer");
    svg.appendChild(curveLayer);
    slurCurveLayerRef.current = curveLayer;
  }

  // Clear old curves
  while (curveLayer.firstChild) {
    curveLayer.removeChild(curveLayer.firstChild);
  }

  //
  // --- CREATE OR ATTACH HIT LAYER ---
  //
  let hitLayer = slurHitLayerRef.current;
  if (!hitLayer || !hitLayer.isConnected) {
    hitLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hitLayer.setAttribute("id", "slur-hit-layer");
    // hitLayer.style.pointerEvents = "all";
    hitLayer.style.pointerEvents = "none";

    svg.appendChild(hitLayer);
    slurHitLayerRef.current = hitLayer;
  }

  // Clear old hitboxes
  while (hitLayer.firstChild) {
    hitLayer.removeChild(hitLayer.firstChild);
  }

  //
  // --- DRAW EACH SLUR ---
  //
  leadSheet.slurs.forEach(slur => {
    const start = noteLookup.get(`${slur.startMeasure}:${slur.startIndex}`);
    const end   = noteLookup.get(`${slur.endMeasure}:${slur.endIndex}`);
    if (!start || !end) return;

    const isSelected = selection?.type === "slur" && selection.id === slur.id;

    const x1 = start.vfNote.getAbsoluteX();
    const y1 = start.vfNote.getYs()[0];

    const x2 = end.vfNote.getAbsoluteX();
    const y2 = end.vfNote.getYs()[0];

    // Horizontal curvature
    const c1x = x1 + (x2 - x1) * 0.33;
    const c2x = x1 + (x2 - x1) * 0.66;

    // Determine slur direction based on stems
    const stemUpStart = start.vfNote.getStemDirection() === 1;
    const stemUpEnd   = end.vfNote.getStemDirection() === 1;

    // If both stems up → slur above, else below
    const slurAbove = stemUpStart && stemUpEnd;

    // Vertical curvature
    const offset = 20;
    const c1y = slurAbove ? y1 + offset : y1 - offset;
    const c2y = slurAbove ? y2 + offset : y2 - offset;



    //
    // --- DRAW CURVE AS SVG PATH ---
    //
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
    );
    path.setAttribute("stroke", isSelected ? "dodgerblue" : "black");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", isSelected ? 2 : 1);

    curveLayer.appendChild(path);

    //
    // --- HITBOX ---
    //
const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect");

hit.setAttribute("x", Math.min(x1, x2));
hit.setAttribute("width", Math.abs(x2 - x1));

// thin strip below the curve
const hitHeight = 8;
const hitYOffset = 4;
const topLineY = Math.max(y1, y2);

hit.setAttribute("y", topLineY + hitYOffset);
hit.setAttribute("height", hitHeight);

hit.setAttribute("fill", "transparent");

// critical:
hit.style.pointerEvents = "all";
hit.style.cursor = "pointer";   // ← THIS restores the pointer cursor

hit.addEventListener("pointerdown", e => {
  e.stopPropagation();
  setSelection({ type: "slur", id: slur.id });
});

hitLayer.appendChild(hit);

  }); // slurs.forEach
} // DRAW SLURS






function findStaveAtXY(x, y, layout) {
  if (!layout) return null;

  for (const m of layout) {
    const topLineY = m.topLineY;      // ← use the real top line
    const left = m.measureX
    const right = left + m.measureWidth
    const spacing = m.spacing;

    const hitPadding = 12 * (spacing / 2);
    const top = topLineY - hitPadding;
    const bottom = topLineY + hitPadding + 5 * spacing;

    // console.log("findStaveAtXY", {m, x, y, top, bottom, left, right})
    if (y >= top && y <= bottom && x>= left && x <= right) {
      return m;
    }
  }

  return null;
}




function clientToSvgPoint(e, svg) {
  const rect = svg.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}


function snapToStaveLine( y, staveInfo){
  // just need to snap to the nearest half space
const { topLineY, spacing } = staveInfo;
const halfSpacing = spacing / 2;
let snapY = Math.floor(y/5)*5 // snap to the next lowest half space

// hard code this for now assume 17 max frets and standard tuning
// F5 is the top line, F6 = fret 13, A6 = fret 17, B6 = fret19
// E4 is the bottom line, E5 is the lowest not

// console.log("snapToStaveLine", {y, snapY})
return snapY
  }


function pitchFromY(y, staveInfo) {
  const { topLineY, spacing } = staveInfo;
  // console.log("pitchFromY CALLED", { y, staveInfo });
  // ⭐ FIX: your Y is consistently one staff-step too high
  // so we shift it DOWN by halfSpacing to correct it
  const halfSpacing = spacing / 2;
  // const correctedY = y + halfSpacing;
  const correctedY = y;

  // Each staff step (line/space) = spacing / 2
  const diatonicSteps = Math.round((correctedY - topLineY) / halfSpacing);

  // Treble clef reference: top line = F5 = MIDI 77
  const baseMidi = 77;      // F5
  const baseDegree = 3;     // 0=C,1=D,2=E,3=F,4=G,5=A,6=B

  // Major scale semitone pattern relative to C
  const semis = [0, 2, 4, 5, 7, 9, 11];

  // Moving DOWN the staff lowers the diatonic degree
  const totalDegree = baseDegree - diatonicSteps;

  // Octave offset in diatonic space
  const octaveOffset = Math.floor(totalDegree / 7);

  // Degree within octave (0–6), wrapped for negatives
  const degree = ((totalDegree % 7) + 7) % 7;

  // Semitone offset from F within the octave
  const semitoneOffset = semis[degree] - semis[baseDegree];

  // Final MIDI
  return baseMidi + octaveOffset * 12 + semitoneOffset;
}




function yFromPitch(midi, staveInfo) {
  const { topLineY, spacing } = staveInfo;
  const halfSpacing = spacing / 2;

  // Treble clef reference: F5 = MIDI 77 at line 0
  const baseMidi = 77;
  const baseDegree = 3; // F

  // Major scale semitone pattern relative to C
  const semis = [0, 2, 4, 5, 7, 9, 11];

  // Semitone distance from F5
  const semitoneDelta = midi - baseMidi;

  // Convert semitone delta → diatonic steps
  let diatonicSteps = 0;
  let remaining = semitoneDelta;

  // Move by octaves first
  while (remaining >= 12) {
    diatonicSteps += 7;
    remaining -= 12;
  }
  while (remaining <= -12) {
    diatonicSteps -= 7;
    remaining += 12;
  }

  // Now find the closest diatonic degree within the octave
  let bestDegree = 0;
  let bestDiff = Infinity;

  for (let deg = 0; deg < 7; deg++) {
    const semitone = semis[deg] - semis[baseDegree];
    const diff = Math.abs(semitone - remaining);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestDegree = deg;
    }
  }

  diatonicSteps += bestDegree;

  // Convert diatonic steps → Y
  return topLineY + diatonicSteps * halfSpacing;
}




// dont really want the "beat", rather the index
function getNoteIndexForX(x, staveInfo) {
  
  const { measureX, measureWidth, beats } = staveInfo;
// fior now assume it is the melody which is the vfCacheref
// will need to update the vfCacheRef to include other parts

  const { vfNotes } = vfCacheRef.current.get(staveInfo.measureId);
  // const stave = cursorStaveInfo?.stave
  const stave = staveInfo.stave
  console.log({stave})
  const topY = stave.getYForLine(0);
  const bottomY = stave.getYForLine(4);

  let found = null
  let foundIndex = null
  const padding = 6
  for(let i =0; i < vfNotes.length; i++) {
    const vfNote = vfNotes[i]
    const rect = vfNote.getBoundingBox()
    if(  x > rect.getX() - padding  && x < rect.getX()  + rect.getW()  + padding ){

        found = vfNote
        foundIndex = i
        break;
      }
  }


if( !found) {
  console.log("couldnt find note correspondign to x click ", {x, vfNotes})
  return;
}
console.log({foundIndex, found})
return foundIndex

}








function findNoteAtX(x, noteBoxes) {
  return noteBoxes.find(box => x >= box.x1 && x <= box.x2);
}

// for  closest note instead of strict containment:
function findClosestNoteAtX(x, noteBoxes) {
  let best = null;
  let bestDist = Infinity;

  for (const box of noteBoxes) {
    const center = (box.x1 + box.x2) / 2;
    const dist = Math.abs(center - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = box;
    }
  }
  return best;
}





function getNoteBoundingBoxes(vfNotes) {
  return vfNotes.map(note => {
    const bb = note.getBoundingBox();
    return {
      note,
      x1: bb.getX(),
      x2: bb.getX() + bb.getW(),
      y1: bb.getY(),
      y2: bb.getY() + bb.getH(),
      width: bb.getW(),
      height: bb.getH(),
    };
  });
}


function moveCaretToNote(vfNote, measureIdx, noteIdx) {
  if (!vfNote) return;

  // 1. Get the absolute X position of the VexFlow note
  const absX = vfNote.getAbsoluteX();

  // 2. Get the measure layout info
  const layout = measureLayoutRef.current[measureIdx];
  if (!layout) return;

  // 3. Compute caret beat index
  //    (You already have getNoteIndexForX)
  const beatIndex = getNoteIndexForX(absX, layout);

  // 4. Update caret state
  caretRef.current = {
    measureIdx,
    beatIndex,
    x: absX,
    y: layout.topLineY
  };

  // 5. Trigger React to re-render the caret overlay
  setCaret({
    measureIdx,
    beatIndex,
    // x: absX,
    // y: layout.topLineY
  });
}




function getNoteRectFromX(x, vfNotes) {
  const boxes = vfNotes.map(note => {
    const bb = note.getBoundingBox();
    return {
      note,
      x1: bb.getX(),
      x2: bb.getX() + bb.getW(),
      y1: bb.getY(),
      y2: bb.getY() + bb.getH(),
      width: bb.getW(),
      height: bb.getH(),
    };
  });

  // strict containment
  const hit = boxes.find(b => x >= b.x1 && x <= b.x2);
  if (hit) return hit;

  // fallback: closest note
  let best = null;
  let bestDist = Infinity;
  for (const b of boxes) {
    const center = (b.x1 + b.x2) / 2;
    const dist = Math.abs(center - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = b;
    }
  }
  return best;
}




// function cursorYFromPitch(midi, staveInfo) {
//   const { stave } = staveInfo;

//   // VexFlow treble clef mapping: MIDI → lineIndex
//   const midiToLineIndex = {
//     77: 0,   // F5
//     76: 0.5, // E5
//     74: 1,   // D5
//     72: 1.5, // C5
//     71: 2,   // B4
//     69: 2.5, // A4
//     67: 3,   // G4
//     65: 3.5, // F4
//     64: 4,   // E4
//     62: 4.5, // D4
//     60: 5,   // C4
//     59: 5.5, // B3
//     57: 6,   // A3
//     55: 6.5, // G3
//     53: 7,   // F3
//     52: 7.5, // E3
//     50: 8,   // D3
//     48: 8.5, // C3
//   };

//   // Find nearest mapped pitch
//   let closest = 77;
//   for (const p in midiToLineIndex) {
//     if (Math.abs(midi - p) < Math.abs(midi - closest)) {
//       closest = p;
//     }
//   }

//   const lineIndex = midiToLineIndex[closest];

//   return stave.getYForLine(lineIndex);
// }



function cursorYFromPitch(midi, staveInfo) {
  const { stave } = staveInfo;

  // E5 = MIDI 76 = lineIndex -0.5 (space above top line)

  
  const lineIndex = (76 - midi) / 2 - 0.5;

  return stave.getYForLine(lineIndex);
}





// function cursorYFromPitch(midi, staveInfo) {
//   const { topLineY, spacing } = staveInfo;
//   const half = spacing / 2;

//   // Same reference as pitchFromY
//   const baseMidi = 77; // F5
//   const baseDegree = 3;
//   const semis = [0, 2, 4, 5, 7, 9, 11];

//   // Convert MIDI back to diatonic degree
//   const semitoneOffset = midi - baseMidi;

//   // Find degree within octave
//   let degree = semis.indexOf((semitoneOffset % 12 + 12) % 12);
//   if (degree === -1) {
//     // handle accidentals by rounding to nearest diatonic
//     degree = semis.reduce((best, s, i) =>
//       Math.abs(s - (semitoneOffset % 12)) <
//       Math.abs(semis[best] - (semitoneOffset % 12))
//         ? i
//         : best,
//       0
//     );
//   }

//   const octaveOffset = Math.floor(semitoneOffset / 12);
//   const totalDegree = baseDegree + degree + octaveOffset * 7;

//   // ⭐ Correct direction: DOWNWARD Y = LOWER pitch
//   const diatonicSteps = baseDegree - totalDegree;

//   return topLineY + diatonicSteps * half;
// }



function getCursorLedgerLines(midi, staveInfo) {
  const { topLineY, spacing } = staveInfo;
  const half = spacing / 2;

  const y = cursorYFromPitch(midi, staveInfo);
  // const steps = Math.round((y - topLineY) / half);
const steps = (y - staveInfo.topLineY) / (staveInfo.spacing / 2);

  const ledgerLines = [];

  // ABOVE staff
  if (steps <= -2) {
    for (let s = -2; s >= steps; s -= 2) {
      ledgerLines.push(topLineY + s * half);
    }
  }

  // BELOW staff
  if (steps >= 10) {
    for (let s = 10; s <= steps; s += 2) {
      ledgerLines.push(topLineY + s * half);
    }
  }

  return ledgerLines;
}




function pitchToVexflowKey(pitch) {
  // pitch is like "C4", "Eb4", "F#3"
  // console.log("pitchToVexflowKey: ", pitch)
  const match = pitch.match(/^([A-Ga-g])(b|#)?(\d)$/);
  if (!match) throw new Error("Invalid pitch: " + pitch);

  let [, letter, accidental, octave] = match;

  letter = letter.toLowerCase(); // VexFlow requires lowercase
  accidental = accidental || "";

  return `${letter}${accidental}/${octave}`;
}


function buildVexflowNotes(melody) {
    const VF = window.Vex.Flow;
  // console.log("buildVexflowNotes: ", melody)
  return melody.map(n => {
    const isRest = n.pitches.length === 0;

    const vfDur = durationMap[n.duration];
    const dur = isRest ? vfDur + "r" : vfDur;

    const keys = isRest
      ? ["b/4"]
      : n.pitches.map(p => pitchToVexflowKey(p));

    const vfNote = new VF.StaveNote({
      keys,
      duration: dur,
      auto_stem: true
    });

    const dots = n.dots || 0;
    for (let i = 0; i < dots; i++) {
      vfNote.addDotToAll();
    }

    // ⭐ Manually fix ticks for dots (so Voice strict works)
    if (dots > 0) {
      const base = vfNote.getIntrinsicTicks(); // 4096 for quarter
      const factor = Math.pow(1.5, dots);      // 1 dot → 1.5, 2 dots → 2.25, etc.
      vfNote.setIntrinsicTicks(base * factor);
    }

    return vfNote;
  });
}




function formatStrictVoice(voice, staveWidth) {
    const VF = window.Vex.Flow;
  const formatter = new VF.Formatter();

  // ⭐ REQUIRED IN VEXFLOW 4:
  // joinVoices builds ModifierContexts + TickContexts
  formatter.joinVoices([voice]);

  // ⭐ REQUIRED IN VEXFLOW 4:
  // format applies dot multipliers and updates intrinsicTicks
  formatter.format([voice], staveWidth);
}



function buildStrictVoice(vfNotes) {
    const VF = window.Vex.Flow;
  const voice = new VF.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: VF.RESOLUTION
  });

  voice.setMode(VF.Voice.Mode.STRICT);
  voice.addTickables(vfNotes);

  return voice;
}





  // ⭐ StrictMode‑safe VexFlow render
  useLayoutEffect(() => {
    
    if (!lsContainerRef.current) return;
    if (dragRef.current) return; // freeze during drag

    // console.log("USE LAYOUT EFFECT")

    // StrictMode dev double‑invoke guard
    if (effectGuard.current) return;
    effectGuard.current = true;

    let caretDrawInfo = null;

    lsContainerRef.current.innerHTML = "";
    noteElements.current.clear();
    measureElements.current.clear();
    originalYRef.current = {};

    const VF = window.Vex.Flow;
    const staveWidth = 350;
    const staveHeight = 120;
    const colsPerRow = 2;

    const rows = Math.ceil(measures.length / colsPerRow);
    const svgWidth = 900;
    const svgHeight = 40 + rows * staveHeight;

    const renderer = new VF.Renderer(
      lsContainerRef.current,
      VF.Renderer.Backends.SVG
    );
    renderer.resize(svgWidth, svgHeight);

    const ctx = renderer.getContext();
    // const svg = ctx.svg;   // ⭐ THIS is the missing line

    const svgList = lsContainerRef.current.querySelectorAll("svg");
const svg = svgList[svgList.length - 1];


if (!svg || svg.parentNode !== lsContainerRef.current) {
  console.error("Lead-sheet SVG not found");
  return;
}


    const noteLookup = new Map();
    const measureLayout = []


const durationMap = {
  w: "1",
  h: "2",
  q: "4",
  "8": "8",
  "16": "16",
  "e": "8",
  "s": "16"
};


// function pitchToVexflowKey(midi) {
//   const pitchClasses = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

//   const pc = midi % 12;
//   const octave = Math.floor(midi / 12) - 1; // MIDI 60 → C4

//   return `${pitchClasses[pc]}/${octave}`;
// }



    // -----------------------------
    // Render measures + notes
    // -----------------------------
   console.log("REDRAWING MEASURE")
measures.forEach((measure, measureIdx) => {
  const row = Math.floor(measureIdx / colsPerRow);
  const col = measureIdx % colsPerRow;

  const x = 20 + col * staveWidth;
const y = 40 + row * staveHeight;
const stave = new VF.Stave(x, y, staveWidth);

// FIRST MEASURE: CLEF, TIME, KEY
if (measureIdx === 0) {
  stave.addClef("treble");
  stave.addTimeSignature("4/4");
  stave.addKeySignature(leadSheet.key || "G");
}

// DRAW STAVE
const measureGroup = ctx.openGroup();
stave.setContext(ctx).draw();
// if(measureIdx === 0){
// console.log("DRAWN STAVE OBJECT", stave);
// }

ctx.closeGroup();
measureElements.current.set(measure.id, measureGroup);

// ⭐ AFTER DRAW: use REAL bounding box
const bbox = stave.getBoundingBox();


measureLayout[measureIdx] = {
  measureX: x,
  measureY: y,
  measureWidth: staveWidth,
  row,
  systemIndex: row,
  stave,
  topLineY: stave.getYForLine(0),
  spacing: stave.getSpacingBetweenLines(),
  hitTop: bbox.getY(),
  hitHeight: bbox.getH(),
  beats: 4,
  // index: measureIdx,
  measureId: measure.id
};

// console.log("MEASURE LAYOUT ENTRY", measureLayout[measureIdx]);


// Transparent staff hit area for note input
const staffHit = document.createElementNS("http://www.w3.org/2000/svg", "rect");

const topLineY = stave.getYForLine(0);
const spacing = stave.getSpacingBetweenLines();

// Enough vertical range for full guitar pitch range
const hitPadding = 12 * (spacing / 2); // 12 diatonic steps above/below

staffHit.classList.add("staff-hit");
staffHit.setAttribute("x", x);
staffHit.setAttribute("y", topLineY - hitPadding);
staffHit.setAttribute("width", staveWidth);
staffHit.setAttribute("height", hitPadding * 2 + 5 * spacing);
staffHit.setAttribute("fill", "transparent");
// console.log(x, topLineY, staveWidth, spacing)
// for debugging - make the hit boxes visible
// staffHit.setAttribute("fill", "rgba(179, 155, 161, 0.13)");
// staffHit.setAttribute("stroke", "rgba(233, 7, 7, 0.34)");


/*
no pointer events ensures:
    In normal mode → clicking a note selects it
    Hit areas do NOT block note clicks
    need to change to "all" when in note-input mode
    */
  if(!noteInputMode){
staffHit.setAttribute("pointer-events", "none");
  }
// NOTE INPUT EVENT HANDLER

staffHit.addEventListener("mousedown", (e) => {
  // console.log("ENTERING INPUT EVENT")
  if (!noteInputModeRef.current) return;

  const svgP = clientToSvgPoint(e, svg);

  const staveInfo = measureLayout[measureIdx];

  const { x, y } = cursorPosRef.current;

  const pitch = pitchFromY(y, staveInfo);
  const beatIndex = getNoteIndexForX(x, staveInfo);

// console.log("before onNoteInput ", "\n.  svgP.y,: ", svgP.y, "\n.  pitch: ", pitch)
  onNoteInput(pitch, measureIdx, beatIndex);

});

svg.appendChild(staffHit);





  // -----------------------------
  // 1. BUILD NOTES
  // -----------------------------
  const vfNotes = buildVexflowNotes(measure.melody || []);

  vfCacheRef.current.set(measure.id, {
  vfNotes: vfNotes,          // array of StaveNotes
    measure: measure,          // optional
});



  // -----------------------------
  // 2. ATTACH NOTES TO STAVE
  //    (required BEFORE formatting)
  // -----------------------------
  vfNotes.forEach(n => n.setStave(stave));

  // -----------------------------
  // 3. STRICT VOICE
  // -----------------------------
  const voice = buildStrictVoice(vfNotes);

//   if (voice.ticksUsed !== voice.totalTicks) {
//   console.warn(
//     `Measure ${measureIdx} tick mismatch:`,
//     "total:", voice.totalTicks,
//     "used:", voice.ticksUsed
//   );
// }


  // -----------------------------
  // 4. FORMAT (now safe)
  // -----------------------------


  // formatStrictVoice(voice, staveWidth);
const noteStartX = stave.getNoteStartX();
const noteEndX = x + staveWidth; // x is your stave's left position

const availableWidth = noteEndX - noteStartX;

const formatter = new VF.Formatter();
formatter.joinVoices([voice]).format([voice], availableWidth);



  // ⭐ 5. NOW compute semitone step
const lineSpacing = stave.getSpacingBetweenLines();
semitoneStepRef.current = (lineSpacing / 2) * (7 / 12);


//   console.log("VOICE DEBUG ----------------");
// console.log("time:", voice.time);
// console.log("totalTicks:", voice.totalTicks);
// console.log("ticksUsed:", voice.ticksUsed);

voice.tickables.forEach((t, idx) => {
  // console.log(
  //   `note ${idx}:`,
  //   "dur:", measure.melody[idx]?.duration,
  //   "dots:", measure.melody[idx]?.dots,
  //   "intrinsicTicks:", t.getIntrinsicTicks()
  // );
});
// console.log("--------------");



  // -----------------------------
  // 5. DRAW NOTES + HITBOXES
  // -----------------------------
  vfNotes.forEach((vfNote, idx) => {
    const id = measure.melody[idx]?.id;

    noteLookup.set(`${measureIdx}:${idx}`, { vfNote, id });

    const g = ctx.openGroup();
    vfNote.setContext(ctx).draw();
    ctx.closeGroup();

    // Ensure clicking a note does NOT insert
    g.addEventListener("mousedown", (e) => {
      e.stopPropagation();

      if (noteInputModeRef.current) {
        // MuseScore behavior: clicking a note moves caret, does NOT insert
        const svgP = clientToSvgPoint(e, svg);
        // moveCaretToNote(n, svgP);
        return;
      }
      onNoteSelect(n.id);
    });  


    // CARET
 

  




    // ORIGINAL Y
    const ys = vfNote.getYs();
    if (ys && ys.length > 0 && id) {
      originalYRef.current[id] = ys[0];
    }

    // NOTE HITBOXES
    const hitGroup = ctx.openGroup();
    const bbox = vfNote.getBoundingBox();
    if (bbox) {
      const padding = 6;
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", bbox.getX() - padding);
      rect.setAttribute("y", bbox.getY() - padding);
      rect.setAttribute("width", bbox.getW() + padding * 2);
      rect.setAttribute("height", bbox.getH() + padding * 2);
      rect.setAttribute("fill", "transparent");

         // debugging
      // rect.setAttribute("fill", "rgba(186, 39, 164, 0.2)");
      // rect.setAttribute("stroke", "rgba(166, 18, 192, 0.32)");


   


      rect.setAttribute("pointer-events", "all");
      hitGroup.appendChild(rect);
    }
    ctx.closeGroup();

    // SELECTION
    if (selection?.type === "note" && selection.id === id) {
      g.classList.add("selected-note");
    }

    hitGroup.style.cursor = "pointer";

    // DRAG + CLICK HANDLER
    hitGroup.addEventListener("mousedown", e => {
      e.preventDefault();

      if (noteInputMode) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setCaret({ measure: measureIdx, index: idx });
        return;
      }

      g.style.pointerEvents = "none";
      hitGroup.style.pointerEvents = "all";

      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;

      const onMove = ev => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!moved && Math.hypot(dx, dy) > 3) {
          moved = true;
          // onNoteSelect?.(id);
          onNoteDragStart(id, startX, startY, g);
        }
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        if (!moved) {
          onNoteSelect?.(id);
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });

    if (id) {
      noteElements.current.set(id, g);
    }

    g.style.pointerEvents = "none";
    hitGroup.style.pointerEvents = "all";
  });

  // CHORD SYMBOLS
  if (measure.chords?.length) {
    const left = stave.getNoteStartX();
    const right = stave.getX() + stave.getWidth() - 20;
    const beatSpacing = (right - left) / 4;

    measure.chords.forEach((symbol, b) => {
      const xPos = left + beatSpacing * b;
      ctx.save();
      ctx.setFont("Arial", 14, "");
      ctx.fillText(symbol, xPos, y - 10);
      ctx.restore();
    });
  }


svg.appendChild(staffHit);

});  // END RENDERING - FINISH DRAWING LOOP




// console.log("measureLayout: ÷", measureLayout)



  function createAnchorNote(stave, x) {
  

  const note = new VF.StaveNote({
    keys: ["b/4"],
    duration: "1"
  });

  note.setStave(stave);
  note.setStyle({ fillStyle: "transparent", strokeStyle: "transparent" });

  const tc = new VF.TickContext();
  tc.addTickable(note);
  tc.setX(x).preFormat();

  return note;
} // createAnchorNote








// const container = lsContainerRef.current;

// container.addEventListener("mouseenter", () => setCursorVisible(true));
// container.addEventListener("mouseleave", () => setCursorVisible(false));









    // After VexFlow is done: get FINAL SVG and draw playhead + caret

    if (svg) {
      svg.style.width = `${svgWidth}px`;
      svg.style.height = `${svgHeight}px`;
      svg.style.display = "block";


  
      // Now draw playhead    
      const playhead = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      playhead.setAttribute("stroke", "red");
      playhead.setAttribute("stroke-width", "2");

      // debugging = set layer fill and stroke to greenish
      // playhead.setAttribute("fill", "rgba(94, 255, 0, 0.3)");
      // playhead.setAttribute("stroke", "rgba(3, 43, 33, 0.91)");


      svg.appendChild(playhead);
      playheadRef.current = playhead;

        
  

// Inside LeadSheetRenderer, where you already have lsContainerRef and tieHitLayerRef

 drawTies({
  ctx,
    noteLookup: lastNoteLookupRef.current,  
        measureLayout,   // ← ADD THIS,
  leadSheet,
  selection,
  setSelection,
  lsContainerRef,
  tieHitLayerRef,
  tieCurveLayerRef
});


drawSlurs({
  ctx,
  noteLookup,
  measureLayout,
  leadSheet,
  selection,
   setSelection,
  lsContainerRef,
  slurHitLayerRef,
  slurCurveLayerRef
});


lastCtxRef.current = ctx;
lastNoteLookupRef.current = noteLookup;
lastMeasureLayoutRef.current = measureLayout;



}

return () => {
  effectGuard.current = false;

 
  if (lsContainerRef.current) {
    lsContainerRef.current.innerHTML = "";
  }
  noteElements.current.clear();
  measureElements.current.clear();
  originalYRef.current = {};
};
  }, [measures, selection, dragRef, leadSheet.ties, leadSheet.slurs]); // useLayoutEffect




  // Preview transform effect stays as‑is
  useEffect(() => {
    if (!dragRef.current) {
      noteElements.current.forEach(g => g.removeAttribute("transform"));
      return;
    }

    if (!dragPreview) {
      isDragging.current = false;
      return;
    }

    const { noteId, semitones, durationSteps } = dragPreview;
    const g = noteElements.current.get(noteId);
    if (!g) return;

    const dy = semitones * -5;
    const dx = durationSteps * 30;

    g.setAttribute("transform", `translate(${dx}, ${dy})`);
  }, [dragPreview, dragRef]);



 

const onMouseMove = (x, y, staveInfo) => {
   if (!staveInfo) return;
// console.log("ON MOUSE MOVE ", {x, y, staveInfo})
  //  console.log("ON MOUSE MOVE")
  // Convert raw Y → pitch → snapped Y
  const midi = pitchFromY(y, staveInfo);
  // const snappedY = cursorYFromPitch(midi, staveInfo);
   const snappedY = snapToStaveLine(y, staveInfo)
let snappedX = x


// console.log( {staveInfo, vfCacheRef} )
const { vfNotes } = vfCacheRef.current.get(staveInfo.measureId);

const rect = getNoteRectFromX(x, vfNotes);
if (rect) {
  // console.log("Note:", rect.note);
  // console.log("Rect:", rect.x1, rect.y1, rect.width, rect.height);
  snappedX=rect.x1 + rect.width
}
  setCursorPos({ x: snappedX, y: snappedY });


  // setCursorPos({ x, y: snappedY,  midi });

 setCursorStaveInfo(staveInfo);
};




// MOUSE MOVE HANDLER FOR INSERT NOTES 

  useEffect(() => {

  const container = lsContainerRef.current;
  if (!container) return;

  const svgList = container.querySelectorAll("svg");
  const svg = svgList[svgList.length - 1];
  if (!svg) return;
    // console.log("MOUSE MOVE USEEFFECT")

  function handleMouseMove(e) {
    if (!noteInputModeRef.current) return;

    try {
      // Convert to SVG coords
      const svgP = clientToSvgPoint(e, svg);

      const staveInfo = findStaveAtXY(
        svgP.x,
        svgP.y,
        lastMeasureLayoutRef.current
      );
      // console.log("MOUSE MOVE", {staveInfo})
      if (!staveInfo || !onMouseMove) return;

      // ⭐⭐⭐ DEBUG PRINT — THIS IS WHAT WE NEED ⭐⭐⭐
      const half = staveInfo.spacing / 2;
      const steps = (svgP.y - staveInfo.topLineY) / half;

      // console.log("DEBUG LEDGER TEST", {
      //   rawClientY: e.clientY,
      //   svgY: svgP.y,
      //   staveTopY: staveInfo.topLineY,
      //   spacing: staveInfo.spacing,
      //   halfSpacing: half,
      //   computedSteps: steps,
      //   roundedSteps: Math.round(steps)
      // });
      // // ⭐⭐⭐ END DEBUG ⭐⭐⭐

      onMouseMove(svgP.x, svgP.y, staveInfo);
    } catch (err) {
      console.error("mousemove error:", err);
    }
  }

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [onMouseMove]);









  
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <div
        className="ls-container"
        ref={lsContainerRef}
        style={{ width: "900px", minHeight: "600px" }}
      
      />
    </div>
  );
}