export default function FretboardSurface({
  scaledWidth,
  scaledHeight,
  numFrets,
  nutX,
  getFretX,
  showInlaysUI,
  zoom
}) {

    const inlayFrets = [3, 5, 7, 9, 12, 15, 17, 19];
    const nutWidth = 16 * zoom
    const fretWidth = 12 * zoom
    const inlayRadius = 6*zoom
  return (
    <g>
      {/* Rosewood background */}
      <defs>
        <pattern
          id="rosewoodPattern"
          patternUnits="userSpaceOnUse"
          width="75"
          height="192"
        >
          <image
            href="/images/rosewood5.png"
            width="75"
            height="192"
            preserveAspectRatio="none"
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width={scaledWidth}
        height={scaledHeight}
        fill="url(#rosewoodPattern)"
      />

      {/* Nut */}
      <rect
        x={nutX-nutWidth}
        y={0}
        width={nutWidth}
        height={scaledHeight}
        fill="#f0f0f0"
        stroke="#999"
        strokeWidth="1.5"
      />

      {/* Frets */}
      {Array.from({ length: numFrets }).map((_, i) => {
        const x = getFretX(i + 1);
        return (
          <line
            key={i}
            x1={x}
            y1={0}
            x2={x}
            y2={scaledHeight}
            stroke="#cfcfcf"
            strokeWidth={fretWidth}
          />
        );
      })}

      {/* Inlays */}
      {showInlaysUI &&
        inlayFrets.map((fret) => {
          if (fret > numFrets) return null;

          const isDouble = fret === 12;
          const x = (getFretX(fret) + getFretX(fret - 1)) / 2;
          // const r = 6;

          if (isDouble) {
            return (
              <g key={fret}>
                <circle cx={x} cy={scaledHeight * 0.35} r={inlayRadius} fill="#f5f5f5" stroke="#999" />
                <circle cx={x} cy={scaledHeight * 0.65} r={inlayRadius} fill="#f5f5f5" stroke="#999" />
              </g>
            );
          }

          return (
            <circle
              key={fret}
              cx={x}
              cy={scaledHeight / 2}
              r={inlayRadius}
              fill="#f5f5f5"
              stroke="#999"
            />
          );
        })}
    </g>
  );
}
