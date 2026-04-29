import { useEffect, useRef } from "react";
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
  s: "\uE1DB", // 16th note
  e: "\uE1D9", // 8th note
  q: "\uE1D5", // quarter note
  h: "\uE1D3", // half note
  w: "\uE1D2"  // whole note
};


function DurationButton({ dur, onClick }) {
  return (
    <button
      className="btn-duration"
      onClick={onClick}
      style={{
       
      

      }}
    >
      {SMUFL[dur]}
    </button>
  );
}


const DURATIONS = ["s", "e", "q", "h", "w"];

export default function DurationControls({
  setInputDuration,
  handleToolbarDurationChange
}) {
  return (
    <div style={{ display: "flex", padding: "8px" }}>
      {DURATIONS.map(d => (
        <DurationButton
          key={d}
          dur={d}
          onClick={() => {
            setInputDuration(d);
            handleToolbarDurationChange(d);
          }}
        />
      ))}
    </div>
  );
}


