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



export const durationMap = {
  "s": "16",
  "e": "8",
  "q": "4",
  "h": "2",
  "w": "1"
};



function getAccidentalFromToken(token) {
  const match = token.match(/^([A-Ga-g])([#b]{1,2}|)(\d)/);
  if (!match) return null;

  const [, , accidental] = match;
  if (accidental === "") return null;

  return accidental; // "#", "b", "##", "bb"
}



export function parseToken(token) {
  // console.log("PARSE TOKEN", "\n token: ", token)
  // Handles: C4q, C#4q, Eb4h, F##4q, etc.
  const match = token.match(/^([A-Ga-g])([#b]{0,2})(\d)(.+)$/);
  if (!match) {
    console.warn("parseToken: unexpected token:", token);
    return null;
  }

  const [, letter, accidental, octave, duration] = match;

  return {
    letter: letter.toUpperCase(),
    accidental: accidental || null,
    octave,
    duration
  };
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






function pitchToVexFlowKey(pitch) {
  // pitch formats supported:
  // C4, F#3, Bb5

  const letter = pitch[0].toLowerCase();

  let accidental = "";
  let octave = "";

  if (pitch[1] === "#" || pitch[1] === "b") {
    accidental = pitch[1];
    octave = pitch[2];
  } else {
    octave = pitch[1];
  }

  return `${letter}${accidental}/${octave}`;
}


// function pitchToVexFlowKey(pitch) {
//   // pitch is like "C4", "Eb4", "F#3"
//   const match = pitch.match(/^([A-Ga-g])(b|#)?(\d)$/);
//   if (!match) throw new Error("Invalid pitch: " + pitch);

//   let [, letter, accidental, octave] = match;

//   letter = letter.toLowerCase(); // VexFlow requires lowercase note names

//   if (!accidental) accidental = "";

//   return `${letter}${accidental}/${octave}`;
// }
function tokenToVFNote(token, currentKey, accidentalMemory) {
  // console.log("TOKEN TO VFNOTE", "   \ntoken: ", token, "   \ncurrentKey: ", currentKey)
    const VF = window.Vex.Flow;


      // REST
  if (token.endsWith("r")) {
    // const pitch = token.slice(0, -1); // e.g. "C4"
    // const dur = token.slice(-1);      // "r"
    const durationChar = token.charAt(0); // last char before r is duration
    return new VF.StaveNote({
      keys: ["b/4"],
      duration: durationMap[token.charAt(0)] + "r"
    });
  }


  const parsed = parseToken(token);
  if (!parsed) return null;

  const { letter, accidental, octave, duration } = parsed;
const vfDuration = durationMap[duration]
// console.log("  vfDuration: ", vfDuration)
  const key = `${letter.toLowerCase()}${accidental || ""}/${octave}`;
  const keyAcc = getKeySigAccidental(currentKey, letter);



    // NORMAL NOTE
  // Format: C4q → pitch="C4", dur="q"

  const validDurations = new Set(["1","2","4","8","16","32"]);

if (!validDurations.has(vfDuration)) {
  console.log("Invalid duration:", vfDuration, "from token:", token);
   return null;
}


  const vfNote = new VF.StaveNote({
    keys: [key],
    duration: vfDuration
  });

  // --- ACCIDENTAL LOGIC ---
  let writtenAcc = accidental; // "#", "b", "##", "bb", or null
  if (!writtenAcc && keyAcc) {
    writtenAcc = "n"; // natural sign required
  }
  const prevAcc = accidentalMemory[letter];

  if (shouldShowAccidental({ writtenAcc, keySigAcc: keyAcc, previousAcc: prevAcc })) {
    if (writtenAcc) {
      vfNote.addAccidental(0, new VF.Accidental(writtenAcc));
    } else if (keyAcc) {
      vfNote.addAccidental(0, new VF.Accidental("n"));
    }
  }

  accidentalMemory[letter] = writtenAcc;

  return vfNote;
}







const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function semitoneToPitch(baseMidi, offset) {
  const midi = baseMidi + offset;
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${PITCH_CLASSES[pc]}${octave}`; // e.g. "C4"
}






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
    ...rest
  } = props;

  const lsContainerRef = useRef(null);
  const noteElements = useRef(new Map());
  const measureElements = useRef(new Map());
  const playheadRef = useRef(null);
  const isDragging = useRef(false);
  const originalYRef = useRef({});
  const semitoneStepRef = useRef(3);
const slurCurveLayerRef = useRef(null);
const slurHitLayerRef = useRef(null); // you already have this one
const tieCurveLayerRef = useRef(null);
const tieHitLayerRef = useRef(null); // you already have this

  const measures = leadSheet?.measures ?? [];
  const effectGuard = useRef(false);

const lastCtxRef = useRef(null);
const lastNoteLookupRef = useRef(null);
const lastMeasureLayoutRef = useRef(null);



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



  useImperativeHandle(rendererRef, () => ({

    highlightNote(noteId) {
      console.log("HIGHLIGHT NOTE", "   /nselection: ", selection)
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
  };

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

  // Curve path
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
  setSelection({ type: "tie", id: tie.id });
});

hitLayer.appendChild(hit);

}




function drawTies({
  noteLookup,
  measureLayout,
  leadSheet,
  selection,
  setSelection,
  lsContainerRef,
  tieCurveLayerRef,
  tieHitLayerRef,

}) {

  if (!noteLookup) return;
  const svgList = lsContainerRef.current?.querySelectorAll("svg");
  const svg = svgList?.[svgList.length - 1];
  if (!svg) return;

  //
  // --- CURVE LAYER ---
  //
  let curveLayer = tieCurveLayerRef.current;
  if (!curveLayer || !curveLayer.isConnected) {
    curveLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    curveLayer.setAttribute("id", "tie-curve-layer");
    svg.appendChild(curveLayer);
    tieCurveLayerRef.current = curveLayer;
  }

  while (curveLayer.firstChild) {
    curveLayer.removeChild(curveLayer.firstChild);
  }

  //
  // --- HIT LAYER ---
  //
  let hitLayer = tieHitLayerRef.current;
  if (!hitLayer || !hitLayer.isConnected) {
    hitLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hitLayer.setAttribute("id", "tie-hit-layer");
    // hitLayer.style.pointerEvents = "all";
    hitLayer.style.pointerEvents = "none";
    svg.appendChild(hitLayer);
    tieHitLayerRef.current = hitLayer;
  }

  while (hitLayer.firstChild) {
    hitLayer.removeChild(hitLayer.firstChild);
  }

  //
  // --- DRAW EACH TIE ---
  //
  leadSheet.ties.forEach(tie => {
  const start = noteLookup.get(`${tie.startMeasure}:${tie.startIndex}`);
  const end   = noteLookup.get(`${tie.endMeasure}:${tie.endIndex}`);
  if (!start || !end) return;

  const startLayout = measureLayout[tie.startMeasure];
  const endLayout   = measureLayout[tie.endMeasure];

  const startSystem = startLayout.systemIndex;
  const endSystem   = endLayout.systemIndex;

  console.log(
  "tie", tie.id,
  "startSystem:", startLayout.systemIndex,
  "endSystem:", endLayout.systemIndex
);


  const isSelected = selection?.type === "tie" && selection.id === tie.id;

  //
  // CASE 1: Tie is within the same system → draw normally
  //
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

  //
  // CASE 2: Tie crosses systems → split into two segments
  //

  // Segment A: start note → right edge of system N
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

  // Segment B: left edge of system N+1 → end note
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

}




function drawSlurs({
  ctx,
  noteLookup,
  measureLayout,
  leadSheet,
  selection,
  setSelection,
  lsContainerRef,
  slurHitLayerRef,
  slurCurveLayerRef
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

  });
}






  // ⭐ StrictMode‑safe VexFlow render
  useLayoutEffect(() => {
    if (!lsContainerRef.current) return;
    if (dragRef.current) return; // freeze during drag

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


    const noteLookup = new Map();
    const measureLayout = []

    // -----------------------------
    // Render measures + notes
    // -----------------------------
    measures.forEach((measure, i) => {
      const row = Math.floor(i / colsPerRow);
      const col = i % colsPerRow;

      const x = 20 + col * staveWidth;
      const y = 40 + row * staveHeight;
       const stave = new VF.Stave(x, y, staveWidth);

      measureLayout[i] = {
                    x,
                    y,
                    width: staveWidth,
                    row, 
                    stave
                  };


      let currentSystem = 0;
        let lastY = null;

        for (let m = 0; m < measureLayout.length; m++) {
          const layout = measureLayout[m];
          const stave = layout.stave;

          const y = stave.getBoundingBox().getY();

          if (lastY !== null && Math.abs(y - lastY) > 20) {
            currentSystem++;
          }

          layout.systemIndex = currentSystem;
          lastY = y;
        }




      if (i === 0) {
        stave.addClef("treble");
        stave.addTimeSignature("4/4");
        stave.addKeySignature(leadSheet.key || "G");
      }

      const measureGroup = ctx.openGroup();
      stave.setContext(ctx).draw();
      ctx.closeGroup();
      measureElements.current.set(measure.id, measureGroup);

      const lineSpacing = stave.getSpacingBetweenLines();
      const semitoneStep = (lineSpacing / 2) * (7 / 12);
      semitoneStepRef.current = semitoneStep;

      const accidentalMemory = {};

   const notes = (measure.melody || []).map(n => {
  const token = typeof n === "string" ? n : n.token;
  const id = typeof n === "string" ? null : n.id;
  const vfNote = tokenToVFNote(token, leadSheet.key, accidentalMemory);
  return { vfNote, id };
}).filter(n => n.vfNote);  // ✅ drop nulls

const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
voice.addTickables(notes.map(n => n.vfNote));


      const formatter = new VF.Formatter();
      formatter.joinVoices([voice]);
      formatter.formatToStave([voice], stave);

      // NOTE DRAWING LOOP
      notes.forEach((n, idx) => {


        const { vfNote, id } = n;
        vfNote.setStave(stave);
      noteLookup.set(`${i}:${idx}`, { vfNote, id });


        const g = ctx.openGroup();
        vfNote.setContext(ctx).draw();
        ctx.closeGroup();

        if (caret &&
            caret.measure === i &&
            caret.index === idx) {
          const noteX = vfNote.getAbsoluteX();
          caretDrawInfo = {
            x: noteX,
            top: y - 5,
            bottom: y + staveHeight - 5
          };
        }

        const ys = vfNote.getYs();
        if (ys && ys.length > 0 && id) {
          originalYRef.current[id] = ys[0];
        }

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
        // console.log("RENDER NOTE LOOP", "   \selection: ", selection)
        if (selection?.type==="note" && selection?.id === id) {
          console.log("marking as selected", id )
          g.classList.add("selected-note");
        }

        hitGroup.style.cursor = "pointer";

        // notes mousedown handler
        hitGroup.addEventListener("mousedown", e => {
          
          e.preventDefault();

          if (noteInputMode) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            setCaret({ measure: i, index: idx });
            return;
          }


          g.style.pointerEvents = "none";       // note graphics never block clicks
          hitGroup.style.pointerEvents = "all"; // only hitbox receives events



          const startX = e.clientX;
          const startY = e.clientY;
          let moved = false;

          const onMove = ev => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            if (!moved && Math.hypot(dx, dy) > 3) {
              moved = true;
              onNoteSelect?.(id);
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
        }); // end mousedown handler

        if (id) {
          noteElements.current.set(id, g);
        }

      g.style.pointerEvents = "none"; // the VexFlow note graphics
    hitGroup.style.pointerEvents = "all"; // your note hitbox

      });  // note drawing loop

      // Chords
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
    }); // end measures.forEach drawing





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
}





const svgList = lsContainerRef.current.querySelectorAll("svg");
const svg = svgList[svgList.length - 1];

if (!svg || svg.parentNode !== lsContainerRef.current) {
  console.error("Lead-sheet SVG not found");
  return;
}



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
  }, [measures, selection, noteInputMode, caret, dragRef, leadSheet.ties]); // useLayoutEffect



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


