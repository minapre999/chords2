
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
  x -= 28
  y -= 35
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

   transX = x
   transY = layoutInfo.top
 el.style.transform = `translate(${transX}px, ${transY}px)`;

  
}


// note the top and bottom ledger lines are currently hard coded in
// these need to be set to bottom and upper range

export function updateCursorShape({ notehead, snappedY, layoutInfo }) {
 
 
   const {stave, staveY, spacing} = layoutInfo // staveY is the top line


    let el = cursorOverlayRef.current;
  
  if (!el || !stave) return;

 
  // Clear previous shape
  el.innerHTML = "";

  // Create SVG container
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "80");
  svg.style.overflow = "visible";

  // --- NOTEHEAD ---
  // const noteY = stave.getYForLine(lineIndex);
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "20");
  text.setAttribute("y", "30");
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

//   // Above the staff


  let ly = staveY -spacing ;
let numLines = 1
  console.log({ly, staveY, snappedY})

  while( ly >= snappedY & numLines <=5 ) {

 const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "15");
      line.setAttribute("x2", "35");
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
      line.setAttribute("x1", "15");
      line.setAttribute("x2", "35");
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


