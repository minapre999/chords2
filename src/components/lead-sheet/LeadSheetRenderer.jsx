import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef,   useLayoutEffect, } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";
import RenderData, {RenderNote} from "/src/render-notes.js"
import Note from "/src/harmony/note.js"
import "./LeadSheetRenderer.css"
import { isNumber } from "tone";



function debug(label, value) {
  console.log(`DEBUG ${label}:`, value);
  if (value === "4/q" || value === "4q" || value === "r") {
    console.trace("STACK TRACE FOR BAD VALUE");
  }
}








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
    onMouseMove,
    lsContainerRef,
    onNoteInput,
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
  const lastMeasureLayoutRef = useRef(null);

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

  //
  // Draw caret
  //
  const drawCaret = (svg, x, yTop, yBottom) => {
    const caretLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    caretLine.setAttribute("x1", x);
    caretLine.setAttribute("x2", x);
    caretLine.setAttribute("y1", yTop);
    caretLine.setAttribute("y2", yBottom);
    caretLine.setAttribute("stroke", "#4a7aff");
    caretLine.setAttribute("stroke-width", "2");
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
    const topY = Math.max(y1, y2);

    hit.setAttribute("y", topY + hitYOffset);
    hit.setAttribute("height", hitHeight);
    hit.setAttribute("fill", "transparent");

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
const topY = Math.max(y1, y2);

hit.setAttribute("y", topY + hitYOffset);
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
} // drawSlurs


function findStaveAtY(y, layout) {
  if (!layout) return null;

  for (const m of layout) {
    const top = m.hitTop;
    const bottom = m.hitTop + m.hitHeight;

    if (y >= top && y <= bottom) {
      return m;
    }
  }

  return null;
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



const durationMap = {
  w: "1",
  h: "2",
  q: "4",
  "8": "8",
  "16": "16",
  "e": "8",
  "s": "16"
};

function buildVexflowNotes(melody) {
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






// function buildStrictVoice(vfNotes) {
//   const voice = new VF.Voice({
//     num_beats: 4,
//     beat_value: 4,
//     resolution: VF.RESOLUTION
//   });

//   voice.setStrict(true);
//   voice.addTickables(vfNotes);

//   return voice;
// }


function formatStrictVoice(voice, staveWidth) {
  const formatter = new VF.Formatter();

  // ⭐ REQUIRED IN VEXFLOW 4:
  // joinVoices builds ModifierContexts + TickContexts
  formatter.joinVoices([voice]);

  // ⭐ REQUIRED IN VEXFLOW 4:
  // format applies dot multipliers and updates intrinsicTicks
  formatter.format([voice], staveWidth);
}



function buildStrictVoice(vfNotes) {
  const voice = new VF.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: VF.RESOLUTION
  });

  voice.setStrict(true);
  voice.addTickables(vfNotes);

  // 🔍 DEBUG: inspect voice BEFORE formatting
  // console.log("VOICE PRE-FORMAT ----------------");
  // console.log("time:", voice.time);
  // console.log("totalTicks:", voice.totalTicks);
  // console.log("ticksUsed:", voice.ticksUsed);

  voice.tickables.forEach((t, idx) => {
    // console.log(
    //   `note ${idx}:`,
    //   "dur:", t.getDuration(),
    //   "intrinsicTicks:", t.getIntrinsicTicks()
    // );
  });
  // console.log("--------------");

  return voice;
}




function pitchFromY(y, staveInfo) {
  const { topY, spacing } = staveInfo;

  // diatonic steps: each line/space = 1 step
  // y increases downward, so going UP the staff is negative delta
  const diatonicSteps = Math.round((topY - y) / (spacing / 2));

  // Reference: F4 at topY (MIDI 60)
  const baseMidi = 77;      // C4
  const baseDegree = 0;     // 0 = C, 1 = D, 2 = E, 3 = F, 4 = G, 5 = A, 6 = B

  // Major scale semitone pattern relative to C
  const semis = [0, 2, 4, 5, 7, 9, 11];

  // Total diatonic degree offset from base
  const totalDegree = baseDegree + diatonicSteps;

  // How many full octaves up/down in diatonic space
  const octaveOffset = Math.floor(totalDegree / 7);

  // Degree within the octave (0–6), wrapped correctly for negatives
  const degree = ((totalDegree % 7) + 7) % 7;

  // Semitone offset from base C within the octave
  const semitoneOffset = semis[degree] - semis[baseDegree];

  // Final MIDI: base + octaves + within‑octave offset
  return baseMidi + octaveOffset * 12 + semitoneOffset;
}





