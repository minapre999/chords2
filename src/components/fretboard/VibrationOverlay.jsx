export default function VibrationOverlay({
  vibratingString,
  width,
  height,
  stringY,
  getStringWidth,
  getVibrationAmplitude
}) {
  if (vibratingString === null) return null;

  const y = stringY(vibratingString);
  const amp = getVibrationAmplitude(vibratingString);

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 10,
      }}
    >
      <g>
        <line
          x1="0"
          y1={y}
          x2={width}
          y2={y}
          stroke="#ffffff88"
          strokeWidth={getStringWidth(vibratingString)}
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`
              0 0;
              0 -${amp};
              0 ${amp};
              0 -${amp * 0.6};
              0 ${amp * 0.6};
              0 -${amp * 0.3};
              0 ${amp * 0.3};
              0 0
            `}
            dur="0.35s"
            repeatCount="1"
          />
        </line>
      </g>
    </svg>
  );
}
