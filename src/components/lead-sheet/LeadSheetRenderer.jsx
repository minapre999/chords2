import { useEffect, useRef } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";

export default function LeadSheetRenderer({ leadSheet }) {
  const measures = leadSheet?.measures ?? [];
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = "";

    const VF = window.Vex.Flow;

    const staveWidth = 350;
    const staveHeight = 120;
    const colsPerRow = 2;

    // 🔹 how many rows of staves?
    const rows = Math.ceil(measures.length / colsPerRow);

    // 🔹 SVG height based on content
    const svgWidth = 900;
    const svgHeight = 40 + rows * staveHeight;

    const renderer = new VF.Renderer(ref.current, VF.Renderer.Backends.SVG);
    renderer.resize(svgWidth, svgHeight);
    const ctx = renderer.getContext();

    ctx.svg.style.width = `${svgWidth}px`;
    ctx.svg.style.height = `${svgHeight}px`;
    ctx.svg.style.display = "block";

    function tokenToNote(token) {
       const isRest = token.endsWith("r");
      const duration = isRest ? token : token.slice(-1);

      if (isRest) {
        return new VF.StaveNote({
          keys: ["b/4"],   // VexFlow requires a key, but it is ignored for rests
          duration: duration, // e.g. "qr", "8r"
          clef: "treble"
        });
      }


      const pitch = token.slice(0, -1);
      const durationChar = token.slice(-1);

      const letter = pitch[0].toLowerCase();
      const accidental = pitch.length === 3 ? pitch[1] : "";

      const octave = String(Number(pitch[pitch.length - 1]) + 1);
      const key = `${letter}${accidental}/${octave}`;

      const durationMap = {
        w: "w",
        h: "h",
        q: "q",
        "8": "8",
        "16": "16"
      };

      const note = new VF.StaveNote({
        keys: [key],
        duration: durationMap[durationChar] || "q",
        clef: "treble"
      });

      if (accidental) {
        note.addAccidental(0, new VF.Accidental(accidental));
      }

      return note;
    }

    measures.forEach((measure, i) => {
      const row = Math.floor(i / colsPerRow);
      const col = i % colsPerRow;

      const x = 20 + col * staveWidth;
      const y = 40 + row * staveHeight;

      const notes = (measure.melody || []).map(tokenToNote);

      const voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4
      }).addTickables(notes);

      const stave = new VF.Stave(x, y, staveWidth);

      if (i === 0) {
        stave.addClef("treble");
        stave.addTimeSignature("4/4");
        stave.addKeySignature("G");
      }

      stave.setContext(ctx).draw();

      new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
      voice.draw(ctx, stave);

      if (measure.chords && measure.chords.length > 0) {
        const beatCount = Math.min(measure.chords.length, 4);

        const left = stave.getNoteStartX();
        const right = stave.getX() + stave.getWidth() - 20;
        const beatSpacing = (right - left) / 4;

        for (let b = 0; b < beatCount; b++) {
          const xPos = left + beatSpacing * b;

          ctx.save();
          ctx.setFont("Arial", 14, "");
          ctx.fillText(measure.chords[b], xPos, y - 10);
          ctx.restore();
        }
      }
    });
  }, [measures]);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        id="vf-container"
        ref={ref}
        style={{
          width: "900px",
          minHeight: "600px",
        }}
      />
    </div>
  );
}
