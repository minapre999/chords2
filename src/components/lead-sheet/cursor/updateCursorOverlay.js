
import {durationToGlyph} from "/src/components/lead-sheet/cursor/durationToGlyph"
import { cursorOverlayRef, cursorPosRef } from "./cursorRefs";
import { createPortal } from "react-dom";
/*
updateCursorOverlay
x,y must be passed in global coords
The transform 
cursorPosRef.current is already converted to the global  coords - see the onMove function in LeadSheetRenderer
rect is the layout rect, the most useful piece of data is the staveY property, which is the top line of the stave
*/



export function updateCursorOverlay({id, rect}) {
  if( !id || !rect) return;
  const el = cursorOverlayRef.current;
  if (!el) return;

  const { x, y, visible } = cursorPosRef.current;
// console.log("updateCursorOverlay", {el, id, rect, x, y, visible})

  el.style.opacity = visible ? "1" : "0";
  el.style.color = 'red'
  el.style.transform = `translate(${x}px, ${y}px)`;

console.log(
  "overlayRect:",
  cursorOverlayRef.current.getBoundingClientRect()
);
console.log(
  "offsetParent:",
  cursorOverlayRef.current.offsetParent
);
const parent = cursorOverlayRef.current.offsetParent;
if (parent) {
  console.log("offsetParentRect:", parent.getBoundingClientRect());
}


  
}




export function updateCursorShape({ notehead, ledgerCount }) {
  const el = cursorOverlayRef.current;
  if (!el) return;

  // Clear previous shape
  el.innerHTML = "";

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "60");

  // Notehead
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "20");
  text.setAttribute("y", "30");
  text.setAttribute("font-family", "Bravura");
  text.setAttribute("font-size", "32");
  text.setAttribute("text-anchor", "middle");
  text.textContent = notehead; // e.g. ""
  svg.appendChild(text);

  // Ledger lines
  for (let i = 0; i < ledgerCount; i++) {
    const y = 30 + (i + 1) * 10;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "15");
    line.setAttribute("x2", "35");
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  }


  // debugging



console.log("cursorOverlayRef:", cursorOverlayRef.current);
console.log("overlay children:", cursorOverlayRef.current.children);
console.log("adding svg: ", svg)
  el.appendChild(svg);
}




export function updateCursorOverlayXXX(args) {

      const el = cursorOverlayRef.current;
  if (!el) return;


/*
  measureRectsRef.current[measure.id] = {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    spacing: stave.getSpacingBetweenLines(),
    topLineY: stave.getYForLine(0),
    measureWidth: staveWidth,
    stave: stave,
    beats: 4,
    measureId: 
    svgRef:
  };
  */

    const {svgRef, measureId, measureRectsRef, cursorPosRef,  inputDurationRef, vfCacheRef} = args

      if (!svgRef?.current || !measureId || !measureRectsRef || !cursorPosRef || !inputDurationRef || !vfCacheRef ) return;

      // console.log("UPDATE CURSOR OVERLAY", {measureId, measureRectsRef,  cursorPosRef, inputDurationRef, vfCacheRef})


    const cursorPos = cursorPosRef.current
    const inputDuration = inputDurationRef.current

  const cursor = document.getElementById("note-input-cursor");
  const ledgers = document.getElementById("cursor-ledgers");
  const glyph = document.getElementById("cursor-glyph");

console.log({cursor, ledgers, glyph})
const measureRect =  measureRectsRef.current[measureId]
const{ spacing, topLineY, stave} = measureRect

  const {x, y} = cursorPos
  

const glyphChar = durationToGlyph(inputDuration)
const  vfNotes  = vfCacheRef?.current?.get(measureId).vfNotes

// console.log("UPDATE CURSOR OVERLAY", {cursorPos, stave, spacing, inputDuration, vfNotes, vfCacheRef, glyphChar, measureId})


 let vfNote = null
  let foundIndex = null
let rect = null
  const padding = 6
  for(let i =0; i < vfNotes.length; i++) {
     vfNote = vfNotes[i]
     rect = vfNote.getBoundingBox()
    if(  x > rect.getX() - padding  && x < rect.getX()  + rect.getW()  + padding ){
        foundIndex = i
        break;
      }
  }
  //     const vfNote = vfNotes[caret.index]
  // 1. Move cursor group
  //
  //rect.getX()  + rect.getW() 
const curX = rect.getX() 

  cursor.setAttribute("transform", `translate(${curX+6}, ${cursorPos.y})`);

  console.log("updateCursorOverlay", {curX, glyphChar, cursorPos, rect, measureId})
  //
  // 2. Draw glyph
  //
  glyph.innerHTML = `
    <text 
        font-family="Bravura" 
        font-size="32" 
        dominant-baseline="middle" 
        text-anchor="middle"
          fill="#00aaff" 
        >
      ${glyphChar}
    </text>
  `;


  
  //
  // 3. Draw ledger lines (your logic, unchanged)
  //


//  const svg = document.getElementById("lead-sheet-svg");
const svg = svgRef.current

  ledgers.innerHTML = "";
  ledgers.setAttribute("stroke", "#00aaff");

  const topY = topLineY;
  const bottomY = topLineY + spacing * 4;

    if (cursorPos.y >= topY && cursorPos.y <= bottomY) {
        // console.log("removing ledgers")
          svg.querySelectorAll(".ledger-line").forEach(el => el.remove());
        return;
            }

  let ly;


//   ABOVE
//   need to render in LOCAL COORDINATES i.e. relative to the cursor
  ly = topY - spacing;
  if (y < topY) {
    while (ly > y) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

      line.setAttribute("x1", String(x-24));
      line.setAttribute("x2", String(x+2));
      line.setAttribute("y1", String(ly ));
      line.setAttribute("y2", String(ly ));
      line.setAttribute("stroke-width", "1.0");
      line.setAttribute("stroke", "#00aaff");
      line.classList.add("ledger-line");   // ⭐ your requested change
            svg.appendChild(line);
 
    //   ledgers.appendChild(line);

      ly -= spacing;
    }
  }


  // BELOW
  ly = bottomY;
  if (y > bottomY) {
    while (ly < y) {
  

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            // console.log( {line, ly, cursorPos, topY})

      line.setAttribute("x1", String(x-24));
      line.setAttribute("x2", String(x+2));
      line.setAttribute("y1", String(ly+spacing));
      line.setAttribute("y2", String(ly+spacing));
      line.setAttribute("stroke-width", "1.0");
      line.setAttribute("stroke", "#00aaff");
      line.classList.add("ledger-line");   // ⭐ your requested change
        svg.appendChild(line);

    //   ledgers.appendChild(line);

      ly += spacing;
    }
  }
   
  // 4. Bring cursor to front (CRITICAL)
  //
//   cursor.parentNode.appendChild(cursor);

}
