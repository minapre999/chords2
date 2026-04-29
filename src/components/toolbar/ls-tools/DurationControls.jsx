import { useEffect, useRef } from "react";
import "/src/components/toolbar/toolbar.css"
import "./DurationControls.css"
// const SMUFL = {
//   s: "\uE1D7\uE240", // notehead + double-flag
//   e: "\uE1D7\uE241", // notehead + flag
//   q: "\uE1D7",       // notehead only (quarter stem drawn by font)
//   h: "\uE1D5",       // half notehead
//   w: "\uE1D2"        // whole notehead
// };

// const SMUFL = {
//   s: "\uE0A3", // 16th note
//   e: "\uE0A2", // 8th note
//   q: "\uE0A1", // quarter note
//   h: "\uE0A0", // half note
//   w: "\uE0A4"  // whole note
// };

const SMUFL = {
  
  s: "\uECA9", // 16th note
  e: "\uECA7", // 8th note
  q: "\uECA5", // quarter note
  h: "\uECA3", // half note
  w: "\uECA2"  // whole note
};


function DurationButton({ newDur, onClick, inputDuration }) {
  return (
    <button
      className={`btn-bravura btn-duration${inputDuration === newDur? " selected" : ""}`}
      onClick={onClick}
         >
      {SMUFL[newDur]}
    </button>
  );
}


const DURATIONS = ["s", "e", "q", "h", "w"];

export default function DurationControls(props) {

 const  {
  handleToolbarDurationChange,
  setInputDuration,
} = props


  return (
    <div style={{ display: "flex", padding: "8px" }}>
      {DURATIONS.map(d => (
        <DurationButton
         {...props}
          key={d}
          newDur={d}

          onClick={() => {
            setInputDuration(d);
            handleToolbarDurationChange(d);
          }}
        />
      ))}
    </div>
  );
}


