
import {durationToGlyph} from "/src/components/lead-sheet/cursor/durationToGlyph"



export function updateCursorOverlay(args) {

    const {cursorPosRef, staveInfo, inputDurationRef, vfCacheRef} = args

      if (!cursorPosRef || !inputDurationRef || !vfCacheRef || !staveInfo) return;

    const cursorPos = cursorPosRef.current
    const inputDuration = inputDurationRef.current

  const cursor = document.getElementById("note-input-cursor");
  const ledgers = document.getElementById("cursor-ledgers");
  const glyph = document.getElementById("cursor-glyph");



const{stave, spacing, topLineY} = staveInfo
  const {x, y} = cursorPos
  //


const glyphChar = durationToGlyph(inputDuration)
const measureId = staveInfo.measureId
const  vfNotes  = vfCacheRef?.current?.get(measureId).vfNotes

console.log("UPDATE CURSOR OVERLAY", {cursorPos, stave, spacing, inputDuration, vfNotes, vfCacheRef, glyphChar, measureId})


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


 const svg = document.getElementById("lead-sheet-svg");


  ledgers.innerHTML = "";
  ledgers.setAttribute("stroke", "#00aaff");

  const topY = topLineY;
  const bottomY = topLineY + spacing * 4;

    if (cursorPos.y >= topY && cursorPos.y <= bottomY) {
        console.log("removing ledgers")
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
            console.log( {line, ly, cursorPos, topY})

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
