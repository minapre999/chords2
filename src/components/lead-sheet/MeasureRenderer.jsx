import React, { useState, useCallback, useEffect, useRef, useLayoutEffect, useImperativeHandle } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";
import { buildVexFlowNotes } from "./buildVexFlowNotes"
import "./LeadSheetRenderer.css"
import {measureRectsRef} from "./LeadSheetRenderer"
import {cursorPosRef, cursorOverlayRef} from "/src/components/lead-sheet/cursor/cursorRefs";
import { updateCursorOverlay } from "/src/components/lead-sheet/cursor/updateCursorOverlay";




export default function MeasureRenderer(props) {
const {     caret, setCaret, 
            caretRef,
            dragRef,
            inputDurationRef,
            measureOfRowIndex, 
            leadSheet,
            lsContainerRef,
            measure, 
            measureElements,
            noteElements,
            noteInputModeRef,
            onNoteDragStart,
            noteInputMode,
            onNoteInput,
            onNoteSelect,
            onTieSelect,
            playerRef,
            selection, setSelection,
            rowIndex,
            rendererRef,
            slurLayerRef,
            tieLayerRef,
            tieElements,
            width,
             vfCacheRef, } = props


if(!leadSheet || !measure) return;

  const svgRef = useRef(null);
  const staveRef = useRef(null);

  // set in the props and here?
    // const staveWidth = width
    const staveHeight = 160
    const staveTopPadding = 60
    const measureIndex = leadSheet.measures.findIndex(m=>m.id===measure.id)


  const staveWidth = width ;
//   console.log("staveWidth used", staveWidth);

    const originalYRef = useRef({});


  // for debugging
  useEffect(() => {
    window.noteElements = noteElements;
window.measureElements = measureElements;
window.measureRectsRef = measureRectsRef
window.tieLayerRef = tieLayerRef
window.slurLayerRef = slurLayerRef
  }, [leadSheet]);
 





// listener for mouse move events for note input etc.
// these will all be in measure coordinates
// only concerned with the current measure



// const onMouseMove = (x, y) => {
   
// // console.log("ON MOUSE MOVE ", {x, y, staveInfo})
//   //  console.log("ON MOUSE MOVE")
//   // Convert raw Y → pitch → snapped Y
//   const midi = pitchFromY(y, staveInfo);
//   // const snappedY = cursorYFromPitch(midi, staveInfo);




//    const snappedY = snapToStaveLine(y, staveInfo)
// let snappedX = x

// //   console.log("ON MOVE", {
// //   rawY: y,
// //   snappedY,
// //   staveTopLineY: staveInfo.topLineY,
// //   spacing: staveInfo.spacing,
// // });

// // console.log( {staveInfo, vfCacheRef} )
// const { vfNotes } = vfCacheRef.current.get(staveInfo.measureId);

// const rect = getNoteRectFromX(x, vfNotes);
// if (rect) {
//   // console.log("Note:", rect.note);
//   // console.log("Rect:", rect.x1, rect.y1, rect.width, rect.height);
//   snappedX=rect.x1 + rect.width
// }

// cursorPosRef.current.x = snappedX
// cursorPosRef.current.y = snappedY

// // console.log({cursorPosRef})
//   if (!rafRef.current) {
//     rafRef.current = requestAnimationFrame(() => {
//       rafRef.current = null;
//       updateCursorOverlay({cursorPosRef, staveInfo, inputDurationRef, vfCacheRef});
//     });
//   }


// };




// useEffect(() => {

//   const container = lsContainerRef.current
//   if (!container || !measureRectsRef?.current || !cursorPosRef) return;
  
//   const measureRect = measureRectsRef.current[measure.id]
//   // console.log({measureRect, measureRectsRef})
//   if(!measureRect) return;

//   function onMove(e) {
    
    
//     const x = e.clientX;
//     const y = e.clientY;

//     console.log("ON MOVE", {x, y, measureRect})

//     // find measure under cursor
//     let found = null;
//     for (const [id, rect] of Object.entries(measureRect)) {
//       console.log({id, rect})
//       if (x >= rect.left && x <= rect.right &&
//           y >= rect.top && y <= rect.bottom) {
//         found = { id, rect };
//         break;
//       }
//     }

//     if (!found) {
//       cursorPosRef.current.visible = false
//       cursorPosRef.measure = measure
//     updateCursorOverlay({measure, measureRectsRef, cursorPosRef,  inputDurationRef, vfCacheRef});
//       return;
//     }

//     cursorPosRef.current = {
//       visible: true,
//       x: x - found.rect.left,
//       y: found.rect.staveY,
//       measure: measure,

//     };
//     updateCursorOverlay({cursorPosRef, measureRectsRef, inputDurationRef, vfCacheRef});
//   }

//   container.addEventListener("mousemove", onMove);
//   container.addEventListener("mouseleave", () => {
//     cursorPosRef.current.visible = false;
//     updateCursorOverlay({cursorPosRef, measureRectsRef, inputDurationRef, vfCacheRef});
//   });

//   return () => {
//     container.removeEventListener("mousemove", onMove);
//   };
// }, []);





// measure rects for note input cursor, etc.

  useLayoutEffect(() => {
  //  console.log("rendering measure")
// console.log("useLayoutEffect for measures rect", {svgRef, staveRef})
  if (!svgRef.current || !staveRef?.current) return;

 
  const rect = svgRef.current.getBoundingClientRect();
  const stave = staveRef.current;
  window.staveRef = staveRef // debugging
  // console.log("adding to measureRectsRef")
  measureRectsRef.current[measure.id] = {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    staveY: stave.getYForLine(0),
    spacing: stave.getSpacingBetweenLines(),
    noteStartX: stave.getNoteStartX(),
    stave: stave,

  };
}, [staveWidth, measureOfRowIndex, rowIndex]);




      //
      // Imperative API
      //
      useImperativeHandle(playerRef, () => ({
        highlightNote(noteId) {
            console.log("HIGHLIGHT NOTE")
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
    








function moveCaretToNote(vfNote, measureIdx, noteIdx) {
  if (!vfNote) return;

  // console.log("setting caret to", {measureIdx, noteIdx})
  setCaret({
    measure: measureIdx,
    index: noteIdx,
   
  });
}




  function clientToSvgPoint(e, svgRoot) {
  const pt = svgRoot.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  return pt.matrixTransform(svgRoot.getScreenCTM().inverse());
}


// assume y passed in local coords
function pitchFromY(localY, staveInfo) {
  const { staveY, spacing } = staveInfo;
  // console.log("pitchFromY CALLED", { y, staveInfo });
  // ⭐ FIX: your Y is consistently one staff-step too high
  // so we shift it DOWN by halfSpacing to correct it
  const halfSpacing = spacing / 2;
  // const correctedY = y + halfSpacing;
  const correctedY = localY;

  // Each staff step (line/space) = spacing / 2
  const diatonicSteps = Math.round((correctedY - staveY) / halfSpacing);

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





 // assume hitX has already been converted to local coordinates

function getNoteIndexForX(localX) {
   if(!vfCacheRef?.current) return;

// fior now assume it is the melody which is the vfCacheref
// will need to update the vfCacheRef to include other parts
// console.log({hitX, vfCacheRef})

const { vfNotes } = vfCacheRef.current.get(measure.id);
  
let index =  0
let found = false
for(const note of vfNotes) {
  const bb = note.getBoundingBox();
  const x = bb.getX()
  const width = bb.getW()
  console.log({localX, index, x, width})
  if( localX >= x && localX <= x+width) {
    found = true
    break;
  }
  index++
}


if( !found) {
  console.log("couldnt find note correspondign to x click ", {localX, vfNotes})
  return;
}

console.log("found X index: ", index)


return index
  


}




// DRAW CARET IN USE EFFECT - vfCacheNotes should have been defined
  // the drawInfo matches the note hit boxes


  const drawCaret = (svg, drawInfo) => {  
if(noteInputModeRef.current) {
    const {x,yTop, yBottom, width} = drawInfo
    console.log("drawCaret", {svg, x, yTop, yBottom, width})
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", yTop );
    rect.setAttribute("width", width);
    rect.setAttribute("height", yBottom - yTop );
    rect.setAttribute("fill", "#4a7aff");
    rect.setAttribute("stroke", "#4a7aff");
    rect.setAttribute("opacity", "0.3");
    rect.setAttribute("pointer-events", "none");
    svg.appendChild(rect);
    }
  }; // drawCaret



function drawTies({
  stave,
  vfNotes,
  melody,
  measureIndex,
  measureLayout,
  leadSheet,
  selection,
  setSelection,
  svg,
  tieLayerRef
}) {
  if (!vfNotes || !melody || !svg || !stave) return;

  let oldLayer = svg.querySelector(".tie-layer");
  if (oldLayer) oldLayer.remove();

  const tieLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  tieLayer.classList.add("tie-layer");
  svg.appendChild(tieLayer);
  tieLayerRef.current = tieLayer;

  // Sub-layers inside tieLayer
  const curveLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  curveLayer.setAttribute("id", "tie-curve-layer");
  tieLayer.appendChild(curveLayer);

  const hitLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  hitLayer.setAttribute("id", "tie-hit-layer");
  hitLayer.style.pointerEvents = "none";
  tieLayer.appendChild(hitLayer);

  // ⭐ your code uses measure.id, so we keep it exactly as-is
  const layout = measureLayout[measure.id];
  const systemY = layout?.systemY ?? 0;

  leadSheet.ties.forEach(tie => {
    if (
      tie.startMeasure !== measureIndex &&
      tie.endMeasure !== measureIndex
    ) return;

    const isStart = tie.startMeasure === measureIndex;
    const isEnd   = tie.endMeasure === measureIndex;

    const idx = isStart ? tie.startIndex : tie.endIndex;
    const entry = melody[idx];
    const vf = vfNotes[idx];

    if (!entry || !vf) return;

    const isSelected =
      selection?.type === "tie" && selection.id === tie.id;

    // --- SAME SYSTEM ---
    if (tie.startMeasure === measureIndex && tie.endMeasure === measureIndex) {
      const startVF = vfNotes[tie.startIndex];
      const endVF   = vfNotes[tie.endIndex];

      drawTieSegment({
        x1: startVF.getAbsoluteX(),
        y1: startVF.getYs()[0] + systemY,   // ⭐ FIXED
        x2: endVF.getAbsoluteX(),
        y2: endVF.getYs()[0] + systemY,     // ⭐ FIXED
        isSelected,
        curveLayer,
        hitLayer,
        tie,
        setSelection
      });
      return;
    }

    // --- CROSS-SYSTEM: LEFT SEGMENT ---
    if (isStart) {
      const rightX = stave.getTieEndX();
      const y = vf.getYs()[0] + systemY;     
      
console.log("drawing start tie: ", {measure, x1: vf.getAbsoluteX(),y1: y,
        x2: rightX,
        y2: y,
        isSelected,
        curveLayer,
        hitLayer,
        tie,
        setSelection})

      drawTieSegment({
        x1: vf.getAbsoluteX(),
        y1: y,
        x2: rightX,
        y2: y,
        isSelected,
        curveLayer,
        hitLayer,
        tie,
        setSelection
      });
    }

    // --- CROSS-SYSTEM: RIGHT SEGMENT ---
 if (isEnd) {
  const leftX = Math.min(stave.getTieStartX(), vf.getAbsoluteX());
  const rightX = Math.max(stave.getTieStartX(), vf.getAbsoluteX());
  const y = vf.getYs()[0];

console.log("drawing end tie: ", {measure, x1: leftX,
    y1: y,
    x2: rightX,
    y2: y,
    isSelected,
    curveLayer,
    hitLayer,
    tie,
    setSelection})


  drawTieSegment({
    x1: leftX,
    y1: y,
    x2: rightX,
    y2: y,
    isSelected,
    curveLayer,
    hitLayer,
    tie,
    setSelection
  });
}


  });
}






function drawTieSegment({
  x1, y1, x2, y2,
  curvature,
  isSelected,
  curveLayer,
  hitLayer,
  tie,
  setSelection
}) {
  const c1x = x1 + curvature;
  const c2x = x2 - curvature;
  const c1y = y1 + curvature * 0.25;
  const c2y = y2 + curvature * 0.25;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
  );
  path.setAttribute("stroke", isSelected ? "dodgerblue" : "black");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", isSelected ? 2 : 1);

  curveLayer.appendChild(path);
}





// add this ABOVE the drawing useLayoutEffect so it updates teh noteInputModeRef first
// otherwise the noteInputModeRef used in the event handlers will be stale
// it needs to be in a useLayoutEffect as React
// -  applies DOM updates
// - THEN runs layout effects (useLayoutEffect)
// - THEN runs passive effects (useEffect)

useLayoutEffect(() => {
  noteInputModeRef.current = noteInputMode;
}, [noteInputMode]);



useLayoutEffect(() => {
 

      if(measure.id==="m1"){
    // console.log("LEAD SHEET RENDER MEASURE LAYOUT", {"noteInputModeRef.current" : noteInputModeRef.current})
  
        }


   const container = svgRef.current;
  if (!container) return;

  while (container.firstChild) container.removeChild(container.firstChild);

  const VF = window.Vex.Flow;
  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  const ctx = renderer.getContext();





  rendererRef.current = renderer

  const staveY = 25
  const staveX = 0
  const stave = new VF.Stave(staveX, staveY, staveWidth);

  if (measureIndex === 0 ) {
    stave.addClef("treble");
    stave.addTimeSignature("4/4");
    stave.addKeySignature("G");
  }

   stave.setEndBarType(VF.Barline.type.SINGLE);

  // ⭐ FORCE EXACT WIDTH
  stave.setWidth(staveWidth);

  stave.setContext(ctx).draw();
// ⭐ Save stave for other effects
  staveRef.current = stave;

  
  const notes = buildVexFlowNotes(measure);
  vfCacheRef.current.set(measure.id, { vfNotes: notes, measure: measure.melody });

 

  const voice = new VF.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: VF.RESOLUTION,
  });
  voice.setStrict(false);
  voice.addTickables(notes);

  const formatter = new VF.Formatter();
  formatter.joinVoices([voice]);
  formatter.preCalculateMinTotalWidth([voice]);

  const leftPadding = stave.getNoteStartX() - stave.getX();
  const drawableWidth = staveWidth - leftPadding;

  formatter.format([voice], drawableWidth);
  voice.draw(ctx, stave);


// 1. Get the REAL VexFlow SVG
const svg = container.querySelector("svg");
if (!svg) return;

// Transparent staff hit area for note input
const staffHit = document.createElementNS("http://www.w3.org/2000/svg", "rect");

const topLineY = stave.getYForLine(0);
const spacing = stave.getSpacingBetweenLines();

// Enough vertical range for full guitar pitch range
const hitPadding = 12 * (spacing / 2); // 12 diatonic steps above/below

staffHit.classList.add("staff-hit");
staffHit.setAttribute("x", staveX);
staffHit.setAttribute("y", topLineY - hitPadding);
staffHit.setAttribute("width", staveWidth);
staffHit.setAttribute("height", hitPadding * 2 + 5 * spacing);
staffHit.setAttribute("fill", "transparent");
staffHit.setAttribute("pointer-events", "all");

// console.log(x, topLineY, staveWidth, spacing)
// for debugging - make the hit boxes visible
// staffHit.setAttribute("fill", "rgba(178, 186, 30, 0.06)");
// staffHit.setAttribute("stroke", "rgba(69, 222, 67, 0.34)");
staffHit.setAttribute("pointer-events", "all");

/*
no pointer events ensures:
    In normal mode → clicking a note selects it
    Hit areas do NOT block note clicks
    need to change to "all" when in note-input mode
    */
  //  console.log("noteInputModeRef.current", noteInputModeRef.current)
  if(!noteInputModeRef.current){
    // console.log("removing pointer events from staffHit")
staffHit.setAttribute("pointer-events", "none");
  }



// NOTE INPUT EVENT HANDLER
// console.log("adding mousedown listener", {staffHit})
staffHit.addEventListener("mousedown", (e) => {
 console.log("staffHit event. noteInputModeRef is  ", noteInputModeRef.current)
  if (!noteInputModeRef.current) return;

  const svgP = clientToSvgPoint(e, svg);

  const staveInfo =  measureRectsRef.current[measure.id]

  const { x, y } = cursorPosRef.current;

   const localY = y - staveInfo.top;
  const pitch = pitchFromY(localY, staveInfo);
  
  const localX = x - staveInfo.left;
  const noteIndex = getNoteIndexForX(localX, staveInfo);

console.log("before onNoteInput ", "\n.  svgP.y,: ", svgP.y, "\n.  pitch: ", pitch)
  onNoteInput(pitch, measureIndex, noteIndex);

});

svg.appendChild(staffHit);



  // Now all notes have been rendered into the SVG
  // add classes to the notes

  notes.forEach((n, index) => {
    // when vexflow draws a note, each note is inside a <g> element
    // the classname should be attached to this element
    const g = n.attrs?.el;   // ← the SVG <g> for this note
    if (g) {
        //You can style VexFlow notes via CSS — but only if you attach your class 
        // after the note is drawn and only if you remove VexFlow’s inline fill/stroke attributes,
        //  because inline SVG attributes override CSS every time.
        // Therefore remove inline attributes so CSS can win
        // g.querySelectorAll("path, ellipse, circle, text").forEach(el => {
        //   el.removeAttribute("fill");
        //   el.removeAttribute("stroke");
        // });
 // Remove inline fill/stroke from ALL children
  g.querySelectorAll("*").forEach(el => {
    el.removeAttribute("fill");
    el.removeAttribute("stroke");
    el.removeAttribute("color");
  });


   // 2. Toggle class to force repaint
  g.classList.remove("voice-note");
  void g.offsetWidth; // force reflow
  g.classList.add("voice-note");

      // g.classList.add("voice-note");
      // console.log("finding id.", measure, index, measure.melody[index], measure.melody[index].id)
      const id = measure.melody[index].id
      g.id=id

// Apply selection class
if (selection?.type === "note" && selection.id === id) {
  g.classList.add("selected-note");
} else {
  g.classList.remove("selected-note");
}


      // g.dataset.noteId = id; // optional but very useful
    }
  });







  // NOTE HITBOXES
    // ======================================================
// ⭐ NOTE HITBOXES + EVENT HANDLERS (per measure)
// ======================================================



// 2. Remove old hitboxes
let old = svg.querySelector(".vf-hitboxes-group");
if (old) old.remove();

// 3. Create hitbox group (must NOT block events)
let hitGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
hitGroup.classList.add("vf-hitboxes-group");
hitGroup.style.pointerEvents = "none"; // group ignores events
svg.appendChild(hitGroup);



// 4. Move hitGroup to TOP so it receives clicks
// svg.removeChild(hitGroup);
// svg.appendChild(hitGroup);

let caretHitRect = null
// 5. Build hitboxes
notes.forEach((vfNote, idx) => {
  const id = measure.melody[idx]?.id;
  if (!id) return;

  // --- REAL VexFlow <g> for this note ---
  const g = vfNote.attrs?.el;
  if (!g) return;

  // Save for selection/highlighting
  noteElements.current.set(id, g);

  // --- Capture original Y for dragging ---
  const ys = vfNote.getYs();
  if (ys && ys.length > 0) {
    originalYRef.current[id] = ys[0];
  }

  // --- Build hitbox from REAL <g> bbox ---
  const bbox = g.getBBox();
  if (!bbox) return;

  const padding = 2;
  const x = bbox.x - padding;
  const y = bbox.y - padding;
  const w = bbox.width + padding * 2;
  const h = bbox.height + padding * 2;

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);

  // Debug visibility — remove stroke later if you want
  rect.setAttribute("fill", "transparent");
  rect.setAttribute("stroke", "transparent");

 rect.setAttribute("stroke", "red");

  // ⭐ IMPORTANT: rect must receive events
  rect.style.pointerEvents = "none";
  if(!noteInputModeRef.current) {
  rect.style.pointerEvents = "all";
  rect.style.cursor = "pointer";
  }

  rect.dataset.noteId = id;
  rect.dataset.measureIndex = measureIndex;
  rect.dataset.noteIndex = idx;

  hitGroup.appendChild(rect);

 if( caret.measure === measureIndex && caret.index === idx) {
caretHitRect = rect
 }
  
  // --- CLICK + DRAG LOGIC (your original code) ---
  rect.addEventListener("mousedown", (e) => {
    e.preventDefault();

    const noteId = rect.dataset.noteId;
    const measureIdx = Number(rect.dataset.measureIndex);
    const noteIdx = Number(rect.dataset.noteIndex);

    // NOTE INPUT MODE
    if (noteInputModeRef.current) {
      e.stopPropagation();
      setCaret({ measure: measureIdx, index: noteIdx });
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!moved && Math.hypot(dx, dy) > 3) {
        moved = true;
        onNoteDragStart(noteId, startX, startY, vfNote);
      }
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      if (!moved) {
        onNoteSelect(noteId);
        moveCaretToNote(vfNote, measureIdx, noteIdx);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  });
});







// CHORD SYMBOLS
  if (measure.chords?.length) {
    const left = stave.getNoteStartX();
    const right = stave.getX() + stave.getWidth() - 20;
    const beatSpacing = (right - left) / 4;
    const y = stave.getYForLine(-5)
    measure.chords.forEach((symbol, b) => {
      const xPos = left + beatSpacing * b;
      ctx.save();
      ctx.setFont("Arial", 14, "");
      ctx.fillText(symbol, xPos, y );
      ctx.restore();
    });
  }




  // CARET
    // make the caret the width of the note and height of the stave
  let caretDrawInfo = null
  if (caret &&
    caret.measure === measureIndex ) {
    // console.log({caret})
      // const noteId = caret.measure.melody.filter((n)=>n.id)
      // const vfNote = vfCacheRef[noteId]

  const staveInfo = measureRectsRef.current[measure.id];

  const { vfNotes } = vfCacheRef.current.get(measure.id)
  if(staveInfo && vfNotes) {
    const note = vfNotes[caret.index]
    if(note){
    const bb = note.getBoundingBox();

   
        let x = bb.getX()
         if( caretHitRect){ x=   caretHitRect.getAttribute("x")}

        let width = bb.getW()
         if( caretHitRect){ width=   caretHitRect.getAttribute("width")}

      //    console.log("bb.x", bb.getX(), "caretHitRect.x", caretHitRect.getAttribute("x"),
      //   "bb.getW", bb.getW(), "caretHitRect.width",caretHitRect.getAttribute("width"),
      // {x, width})
        // console.log("care draw info: ", {caret, measureOfRowIndex, measureRectsRef, staveInfo, x, width})
        // 4. Store everything for drawing
      caretDrawInfo = {
        x: x,
        yTop: staveInfo.staveY,
        yBottom: staveInfo.staveY + staveInfo.spacing * 4,
        width: width
        };
        // console.log("caretDrawInfo", caretDrawInfo)
        }
    }
  // console.log("caretDrawInfo", caretDrawInfo)

}





   if (caretDrawInfo && noteInputModeRef) {
        drawCaret(svg, caretDrawInfo);
      }


      /* TIES
      Using the inbuilt StaveTie - it renders nice looking ties
      Build hit boxes built similar to the hit boxes for notes
      It is not possible to draw a smooth tie between measures, so only draw the tie from the first measure
      unless the second measure is on a new line
      */
// console.log(`MEASURE ${measure.id}`)

      //  { id: "slur1", startMeasure: 0, startIndex: 2, endMeasure: 0, endIndex: 3 },

      // first draw ties

  const vfTies = []
  const measureTies=[]
  leadSheet.ties.forEach((tie)=>{

    if(tie.startMeasure === measureIndex || tie.endMeasure === measureIndex) {
      const m1 = leadSheet.measures[tie.startMeasure]
      const m2 = leadSheet.measures[tie.endMeasure]
      // console.log("stave tie for measure id: ",measure.id,  { m1, m2, rowIndex, measureIndex, measureOfRowIndex})
      const vfNotes = vfCacheRef.current.get(measure.id)?.vfNotes

      let vfTie = null

      if( tie.startMeasure === tie.endMeasure) {
        
          // console.log("same measure: ", {tie, m1, m2, vfNotes, vf1: vfNotes[tie.startIndex], vf2:vfNotes[tie.endIndex]})

          vfTie = new VF.StaveTie({
          first_note: vfNotes[tie.startIndex],
          first_indices: [0],
          last_note: vfNotes[tie.endIndex],
          last_indices: [0],
          } )
          }

      else {

          if( m1.id === measure.id){ // start measure
                    // console.log("start tie: ", {tie, m1, m2, vfNotes, first_note: vfNotes[tie.startIndex], })

              vfTie = new VF.StaveTie({
              first_note: vfNotes[tie.startIndex],
              first_indices: [0],
              } )
          }
          else if( m2.id === measure.id) { // end measure
           const vf1Notes = vfCacheRef.current.get(m1.id)?.vfNotes

           const vfNotes = vfCacheRef.current.get(m1.id)?.vfNotes

                              // console.log("end tie: ", {tie, m1, m2, vfNotes, last_note: vfNotes[tie.endIndex], })

              vfTie = new VF.StaveTie({
              //   first_note: vf1Notes[tie.startIndex],
              // first_indices: [0],
              last_note: vfNotes[tie.endIndex],
              last_indices: [0],
              } )
          }
      }

      
    
      if( !(measureOfRowIndex !== 0 && tie.endMeasure === measureIndex) ) { // the second join does not match so dont draw
        const tieGroup  = ctx.openGroup("tie-group"); // vexflow will prefix the class name with vf, to retrie it use vf-tie-group
        vfTie?.setContext(ctx).draw()
        ctx.closeGroup();

        tieGroup.classList.add(`${tie.id}`)

      if( vfTie){
        vfTies.push({ vfTie, group: tieGroup });
        measureTies.push(tie)
        }

      }
  }
  })


  
   // ======================================================
// ⭐ TIE HITBOXES + EVENT HANDLERS (per measure)
// ======================================================



// 2. Remove old hitboxes
 old = svg.querySelector(".tie-hitboxes-group");
if (old) old.remove();

// 3. Create hitbox group (must NOT block events)
 hitGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
hitGroup.classList.add("tie-hitboxes-group");
hitGroup.style.pointerEvents = "none"; // group ignores events
svg.appendChild(hitGroup);

// 5. Build hitboxes
vfTies.forEach(({vfTie, group}, idx) => {
  const tie = measureTies[idx]
  const tieId = tie.id

  // --- REAL VexFlow <g> for this note ---
  // const g = vfTie.attrs?.el;
  const g = group; // ← this is the real <g>
    // console.log("tie group", {measure, g, tie, vfTie, idx})



  if (!g) return;

  // Save for selection/highlighting
  tieElements.current.set(tieId, g);


  // --- Build hitbox from REAL <g> bbox ---
  const bbox = g.getBBox();
  // console.log("tie hit box", {bbox})
  if (!bbox) return;

  const padding = 2;
  const x = bbox.x - padding;
  const y = bbox.y - padding;
  const w = bbox.width + padding * 2;
  const h = bbox.height + padding * 2;

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);

  // Debug visibility — remove stroke later if you want
  rect.setAttribute("fill", "transparent");
  rect.setAttribute("stroke", "transparent");

 rect.setAttribute("stroke", "red");
 rect.setAttribute("fill", "pink");
rect.setAttribute("opacity", "0.4");
  // ⭐ IMPORTANT: rect must receive events
  rect.style.pointerEvents = "none";
  if(!noteInputModeRef.current) {
  rect.style.pointerEvents = "all";
  rect.style.cursor = "pointer";
  }

  rect.dataset.tieId = tieId;
  rect.dataset.measureIndex = measureIndex;
  rect.dataset.tieIndex = idx;

  hitGroup.appendChild(rect);


  // --- CLICK + DRAG LOGIC (your original code) ---
  rect.addEventListener("mousedown", (e) => {
    e.preventDefault();

    const tieId = rect.dataset.tieId;
    const measureIdx = Number(rect.dataset.measureIndex);
    const noteIdx = Number(rect.dataset.noteIndex);


    const onUp = () => {
      window.removeEventListener("mouseup", onUp);

  
        onTieSelect(tieId);
      
    };

    window.addEventListener("mouseup", onUp);
  });
});






// drawTies({
//   stave,
//   vfNotes: notes,
//   melody: measure.melody,
//   measureIndex,
//   measureLayout:  measureRectsRef.current,
//   leadSheet,
//   selection,
//   setSelection,
//   svg: svgRef.current,
//   tieLayerRef
// });







//       // --- TIE LAYER ---
//   if( measure?.melody?.length){
//     // let tieLayer = tieLayerRef.current;

//     // if (!tieLayer || !tieLayer.isConnected) {
//     //   tieLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
//     //   tieLayer.classList.add("tie-layer");
//     //   svg.appendChild(tieLayer);
//     //   tieLayerRef.current = tieLayer;
//     // }

//     // --- TIE LAYER (always recreate cleanly) ---
//     let oldLayer = svg.querySelector(".tie-layer");
//     if (oldLayer) oldLayer.remove();

//     const tieLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
//     tieLayer.classList.add("tie-layer");
//     svg.appendChild(tieLayer);

//     tieLayerRef.current = tieLayer;




//     // clear old ties
//     while (tieLayer.firstChild) tieLayer.removeChild(tieLayer.firstChild);

//     leadSheet.ties
//       .filter(t => t.startMeasure === measureIndex)
//       .forEach(tie => {
//         const startNote = noteElements.current.get(
//           measure.melody[tie.startIndex].id
//         );
//         const endNote = noteElements.current.get(
//           measure.melody[tie.endIndex].id
//         );

//         if (!startNote || !endNote) return;

//         const sBox = startNote.getBBox();
//         const eBox = endNote.getBBox();

//         const x1 = sBox.x + sBox.width;
//         const y1 = sBox.y + sBox.height / 2;

//         const x2 = eBox.x;
//         const y2 = eBox.y + eBox.height / 2;

//         // control points for a nice curve
//         const c1x = x1 + 12;
//         const c1y = y1 + 10;

//         const c2x = x2 - 12;
//         const c2y = y2 + 10;
//     console.log("creating a tie")
//         const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

//         path.setAttribute(
//           "d",
//           `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
//         );

//         path.setAttribute("fill", "none");
//         path.setAttribute(
//           "stroke",
//           selection?.type === "tie" && selection.id === tie.id
//             ? "dodgerblue"
//             : "black"
//         );
//         path.setAttribute("stroke-width", selection?.id === tie.id ? 2 : 1);

//         path.dataset.tieId = tie.id;

//         tieLayer.appendChild(path);

//     //     console.log("TIE PATH EXISTS?", tieLayer.contains(path));
//     // console.log("TIE LAYER CHILD COUNT:", tieLayer.childNodes.length);


//         // console.log("tie layer:  ", tieLayer, "child tie path: ", path)

//       });

//     // tie boxes for hit selection

//       leadSheet.ties
//       .filter(t => t.startMeasure === measureIndex)
//       .forEach(tie => {
//         const startNote = noteElements.current.get(
//           measure.melody[tie.startIndex].id
//         );
//         const endNote = noteElements.current.get(
//           measure.melody[tie.endIndex].id
//         );

//         if (!startNote || !endNote) return;

//         const sBox = startNote.getBBox();
//         const eBox = endNote.getBBox();

//         const x1 = sBox.x + sBox.width;
//         const y1 = sBox.y + sBox.height / 2;

//         const x2 = eBox.x;
//         const y2 = eBox.y + eBox.height / 2;

//         // control points for a nice curve
//         const c1x = x1 + 12;
//         const c1y = y1 + 10;

//         const c2x = x2 - 12;
//         const c2y = y2 + 10;

//         const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

//         path.setAttribute(
//           "d",
//           `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
//         );

//         path.setAttribute("fill", "none");
//         path.setAttribute(
//           "stroke",
//           selection?.type === "tie" && selection.id === tie.id
//             ? "dodgerblue"
//             : "black"
//         );
//         path.setAttribute("stroke-width", selection?.id === tie.id ? 2 : 1);

//         // debugging
//         path.setAttribute("fill", "yellow");
//          path.setAttribute("opacity", "0.3");

//         path.dataset.tieId = tie.id;

//         tieLayer.appendChild(path);
//       });
//   }


// console.log(
//   "FINAL TIE CHILD COUNT (measure", measureIndex, "):",
//   tieLayerRef.current?.childNodes.length
// );


    /*
staveWidth, rowIndex, measureOfRowIndex are critical here for correct measure rendering
Without these React was happily resizing the container,
but VexFlow was still drawing the old width.

*/

  }, [
  measure.id,
  measure.melody,
  staveWidth,
  leadSheet.ties,
  noteInputMode
]
);  // useLayoutEffect





  return (
    <svg
      ref={svgRef}
      className="measure-svg"
      width={staveWidth}
      height={staveHeight}
      data-measure={measureIndex}
    />
  );
}

