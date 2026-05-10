
import { forwardRef } from "react";
import MeasureRenderer from "./MeasureRenderer"
import "/node_modules/vexflow/releases/vexflow-debug.js";
import "./LeadSheetRenderer.css"
import { buildVexFlowNotes } from "./buildVexFlowNotes"


const LeadSheetAutoFlow = forwardRef((props, ref) => {
  const {
    leadSheet,
    measures,
    rowWidth,
    vfCacheRef,
   
    ...rest
  } = props;


 const VF = window.Vex.Flow;


function computeNaturalWidth(measure) {

    const vfNotes = buildVexFlowNotes(measure);

      const voice = new VF.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: VF.RESOLUTION
  });
  voice.setStrict(false);
  voice.addTickables(vfNotes);
  const formatter = new VF.Formatter();
  formatter.joinVoices([voice]);

  const raw = formatter.preCalculateMinTotalWidth([voice]);


    // content-based expansion
    // console.log(measure, raw)
// const complexity = measure.melody.length; // number of notes
// const expanded = raw * (1 + complexity * 0.15); // 15% per note
const density = measure.melody.length;
const expanded = raw + density * 30; // 20px per note

return expanded

//   const voice = new VF.Voice({
//     num_beats: 4,
//     beat_value: 4,
//     resolution: VF.RESOLUTION
//   });

//   voice.setStrict(false);
//   voice.addTickables(vfNotes);

//   const formatter = new VF.Formatter();
//   formatter.joinVoices([voice]);

//   return formatter.preCalculateMinTotalWidth([voice]);
}



function packRows(measures, ROW_WIDTH) {
  const rows = [];
  let rowMeasures = [];
  let width = 0;

  for (const m of measures) {
    if (width + m.naturalWidth > ROW_WIDTH && rowMeasures.length > 0) {
      rows.push({
        measures: rowMeasures,
        naturalRowWidth: width
      });
      rowMeasures = [];
      width = 0;
    }

    rowMeasures.push(m);
    width += m.naturalWidth;
  }

  if (rowMeasures.length) {
    rows.push({
      measures: rowMeasures,
      naturalRowWidth: width
    });
  }

  return rows;
}



function normalizeRows(rows, rowWidth) {
  for (const row of rows) {
    const natural = row.measures.reduce((sum, m) => sum + m.naturalWidth, 0);
    const scale = rowWidth / natural;

    // scale widths
    for (const m of row.measures) {
      m.finalWidth = Math.floor(m.naturalWidth * scale)
    }

    // fix floating-point gap
    const total = row.measures.reduce((sum, m) => sum + m.finalWidth, 0);
    const diff = rowWidth - total;
        //   console.log({total, diff, rowWidth})

    // distribute remainder to the last measure
    measures[measures.length-1].finalWidth += diff
 
    }
  }





const ROW_WIDTH = rowWidth;

// 1. compute natural widths
const MIN_MEASURE_WIDTH = 130; // try 120–160px
const FIRST_MEASURE_MIN_WIDTH = 280
let index = 0
for (const measure of leadSheet.measures) {
    const rawWidth = computeNaturalWidth(measure);
    const padded = rawWidth ; // 20px left + 20px right
  

    if( index === 0){  measure.naturalWidth = Math.max(rawWidth, FIRST_MEASURE_MIN_WIDTH);}
    else( measure.naturalWidth = Math.max(rawWidth, MIN_MEASURE_WIDTH))

    index++
}

// 2. pack rows
const rows = packRows(leadSheet.measures, ROW_WIDTH);
// console.log("packed rows", rows)
// 3. normalize rows → assigns measure.finalWidth
normalizeRows(rows, ROW_WIDTH);

// console.log("normalized rows", rows)

// console.log({rows})
// 4. render using finalWidth

// for( const row of rows) {
// console.log("measure widths: ",row.measures.map((obj)=>obj.finalWidth), "row width: ", ROW_WIDTH)

// }



return (
     <div
      ref={ref}                      // ⭐ THIS IS REQUIRED
      className="ls-container"
      style={rest.style}
    >
  <div className="lead-sheet-grid">

    {rows.map((row, rowIndex) => (
      <div key={rowIndex} className="row-of-measures">
        {row.measures.map((m, i) => (
          <MeasureRenderer
          {...props}
            key={m.id}
            measure={m}
            measureIndex={i}
            rowIndex={rowIndex}
            lsContainerRef={ref}
            width={m.finalWidth}   // ⭐ now defined
          />
        ))}
      </div>
    ))}
</div>
  </div>
);



})


export default   LeadSheetAutoFlow