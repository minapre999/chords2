import TuningManager  from "/src/harmony/tuning-manager";
import "/src/globals.js"

export default function VibrationOverlay({
  vibratingString,
  width,
  height,
  stringY,
  getStringWidth,
  
}) {
  if (vibratingString === null) return null;

  const y = stringY(vibratingString);
  
  const getVibrationAmplitude = (stringIndex) => {
    const amplitudes = [6, 5, 4, 3, 2, 1];
    return amplitudes[stringIndex] ?? 2;
  };

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
          strokeWidth={dc.TUNING_MANAGER.getStringWidth(vibratingString)}
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
