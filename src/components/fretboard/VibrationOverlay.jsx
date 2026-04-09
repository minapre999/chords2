import { useLayoutEffect, useRef } from "react";

export default function VibrationOverlay({
  vibratingString,
  vibeTick,
  width,
  stringY,
  getStringWidth,
  onDone
}) {
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    if (vibratingString == null || !lineRef.current) return;

    const start = performance.now();
    const duration = 300;
    const ampByString = [8, 7, 6, 5, 4, 3];
    const amp = ampByString[vibratingString] ?? 4;

    let raf;

    const animate = (t) => {
      const p = (t - start) / duration;
      if (p >= 1) {
        lineRef.current.setAttribute("y1", y);
        lineRef.current.setAttribute("y2", y);
          onDone?.();   // 🔥 remove overlay

        return;
      }
   


      const decay = 1 - p;
      const offset = Math.sin(p * Math.PI * 6) * amp * decay;

      lineRef.current.setAttribute("y1", y + offset);
      lineRef.current.setAttribute("y2", y + offset);

      raf = requestAnimationFrame(animate);
    };

    const y = stringY(vibratingString);
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [vibratingString, vibeTick]);

  if (vibratingString == null) return null;

  const y = stringY(vibratingString);

  return (
    <g pointerEvents="none">
      <line
        ref={lineRef}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#ffffffaa"
        strokeWidth={getStringWidth(vibratingString)}
        strokeLinecap="round"
      />
    </g>
  );
}
