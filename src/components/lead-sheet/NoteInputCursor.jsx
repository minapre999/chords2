
import "./NoteInputCursor.css"


/*
updated to rely solely on geometry, not pitch / midi etc
the conversion from geometry to pitch happens on the mousedown when note is actually entered
*/


export default function NoteInputCursor({
  visible,
  pos,
  duration,
  topLineY,
  spacing,
  stave,
  lsContainerRef
}) {
  function durationToGlyph(dur) {
    const SMUFL = {
      s: "\uECA9", // 16th
      e: "\uECA7", // 8th
      q: "\uECA5", // quarter
      h: "\uECA3", // half
      w: "\uECA2"  // whole
    };
    return SMUFL[dur];
  }

if (!visible || !pos || topLineY == null || !spacing || !stave) {
  return null;
}

console.log()

/*
pox.y is 70 when hovering over top line, but 135 when hovering over bottom line.  It should be 120.
pos={cursorPos} and the only place setCursorPos is called is in onMouseMove in the renderer.

*/


// console.log(
//   "VF STAFF LINES",

//   stave.getYForLine(-1),  // 70
//   stave.getYForLine(-0.5), //75!!
//   stave.getYForLine(0),  // top staff line (F5) ROW 1: 80, 120 ROW2: 200, 240, etc
//   stave.getYForLine(4),  // first ledger line below (C4)
//   stave.getSpacingBetweenLines()  // 10
// );


// console.log("CHECK", {
//   midi: pos.midi,
//   lineIndex: (76 - pos.midi) / 2 - 0.5,
//   y: stave.getYForLine((76 - pos.midi) / 2 - 0.5)}
// );




  const { x, y } = pos;
// console.log({x,y})



// console.log("CURSOR FINAL Y", {
//   midi: pos.midi,
//   usedY: y,
//   vf0: stave.getYForLine(0),
//   vf4: stave.getYForLine(4),
//   vf5: stave.getYForLine(5)
// });




  // --------------------------------------
  // Compute ledger lines
  // --------------------------------------
 // --------------------------------------
// Compute steps using VexFlow geometry
// --------------------------------------

const half = spacing / 2;

// Convert cursor Y → VexFlow staff step index
const vfSteps = (y - stave.getYForLine(-0.5)) / half;

// --------------------------------------
// Ledger lines using VexFlow geometry
// --------------------------------------
const lines = [];

if (stave) {
  const topY = stave.getYForLine(0);
  const bottomY = stave.getYForLine(4);
  const lineSpacing = stave.getSpacingBetweenLines() 
  const half = lineSpacing/ 2;

  // ABOVE STAFF

let ly = topY - spacing
let lineIndex=0 
// console.log({y, ly, topY, bottomY, lineSpacing})
if (y < topY ) {
    while( ly > y) {
        // console.log("ly: ", ly)
        lines.push(<line class="leger-line" key={`la-${lineIndex}`} x1={x-24} x2={x+2} y1={ly} y2={ly} strokeWidth="1.5"/>);
        ly-=spacing // going up so negative
        lineIndex++
    }
}
   
  // BELOW STAFF
  ly = bottomY
  lineIndex=0 
  if (y > ly ) {
         
    while( ly < y) {
        // console.log("ly: ", ly)
        lines.push(<line class="leger-line"  key={`la-${lineIndex}`} x1={x-24} x2={x+2} y1={ly+spacing} y2={ly+spacing} strokeWidth="1.5"/>);
        ly+=spacing // going down so positive
        lineIndex++
    }

        // lines.push(<line key={`la-${lineIndex}`} x1={x-12} x2={x+12} y1={120} y2={120} stroke="red" strokeWidth="3"/>);

  }
}





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
          stroke: "#00aaff",
            fill: "#00aaff",

      }}
    >
      {/* ⭐ Ledger lines MUST be outside <text> */}
      {lines}
{/* translate x so the mouse arrow cursor isn't covering the note cursor */}
      <g transform={`translate(${x-12}, ${y})`} opacity={visible ? 1 : 0}>
        <text fontFamily="Bravura" fontSize="32" dominantBaseline="middle" textAnchor="middle">
          {durationToGlyph(duration)}
        </text>
      </g>
    </svg>
  );
}

