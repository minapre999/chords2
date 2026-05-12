
import {durationToGlyph} from "/src/components/lead-sheet/cursor/durationToGlyph"
import { cursorOverlayRef, cursorPosRef, cursorLedgersRef } from "./cursorRefs";
import { createPortal } from "react-dom";
/*
updateCursorOverlay
x,y must be passed in global coords
The transform 
cursorPosRef.current is already converted to the global  coords - see the onMove function in LeadSheetRenderer
rect is the layout rect, the most useful piece of data is the staveY property, which is the top line of the stave
*/



export function updateCursorOverlay({id, layoutInfo}) {
  if( !id || !layoutInfo) return;
  let el = cursorOverlayRef.current;
  if (!el) return;

  let { x, y, visible } = cursorPosRef.current;

  // for some reason the translate does not map the global to the
  // exactly to the note
  const X_TRANSLATE_FIX = 0
  const Y_TRANLATE_FIX = 0 
  x -= X_TRANSLATE_FIX
  y -= Y_TRANLATE_FIX
// console.log("updateCursorOverlay", {el, id, layoutInfo, x, y, visible})

  el.style.opacity = visible ? "1" : "0";

  el.style.fill = "#00aaff";
  el.style.stroke = "#00aaff";

  let transX = x
  let transY = y
  el.style.transform = `translate(${transX}px, ${transY}px)`;


  
  el = cursorLedgersRef.current;
 if (!el) return;

   el.style.opacity = visible ? "1" : "0";

el.style.fill = "#00aaff";
el.style.stroke = "#00aaff";
//  transform the y position to the top of the stave so ledger lines are fixed
// all drawing into the ledger element will now be same coordinates as if 
// drawing into the measure

// console.log("layoutInfo: ", layoutInfo)

  //  transX = x
  transX = layoutInfo.left 
   transY = layoutInfo.top
 el.style.transform = `translate(${transX}px, ${transY}px)`;

  
}





// note the top and bottom ledger lines are currently hard coded in
// these need to be set to bottom and upper range
// snappedX and snappedY are local
export function updateCursorShape({ notehead, snappedY, snappedX, layoutInfo, vfNotes, noteRect }) {
 
 
   const {stave, staveY, spacing} = layoutInfo // staveY is the top line

// console.log("CURSOR SHAPE: ", {notehead, snappedY, layoutInfo, noteRect, vfNotes}, )
    let el = cursorOverlayRef.current;
  
  if (!el || !stave) return;

 
  // Clear previous shape
  el.innerHTML = "";

  // Create SVG container
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.style.overflow = "visible";

  // --- NOTEHEAD ---
  // const noteY = stave.getYForLine(lineIndex);
 
  // NOTE: the x coordinate for the notehead is different to that 
  // of the ledger lines because the notehead coordinated system has been transformed
  // to the (snapped) cursor coordinates i.e. zero is at the cursor
  // whereas the ledger linese coordinates has been transformed to the stave coordinates
  // i.e. zero is  the left of the stave
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(-1*noteRect.width/2));
  text.setAttribute("y", "0");
  text.setAttribute("font-family", "Bravura");
  text.setAttribute("font-size", "32");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.textContent = notehead;
  svg.appendChild(text);

  el.appendChild(svg);


    // --- LEDGER LINES ---

   el = cursorLedgersRef.current;
  if (!el) return;
  
   // Clear previous legers
  el.innerHTML = "";


svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.style.overflow = "visible";

//TESTING 
// 1. stave rectangle
// this test works as expected - a rectangle covers the entire stave 
// const testH = layoutInfo.bottom - layoutInfo.top
// const testW = layoutInfo.right - layoutInfo.left
//   const line = document.createElementNS("http://www.w3.org/2000/svg", "rect");
//       line.setAttribute("x", "0");
//       line.setAttribute("y", "0");
//       line.setAttribute("width",  String(testW));
//       line.setAttribute("height", String(testH)) ;
//       line.setAttribute("stroke-width", "4");
//       svg.appendChild(line);
  
  // 2. note rectangle
// this is to draw a rect around the note of the stave
// this works perfectly as well
// vfNotes.forEach((note)=>{
//     const bb = note.getBoundingBox();
//   const x = bb.getX()
//   const y = bb.getY()
// const testH = bb.getH()
// const testW = bb.getW()
// const line = document.createElementNS("http://www.w3.org/2000/svg", "rect");
//       line.setAttribute("x", String(x));
//       line.setAttribute("y", String(y));
//       line.setAttribute("width",  String(testW));
//       line.setAttribute("height", String(testH)) ;
//       line.setAttribute("stroke-width", "4");
//       svg.appendChild(line);

//   })
  
  



//   // Above the staff


  let ly = staveY -spacing ;
let numLines = 1
const ledgerWidth = 20
  // console.log({ly, staveY, snappedY})
  // noteRect.x seems to align to the right of the note box
  // so the left side is noteRect.x - noteRect.width
 const x = Math.floor(noteRect.x1)

  while( ly >= snappedY & numLines <=5 ) {

 const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x))
      line.setAttribute("x2", String(x + ledgerWidth))
      line.setAttribute("y1", String(ly));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke-width", "1.5");
      svg.appendChild(line);
    ly -= spacing;
    numLines++
  }
 

  //
  // BELOW
  //
  const bottomY = staveY + spacing * 4
  ly = bottomY + spacing
  numLines = 1
  if (snappedY > bottomY) {
    while (ly < snappedY & numLines <=3 ) {

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(x));
      line.setAttribute("x2", String(x + ledgerWidth))
      line.setAttribute("y1", String(ly));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke-width", "1.5");
      svg.appendChild(line);

      ly += spacing;
       numLines++
    }
  }


  el.appendChild(svg);


}