function computeBeatFromX(x, staveInfo) {
  
  const { measureX, measureWidth, beats } = staveInfo;

  const rel = x - measureX;
  const clamped = Math.max(0, Math.min(rel, measureWidth));

  // console.log("computeBeatFromX: ", {x, measureX, measureWidth, beats, staveInfo, clamped} )

  return Math.floor((clamped / measureWidth) * beats);
}



function clientToSvgPoint(event, svg) {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;

  // Transform into SVG space
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return svgP;
}




// function formatStrictVoice(voice, staveWidth) {
//   // 🚫 TEMP: do nothing so we can see the pre-format state
//   return;
// }


    // -----------------------------
    // Render measures + notes
    // -----------------------------
   
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
ctx.closeGroup();
measureElements.current.set(measure.id, measureGroup);

// ⭐ AFTER DRAW: use REAL bounding box
const bbox = stave.getBoundingBox();


measureLayout[measureIdx] = {
  measureX: x,
  measureY: y,                      // original grid y (keep if you need it)
  measureWidth: staveWidth,
  row,
  systemIndex: row,
  stave,
  topY: stave.getYForLine(0),
  spacing: stave.getSpacingBetweenLines(),
  hitTop: bbox.getY(),           // ← for hit‑testing
  hitHeight: bbox.getH(),        // ← for hit‑testing
beats: 4,  // hard code for now, later when support other time sigatures set is to leadSheet.timeSigNumerator
};


// Transparent staff hit area for note input
const staffHit = document.createElementNS("http://www.w3.org/2000/svg", "rect");

const topY = stave.getYForLine(0);
const spacing = stave.getSpacingBetweenLines();

// Enough vertical range for full guitar pitch range
const hitPadding = 12 * (spacing / 2); // 12 diatonic steps above/below

staffHit.setAttribute("x", x);
staffHit.setAttribute("y", topY - hitPadding);
staffHit.setAttribute("width", staveWidth);
staffHit.setAttribute("height", hitPadding * 2 + 5 * spacing);
staffHit.setAttribute("fill", "transparent");
staffHit.setAttribute("pointer-events", "all");


staffHit.addEventListener("mousedown", (e) => {
  if (!noteInputModeRef.current) return;

  const svgP = clientToSvgPoint(e, svg);

  const staveInfo = measureLayout[measureIdx];
  const pitch = pitchFromY(svgP.y, staveInfo);
  const beatIndex = computeBeatFromX(svgP.x, staveInfo);
console.log("before onNoteInput ", "\n.  svgP.y,: ", svgP.y, "\n.  pitch: ", pitch)
  onNoteInput(pitch, measureIdx, beatIndex);
});

svg.appendChild(staffHit);








  // FIRST MEASURE: CLEF, TIME, KEY
  if (measureIdx === 0) {
    stave.addClef("treble");
    stave.addTimeSignature("4/4");
    stave.addKeySignature(leadSheet.key || "G");
  }






  // -----------------------------
  // 1. BUILD NOTES
  // -----------------------------
  const vfNotes = buildVexflowNotes(measure.melody || []);

  // -----------------------------
  // 2. ATTACH NOTES TO STAVE
  //    (required BEFORE formatting)
  // -----------------------------
  vfNotes.forEach(n => n.setStave(stave));

  // -----------------------------
  // 3. STRICT VOICE
  // -----------------------------
  const voice = buildStrictVoice(vfNotes);

  // -----------------------------
  // 4. FORMAT (now safe)
  // -----------------------------
  formatStrictVoice(voice, staveWidth);



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
    moveCaretToNote(n, svgP);
    return;
  }

  onNoteSelect(n.id);
});  // FINISH DRAWING LOOP








    // CARET
    if (caret &&
        caret.measure === measureIdx &&
        caret.index === idx) {
      const noteX = vfNote.getAbsoluteX();
      caretDrawInfo = {
        x: noteX,
        top: y - 5,
        bottom: y + staveHeight - 5
      };
    }

    // ORIGINAL Y
    const ys = vfNote.getYs();
    if (ys && ys.length > 0 && id) {
      originalYRef.current[id] = ys[0];
    }

    // HITBOX
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

});  // END RENDERING


