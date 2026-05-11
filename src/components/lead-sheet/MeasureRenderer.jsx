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
            measureIndex, 
            leadSheet,
            lsContainerRef,
            measure, 
            measureElements,
            noteElements,
            noteInputModeRef,
            onNoteDragStart,
            noteInputMode,
            onNoteSelect,
            playerRef,
            selection, setSelection,
            rowIndex,
            rendererRef,

            width,
             vfCacheRef, } = props


if(!leadSheet) return;

  const svgRef = useRef(null);
  const staveRef = useRef(null);

  // set in the props and here?
    // const staveWidth = width
    const staveHeight = 160
    const staveTopPadding = 60
//  console.log("MR", measureIndex, {
//     naturalWidth: measure.naturalWidth,
//     finalWidth: measure.finalWidth,
//     propWidth: width,
//   });

  const staveWidth = width ;
//   console.log("staveWidth used", staveWidth);

    const originalYRef = useRef({});


  // for debugging
  useEffect(() => {
    window.noteElements = noteElements;
window.measureElements = measureElements;

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
   console.log("rendering measure")
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

  //   left: rect.left,
  //   right: rect.right,
  //   top: rect.top,
  //   bottom: rect.bottom,
  //   spacing: stave.getSpacingBetweenLines(),
  //   topLineY: stave.getYForLine(0),
  //   measureWidth: staveWidth,
  //   stave: stave,
  //   beats: 4,
  //   measureId: measure.id,
  //  svgRef: svgRef,
  };
}, [staveWidth, measureIndex, rowIndex]);





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



  // 5. Trigger React to re-render the caret overlay
  // console.log("setting caret to", {measureIdx, noteIdx})
  // setCaret({
  //   measure: measureIdx,
  //   index: noteIdx,
   
  // });
}






  useLayoutEffect(() => {
    // console.log("LEAD SHEET RENDER LAYOUT")
   const svg = svgRef.current;
  if (!svg) return;

  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const VF = window.Vex.Flow;
  const renderer = new VF.Renderer(svg, VF.Renderer.Backends.SVG);
  const ctx = renderer.getContext();

  rendererRef.current = renderer

  const staveY = 25
  const staveX = 0
  const stave = new VF.Stave(staveX, staveY, staveWidth);

  if (measureIndex === 0 && rowIndex === 0) {
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

//   svg.setAttribute("width", staveWidth);


// // 1. Create voice
// const voice = new VF.Voice({
//   num_beats: 4,
//   beat_value: 4,
//   resolution: VF.RESOLUTION
// });
// voice.setStrict(false);
// voice.addTickables(notes);

// // 2. Format using the FINAL measure width
// const formatter = new VF.Formatter();
// formatter.joinVoices([voice]);
// formatter.format([voice], staveWidth - 20);   // ⭐ THIS IS THE FIX

// // 3. Draw
// voice.draw(ctx, stave);


  // NOTE HITBOXES
    
  // ======================================================
// ⭐ NOTE HITBOXES + EVENT HANDLERS (per measure)
// ======================================================




// Remove old hitboxes
const old = svg.querySelector(".vf-hitboxes-group");
if (old) old.remove();

// Create new group
const hitGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
hitGroup.classList.add("vf-hitboxes-group");
hitGroup.style.pointerEvents = "none"; // group ignores events
svg.appendChild(hitGroup);





// console.log("staveWidth", staveWidth);
// console.log("notes.length", notes.length);

notes.forEach((vfNote, idx) => {
  const id = measure.melody[idx]?.id;
  if (!id) return;

  // --- 1. Create VexFlow note group ---
  // Create VexFlow note group
const g = ctx.openGroup();
vfNote.setContext(ctx).draw();
ctx.closeGroup();



// Apply selection class
if (selection?.type === "note" && selection.id === id) {
  g.classList.add("selected-note");
} else {
  g.classList.remove("selected-note");
}


  // Save reference for selection highlighting
  noteElements.current.set(id, g);



  // --- 3. Capture original Y for dragging ---
  const ys = vfNote.getYs();
  if (ys && ys.length > 0) {
    originalYRef.current[id] = ys[0];
  }

  // --- 4. Build hitbox ---
  const bbox = vfNote.getBoundingBox();
  if (!bbox) return;

  const padding = 6;
  const x = bbox.getX() - padding;
  const y = bbox.getY() - padding;
  const w = bbox.getW() + padding * 2;
  const h = bbox.getH() + padding * 2;

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);
  rect.setAttribute("fill", "transparent");
  rect.setAttribute("stroke", "transparent");
    rect.setAttribute("stroke", "red");
  rect.style.cursor = "pointer";
  rect.style.pointerEvents = "all";

  rect.dataset.noteId = id;
  rect.dataset.measureIndex = measureIndex;
  rect.dataset.noteIndex = idx;

  hitGroup.appendChild(rect);

  // --- 5. Click + drag handler ---
  rect.addEventListener("mousedown", (e) => {
    e.preventDefault();
    console.log("clicked...")
    const noteId = rect.dataset.noteId;
    const measureIdx = Number(rect.dataset.measureIndex);
    const noteIdx = Number(rect.dataset.noteIndex);

    if (noteInputModeRef.current) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      setCaret({ measure: measureIdx, index: noteIdx });
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    const onMove = (ev) => {
      console.log("moved...")
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


// Save hitMap for this measure









  

    // CHORD SYMBOLS

  if (measure.chords?.length) {
  const left = stave.getNoteStartX();
  const right = stave.getX() + stave.getWidth() - 20;
  const beatSpacing = (right - left) / 4;

  // ⭐ Correct Y position ABOVE the stave
  const chordY = stave.getYForTopText();

  measure.chords.forEach((symbol, b) => {
    const xPos = left + beatSpacing * b;

    ctx.save();
    ctx.setFont("Arial", 14, "");
    ctx.fillText(symbol, xPos, chordY);
    ctx.restore();

    // console.log({ symbol, xPos, chordY });
  });
}




  
    // ⭐ Insert cursor overlay AFTER VexFlow draws
    // let overlay = svg.querySelector(".cursor-overlay");
    // if (!overlay) {
    //   overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //   overlay.classList.add("cursor-overlay");
    //   overlay.style.pointerEvents = "none";

    //   const glyph = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //   glyph.id = "cursor-glyph";

    //   const ledgers = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //   ledgers.id = "cursor-ledgers";

    //   overlay.appendChild(glyph);
    //   overlay.appendChild(ledgers);
    //   svg.appendChild(overlay);
    // }

    /*
staveWidth, rowIndex, measureIndex are critical here for correct measure rendering
Without these React was happily resizing the container,
but VexFlow was still drawing the old width.

*/

  }, [measure, staveWidth, rowIndex, selection, leadSheet.slurs, leadSheet.ties, dragRef, noteInputMode]);  // useLayoutEffect





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

