

import "./NoteInputCaret.css"


export default function NoteInputCaret({
  visible,
  stave,
  lsContainerRef,
  vfCacheRef,
  caret,
  caretStaveInfo,
  leadSheet,
  lastMeasureLayoutRef,
}) {

//    if (!visible) return null;

if(!caret || !vfCacheRef) return null
 if( vfCacheRef.current.size == 0) return null

// if (!visible || !pos || topLineY == null || !spacing || !stave) {
//   return null;
// }



 const measure = leadSheet.measures[caret.measure]
 
console.log({measure, vfCacheRef})
const measureNotes = vfCacheRef?.current?.get(measure.id)
const vfNote = measureNotes.vfNotes[caret.index]

console.log("vfCacheRef?.current", vfCacheRef.current, {vfNote,measure, measureNotes},  )
const bb = vfNote.getBoundingBox();
const x= bb.getX()
const width= bb.getW()
let height = bb.getH()
let y= bb.getY()

if(lastMeasureLayoutRef.current.length > caret.measure) {
 const layout = lastMeasureLayoutRef.current[caret.measure]
 y = layout.topLineY
height =layout.spacing*4
}

const caretRect = <rect className="caret-rect" x={x} y={y} width={width} height={height} strokeWidth="1.5"/>
console.log({x,  y, width, height, caretRect, measure, lastMeasureLayoutRef})


  


  // --------------------------------------
  // Compute caret rectangle 
  // --------------------------------------
   let caretDrawInfo = null;


    console.log({caret})
 
//   const staveInfo = caretStaveInfo
//   const noteX = vfNote.getAbsoluteX();


//  caretDrawInfo = {
//     x: noteX,
//     yTop: staveInfo.topLineY,
//     yBottom: staveInfo.topLineY + staveInfo.spacing * 4,
//     width: vfNote.width,
//     ledgerYs
//   };

//     const {x,yTop, yBottom, width} = drawInfo
//     console.log("drawCaret", {svg, x, yTop, yBottom})
//     const caretLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
//     caretLine.setAttribute("x1", x);
//     caretLine.setAttribute("x2", x);
//     caretLine.setAttribute("y1", yTop);
//     caretLine.setAttribute("y2", yBottom);
//     caretLine.setAttribute("stroke", "#4a7aff");
//      caretLine.setAttribute("opacity", "0.3");
//     caretLine.setAttribute("stroke-width", width * 2);
//     caretLine.setAttribute("pointer-events", "none");
//     svg.appendChild(caretLine);




// const half = spacing / 2;

// // Convert cursor Y → VexFlow staff step index
// const vfSteps = (y - stave.getYForLine(-0.5)) / half;

// // --------------------------------------
// // Ledger lines using VexFlow geometry
// // --------------------------------------
// const lines = [];

// if (stave) {
//   const topY = stave.getYForLine(0);
//   const bottomY = stave.getYForLine(4);
//   const lineSpacing = stave.getSpacingBetweenLines() 
//   const half = lineSpacing/ 2;


   

// }





//   console.log(" cursor y:", y, "topLineY:", topLineY, "spacing:", spacing);

  return (
    <svg
   
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 9999,
          stroke: "#ffa600",
            fill: "#ffc800",
        opacity: 0.3
      }}
    >
     
      {caretRect}
{/* translate x so the mouse arrow cursor isn't covering the note cursor */}
      <g >
        <text fontFamily="Bravura" fontSize="32" dominantBaseline="middle" textAnchor="middle">
        
        </text>
      </g>
    </svg>
  );
}


