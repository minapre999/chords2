import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";
import "./LeadSheetRenderer.css"



;
const LeadSheetRenderer = forwardRef(function LeadSheetRenderer({ leadSheet }, ref) {
  const containerRef = useRef(null);

  // Maps for visual highlighting
  const noteElements = useRef(new Map());
  const measureElements = useRef(new Map());
  const playheadRef = useRef(null);



  const measures = leadSheet?.measures ?? [];

  useImperativeHandle(ref, () => ({
   highlightNote(noteId) {
  // remove highlight from all notes
  noteElements.current.forEach(el => {
    el.classList.remove("vf-highlight-note");
  });

  const el = noteElements.current.get(noteId);
  console.log("HIGHLIGHT ELEMENT:", noteId, el);

  if (el) {
    el.classList.add("vf-highlight-note");
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
},


    highlightMeasure(measureId) {
      measureElements.current.forEach(el => el.classList.remove("vf-highlight-measure"));
      const el = measureElements.current.get(measureId);
      if (el) {
        el.classList.add("vf-highlight-measure");
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    },

    setPlayheadBeat(x, y1, y2) {
      if (!playheadRef.current) return;
      playheadRef.current.setAttribute("x1", x);
      playheadRef.current.setAttribute("x2", x);
      playheadRef.current.setAttribute("y1", y1);
      playheadRef.current.setAttribute("y2", y2);
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";
    noteElements.current.clear();
    measureElements.current.clear();

    const VF = window.Vex.Flow;

    const staveWidth = 350;
    const staveHeight = 120;
    const colsPerRow = 2;

    const rows = Math.ceil(measures.length / colsPerRow);
    const svgWidth = 900;
    const svgHeight = 40 + rows * staveHeight;

    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(svgWidth, svgHeight);

    const ctx = renderer.getContext();
    ctx.svg.style.width = `${svgWidth}px`;
    ctx.svg.style.height = `${svgHeight}px`;
    ctx.svg.style.display = "block";

    // --- PLAYHEAD LINE ---
    const playhead = document.createElementNS("http://www.w3.org/2000/svg", "line");
    playhead.setAttribute("stroke", "red");
    playhead.setAttribute("stroke-width", "2");
    ctx.svg.appendChild(playhead);
    playheadRef.current = playhead;

    function tokenToNote(entry) {
  const token = typeof entry === "string" ? entry : entry.token;
  const isRest = token.endsWith("r");

  if (isRest) {
    const note = new VF.StaveNote({
      keys: ["b/4"],
      duration: token,
      clef: "treble"
    });

    note.attrs.id = entry.id;   // ⭐ FIXED

    return note;
  }

  const pitch = token.slice(0, -1);
  const durationChar = token.slice(-1);

  const letter = pitch[0].toLowerCase();
  const accidental = pitch.length === 3 ? pitch[1] : "";
  const octave = String(Number(pitch[pitch.length - 1]) + 1);

  const key = `${letter}${accidental}/${octave}`;

  const note = new VF.StaveNote({
    keys: [key],
    duration: durationChar,
    clef: "treble"
  });

  note.attrs.id = entry.id;   // ⭐ FIXED

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

      const stave = new VF.Stave(x, y, staveWidth);

      if (i === 0) {
        stave.addClef("treble");
        stave.addTimeSignature("4/4");
        stave.addKeySignature("G");
      }

      // --- MEASURE GROUP ---
      const measureGroup = ctx.openGroup();
      stave.setContext(ctx).draw();
      ctx.closeGroup();
      measureElements.current.set(measure.id, measureGroup);

      // --- NOTES ---
      const notes = (measure.melody || []).map(n => {
        const vfNote = tokenToNote(n);
        return { vfNote, id: n.id };
      });

      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables(notes.map(n => n.vfNote));

      // new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
      const formatter = new VF.Formatter();
      formatter.joinVoices([voice]);
      formatter.formatToStave([voice], stave);   // ⭐ format only, no drawing

      // voice.draw(ctx, stave);

      // --- NOTE GROUPS ---
     // --- NOTE GROUPS (draw notes ONLY here) ---
      notes.forEach(n => {
        n.vfNote.setStave(stave);   // ⭐ REQUIRED: attach stave before drawing

        const g = ctx.openGroup();
        n.vfNote.setContext(ctx).draw();
        ctx.closeGroup();

        noteElements.current.set(n.id, g);
      });


      // --- CHORD SYMBOLS ---
      if (measure.chords && measure.chords.length > 0) {
        const left = stave.getNoteStartX();
        const right = stave.getX() + stave.getWidth() - 20;
        const beatSpacing = (right - left) / 4;

        measure.chords.forEach((symbol, b) => {
          const xPos = left + beatSpacing * b;
          ctx.save();
          ctx.setFont("Arial", 14, "");
          ctx.fillText(symbol, xPos, y - 10);
          ctx.restore();
        });
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
        ref={containerRef}
        style={{
          width: "900px",
          minHeight: "600px",
        }}
      />
    </div>
  );
});

export default LeadSheetRenderer;