// // -----------------------------
// // PHASE 2 — COMPUTE HIT ZONES
// // -----------------------------
// for (let i = 0; i < measureLayout.length; i++) {
//   const info = measureLayout[i];

//   const thisTop = info.topY;
//   const thisBottom = info.topY + 4 * info.spacing;

//   const prev = measureLayout[i - 1];
//   const next = measureLayout[i + 1];

//   let hitTop, hitBottom;

//   if (prev && prev.row === info.row - 1) {
//     hitTop = (prev.topY + thisTop) / 2;
//   } else {
//     hitTop = thisTop - 6 * info.spacing;
//   }

//   if (next && next.row === info.row + 1) {
//     hitBottom = (thisBottom + next.topY) / 2;
//   } else {
//     hitBottom = thisBottom + 6 * info.spacing;
//   }

//   info.hitTop = hitTop;
//   info.hitHeight = hitBottom - hitTop;
// }

    


// // -----------------------------
// // PHASE 3 — CREATE HIT AREAS
// // -----------------------------
// for (let measureIdx = 0; measureIdx < measureLayout.length; measureIdx++) {
//   const info = measureLayout[measureIdx];

//   const staffHit = document.createElementNS("http://www.w3.org/2000/svg", "rect");
//   staffHit.setAttribute("x", info.measureX);
//   staffHit.setAttribute("y", info.hitTop);
//   staffHit.setAttribute("width", info.measureWidth);
//   staffHit.setAttribute("height", info.hitHeight);
//   staffHit.setAttribute("fill", "transparent");
//   staffHit.setAttribute("pointer-events", "all");

//   staffHit.addEventListener("mousedown", (e) => {
//     if (!noteInputModeRef.current) return;

//     const svgP = clientToSvgPoint(e, svg);
//     const pitch = pitchFromY(svgP.y, info);
//     const beatIndex = computeBeatFromX(svgP.x, info);

//     onNoteInput(pitch, measureIdx, beatIndex);
//   });

//   svg.appendChild(staffHit);
// }



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
      svg.appendChild(playhead);
      playheadRef.current = playhead;

      if (caretDrawInfo) {
        drawCaret(svg, caretDrawInfo.x, caretDrawInfo.top, caretDrawInfo.bottom);
      }

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
  }, [measures, selection, caret, dragRef, leadSheet.ties]); // useLayoutEffect




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



  

  useEffect(() => {
  const container = lsContainerRef.current;
  if (!container) return;

  const svgList = container.querySelectorAll("svg");
  const svg = svgList[svgList.length - 1];
  if (!svg) return;

  function handleMouseMove(e) {
  if (!noteInputModeRef.current) return;

  try {

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    // CTM already accounts for scroll + container offset
    const svgP = pt.matrixTransform(ctm.inverse());

    const staveInfo = findStaveAtY(
      svgP.y,
      lastMeasureLayoutRef.current
    );

    // console.log("staveInfo: ", "\n. measureY: ", staveInfo.measureY, "\n. topY: ",  staveInfo.topY, "\n. measureWidth: ", staveInfo.measureWidth, 
    //   "\n. row: ", staveInfo.row, "\n. measureX: ", staveInfo.measureX)
    //   console.log("\n.   ", staveInfo )
    if (!staveInfo || !onMouseMove) return;


//     console.log("client", e.clientX, e.clientY);
// console.log("svgP", svgP.x, svgP.y);

// const rect = svg.getBoundingClientRect();
// console.log("rect", rect.left, rect.top);




    onMouseMove(svgP.x, svgP.y, staveInfo);
  } catch (err) {
    console.error("mousemove error:", err);
  }
}


  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };
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