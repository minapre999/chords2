

import "./NoteInputCaret.css"


export default function NoteInputCaret({
  vfCacheRef,
  caret,
  leadSheet,
  // lastMeasureLayoutRef,
}) {

//    if (!visible) return null;

if(!caret || !vfCacheRef) return null
 if( vfCacheRef.current.size == 0) return null
if(caret.measure === undefined) {
    // console.log("caret.measure is undefined")
        return null}
// if (!visible || !pos || topLineY == null || !spacing || !stave) {
//   return null;
// }

// caret.mesure is an INDEX
if( leadSheet.measures.length <= caret.measure) return null;
// console.log("leadSheet.measures", leadSheet.measures, {caret})

 const measure = leadSheet.measures[caret.measure]
 
// console.log({measure, vfCacheRef})
const measureNotes = vfCacheRef?.current?.get(measure.id)
console.log("measure notes: ", measureNotes)
const vfNote = measureNotes.vfNotes[caret.index]

// console.log("vfCacheRef?.current", vfCacheRef.current, {vfNote,measure, measureNotes},  )
const bb = vfNote.getBoundingBox();
const x= bb.getX()
const width= bb.getW()
let height = bb.getH()
let y= bb.getY()

// if(lastMeasureLayoutRef.current.length > caret.measure) {
//  const layout = lastMeasureLayoutRef.current[caret.measure]
//  y = layout.topLineY
// height =layout.spacing*4
// }

const caretRect = <rect className="caret-rect" x={x} y={y} width={width} height={height} strokeWidth="1.5"/>
// console.log({x,  y, width, height, caretRect, measure, lastMeasureLayoutRef})


  
  // --------------------------------------
  // Compute caret rectangle 
  // --------------------------------------


    // console.log({caret})
 

  return (
    <svg
   
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 9999,
          stroke: "#4a7aff",
            fill: "#4a7aff",

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


