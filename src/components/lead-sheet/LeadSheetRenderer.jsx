import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef,   useLayoutEffect, } from "react";
import LeadSheetAutoFlow from "./LeadSheetAutoFlow";
import "./LeadSheetRenderer.css"
import {cursorPosRef, cursorOverlayRef, cursorLedgersRef} from "/src/components/lead-sheet/cursor/cursorRefs";
import { updateCursorOverlay, updateCursorShape } from "/src/components/lead-sheet/cursor/updateCursorOverlay";



export const measureRectsRef = { current: {} };



export default function LeadSheetRenderer(props) {
 const {
  cursorVisible, setCursorVisible, 
  dragPreview,
  dragRef,
  vfCacheRef,
          } = props

 
const [rowWidth, setRowWidth] = useState(800); // default
const lsContainerRef = useRef(null);






// mouse move for note input cursor

useEffect(() => {



  const container = lsContainerRef.current;
  if (!container) return;



  function onMove(e) {

    const x = e.clientX;
    const y = e.clientY;

    let found = null;
    let mRect = null
    for (const [id, rect] of Object.entries(measureRectsRef.current)) {
      if (x >= rect.left && x <= rect.right &&
          y >= rect.top && y <= rect.bottom) {
        found = { id, rect };
        break;
      }
    }

    if (!found ) {
      cursorPosRef.current.visible = false;
      // updateCursorOverlay({layout});
      return;
    }

  const layout = found.rect
  const noteId = found.id
  const  {vfNotes} = vfCacheRef.current.get(noteId)

if(!vfNotes) return;

// console.log("layout measure rect: ", layout)

const globalX = e.clientX;
const globalY = e.clientY;

const localX = globalX - layout.left;
const localY = globalY - layout.top;


// Snap X
let snappedLocalX = localX;

const noteRect = getNoteRectFromX(localX, layout.noteStartX, vfNotes);



if (noteRect) {
  snappedLocalX = noteRect.x1 + noteRect.width;
}

// Snap Y (use staveY, not note rect)
const snappedLocalY = snapToStaveLine(localY, layout.staveY);
const snappedGlobalX = layout.left + snappedLocalX
const snappedGlobalY = layout.top  + snappedLocalY
// Convert back to global

  const CURSOR_Y_OFFSET = 0; // or +2, +3, etc.
   const CURSOR_X_OFFSET = 0; // or +2, +3, etc.

cursorPosRef.current = {
  visible: true,
  x: snappedGlobalX + CURSOR_X_OFFSET,
  y: snappedGlobalY + CURSOR_Y_OFFSET,
};


// console.log({
//   clientY: e.clientY,
//   pageY: e.pageY,
//   scrollY: window.scrollY,
//   containerScrollTop: lsContainerRef.current?.scrollTop,
//   measureRectTop: layout.top,
// });



// console.log({
//   globalTop: layout.top,
//   localX,
//   globalX,
//   snappedLocalX,
//   snappedGlobalX,
//   localY,
//   globalY,
//   snappedLocalY,
//   snappedGlobalY,
//  layout,
//  noteRect
// });



// Update shape first
updateCursorShape({
  notehead: "\uECA5",
  ledgerCount: 2,
  snappedX: snappedLocalX,
  snappedY: snappedLocalY,
  layoutInfo: layout,
  vfNotes,
  noteRect,
});

// Then move overlay
updateCursorOverlay({id: noteId, snappedGlobalY, layoutInfo: layout});


} // onMove

  container.addEventListener("mousemove", onMove);
  container.addEventListener("mouseleave", () => {
    cursorPosRef.current.visible = false;
    // updateCursorOverlay(layout);
  });

  return () => container.removeEventListener("mousemove", onMove);
}, []);





function snapToStaveLine( y, rect){
  // just need to snap to the nearest half space
const { staveY, spacing } = rect;
const halfSpacing = spacing / 2;
let snapY = Math.floor(y/5)*5 // snap to the next lowest half space

// hard code this for now assume 17 max frets and standard tuning
// F5 is the top line, F6 = fret 13, A6 = fret 17, B6 = fret19
// E4 is the bottom line, E5 is the lowest not

// console.log("snapToStaveLine", {y, snapY})
return snapY
  }


// notStartX is the offset where the note drawing starts in the stave
// so takes into account treble clef, etc.

function getNoteRectFromX(x, noteStartX, vfNotes) {
  const boxes = vfNotes.map(note => {
    const bb = note.getBoundingBox();
    return {
      note,
      x1: /*noteStartX + */bb.getX(),
      x2: /*noteStartX + */bb.getX() + bb.getW(),
      y1: bb.getY(),
      y2: bb.getY() + bb.getH(),
      width: bb.getW(),
      height: bb.getH(),
    };
  });
// console.log("boxes", x, boxes)
  // strict containment
  const hit = boxes.find(b => x >= b.x1 && x <= b.x2);
  // console.log("layout note rect: ", {hit, boxes, x, noteStartX, vfNotes, })
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




useLayoutEffect(() => {
  function updateWidth() {
    if (!lsContainerRef.current) return;
    const w = lsContainerRef.current.clientWidth;
    setRowWidth(Math.floor(w * 0.8) )
  }

  // run once immediately
  updateWidth();

  // listen for window resize
  window.addEventListener("resize", updateWidth);

  return () => {
    window.removeEventListener("resize", updateWidth);
  };
}, []);



  
  return (
   <>

    <div
        id="note-input-cursor"
        ref={el => (cursorOverlayRef.current = el)}
        style={{
          position: "fixed",
          pointerEvents: "none",
          opacity: 0,
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          width: "0px",
          height: "0px",
        }}>
      </div>


 <div
        id="ledger-lines"
        ref={el => (cursorLedgersRef.current = el)}
        style={{
          position: "fixed",
          pointerEvents: "none",
          opacity: 0,
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          width: "0px",
          height: "0px",
        }}>
      </div>


    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <LeadSheetAutoFlow
      {...props}
      rowWidth={rowWidth}
        className="ls-container"
     
        ref={lsContainerRef}
        style={{ width: "100%", minHeight: "600px" }}
      
      />
    </div>


  

 </>   
  );
}