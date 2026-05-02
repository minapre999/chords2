
import "./NoteInputCursor.css"

export default function NoteInputCursor({
  visible,
  pos,
  duration,
  topY,
  spacing,
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

  if (!visible || !pos || !topY || !spacing) return null;

  const { x, y } = pos;

  // --------------------------------------
  // Compute ledger lines
  // --------------------------------------
  const halfSpacing = spacing / 2;
  const dy = y - topY; // positive = below staff
  const steps = Math.round(dy / halfSpacing);

  const lines = [];

  // ABOVE STAFF
  if (steps < 0) {
    const count = Math.floor(Math.abs(steps) / 2);
    for (let i = 1; i <= count; i++) {
      const ly = topY - i * spacing;
      lines.push(
        <line
          key={`ledger-above-${i}`}
          x1={x - 12}
          x2={x + 12}
          y1={ly}
          y2={ly}
          stroke="black"
          strokeWidth="1.5"
        />
      );
    }
  }

  // BELOW STAFF
  if (steps > 8) {
    const count = Math.floor((steps - 8) / 2);
    for (let i = 1; i <= count; i++) {
      const ly = topY + 4 * spacing + i * spacing;
      lines.push(
        <line
          key={`ledger-below-${i}`}
          x1={x - 12}
          x2={x + 12}
          y1={ly}
          y2={ly}
          stroke="black"
          strokeWidth="1.5"
        />
      );
    }
  }

//   console.log(" cursor y:", y, "topY:", topY, "spacing:", spacing);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 9999
      }}
    >
      {/* ⭐ Ledger lines MUST be outside <text> */}
      {lines}

      <g transform={`translate(${x}, ${y})`} opacity={visible ? 1 : 0}>
        <text fontFamily="Bravura" fontSize="32" y="10">
          {durationToGlyph(duration)}
        </text>
      </g>
    </svg>
  );
}

