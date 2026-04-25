import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";
import RenderData, {RenderNote} from "/src/render-notes.js"
import Note from "/src/harmony/note.js"
import "./LeadSheetRenderer.css"
import { isNumber } from "tone";

const durationMap = {
  "s": "16",
  "e": "8",
  "q": "4",
  "h": "2",
  "w": "1"
};


function pitchToVexFlowKey(pitch) {
  // pitch is like "C4", "Eb4", "F#3"
  const match = pitch.match(/^([A-Ga-g])(b|#)?(\d)$/);
  if (!match) throw new Error("Invalid pitch: " + pitch);

  let [, letter, accidental, octave] = match;

  letter = letter.toLowerCase(); // VexFlow requires lowercase note names

  if (!accidental) accidental = "";

  return `${letter}${accidental}/${octave}`;
}



function tokenToVFNote(n) {
    const VF = window.Vex.Flow;

  const token = n.token;

  if (token.endsWith("r")) {
    // rest
    const dur = token.slice(0, -1); // e.g. "q"
    return new VF.StaveNote({ keys: ["b/4"], duration: durationMap[dur] + "r" });
  }

  const pitch = token.slice(0, -1); // C4
  const dur = token.slice(-1);      // q, e, s, h, w

  const vfDur = durationMap[dur];   // convert to VexFlow duration

  return new VF.StaveNote({
    keys: [pitchToVexFlowKey(pitch)], // e.g. "c/4"
    duration: vfDur
  });
}



export default function LeadSheetRenderer(props) {
  const {
    leadSheet,
    ref,
    renderDataUI, setRenderDataUI,
    selectedNoteId,
    onNoteSelect,
    onNoteDragStart,
    dragPreview,
    dragRef,
    ...rest
  } = props;

  const lsContainerRef = useRef(null);

  const noteElements = useRef(new Map());
  const measureElements = useRef(new Map());
  const playheadRef = useRef(null);

  // ⭐ Local drag freeze flag
  const isDragging = useRef(false);

  const measures = leadSheet?.measures ?? [];
// ⭐ Add these two refs at the top of your component
const originalYRef = useRef({});
const semitoneStepRef = useRef(3); // default ~3px per semitone until stave is built

  // -----------------------------
  // Imperative API
  // -----------------------------
  useImperativeHandle(ref, () => ({
    highlightNote(noteId) {
      noteElements.current.forEach(el => el.classList.remove("vf-highlight-note"));
      const el = noteElements.current.get(noteId);
      if (!el) return;

      el.classList.add("vf-highlight-note");

      // scroll into view
      const container = lsContainerRef.current;
      if (container) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = rect.top - containerRect.top - containerRect.height / 2;

        container.scrollBy({ top: offset, behavior: "smooth" });
      }
    },

    highlightMeasure(measureId) {
      measureElements.current.forEach(el => el.classList.remove("vf-highlight-measure"));
      const el = measureElements.current.get(measureId);
      if (!el) return;

      el.classList.add("vf-highlight-measure");

      const container = lsContainerRef.current;
      if (container) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = rect.top - containerRect.top - containerRect.height / 2;

        container.scrollBy({ top: offset, behavior: "smooth" });
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

  // -----------------------------
  // ⭐ Freeze redraw during drag
  // -----------------------------
  useEffect(() => {
  if (dragRef.current) return;
  if (!lsContainerRef.current) return;

  lsContainerRef.current.innerHTML = "";
  noteElements.current.clear();
  measureElements.current.clear();
  originalYRef.current = {}; // ⭐ store each note’s SVG Y anchor

  const VF = window.Vex.Flow;

  const staveWidth = 350;
  const staveHeight = 120;
  const colsPerRow = 2;

  const rows = Math.ceil(measures.length / colsPerRow);
  const svgWidth = 900;
  const svgHeight = 40 + rows * staveHeight;

  const renderer = new VF.Renderer(lsContainerRef.current, VF.Renderer.Backends.SVG);
  renderer.resize(svgWidth, svgHeight);

  const ctx = renderer.getContext();
  const svg = ctx.svg;

  svg.style.width = `${svgWidth}px`;
  svg.style.height = `${svgHeight}px`;
  svg.style.display = "block";

  // Playhead
  const playhead = document.createElementNS("http://www.w3.org/2000/svg", "line");
  playhead.setAttribute("stroke", "red");
  playhead.setAttribute("stroke-width", "2");
  svg.appendChild(playhead);
  playheadRef.current = playhead;

  // -----------------------------
  // Render measures + notes
  // -----------------------------
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

    const measureGroup = ctx.openGroup();
    stave.setContext(ctx).draw();
    ctx.closeGroup();
    measureElements.current.set(measure.id, measureGroup);

    // ⭐ Compute correct semitone step for this stave
    const lineSpacing = stave.getSpacingBetweenLines(); // ~10px
    const semitoneStep = (lineSpacing / 2) * (7 / 12);  // ~2.916px
    semitoneStepRef.current = semitoneStep;

    const notes = (measure.melody || []).map(n => ({
      vfNote: tokenToVFNote(n),
      id: n.id
    }));

    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(notes.map(n => n.vfNote));

    const formatter = new VF.Formatter();
    formatter.joinVoices([voice]);
    formatter.formatToStave([voice], stave);

    // -----------------------------
    // Draw notes + hit areas
    // -----------------------------
    notes.forEach(n => {
      n.vfNote.setStave(stave);

      // Draw note
      const g = ctx.openGroup();
      n.vfNote.setContext(ctx).draw();
      ctx.closeGroup();

      // ⭐ Capture original SVG Y anchor (center of notehead)
      const bbox = n.vfNote.getBoundingBox();
      if (bbox) {
        const centerY = bbox.getY() + bbox.getH() / 2;
        originalYRef.current[n.id] = centerY;
      }

      // Hit area
      const hitGroup = ctx.openGroup();
      if (bbox) {
        const padding = 6;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", bbox.getX() - padding);
        rect.setAttribute("y", bbox.getY() - padding);
        rect.setAttribute("width", bbox.getW() + padding * 2);
        rect.setAttribute("height", bbox.getH() + padding * 2);
        rect.setAttribute("fill", "transparent");
        rect.setAttribute("pointer-events", "all");
        hitGroup.appendChild(rect);
      }
      ctx.closeGroup();

      if (selectedNoteId === n.id) {
        g.classList.add("selected-note");
      }

      hitGroup.style.cursor = "pointer";

      // ⭐ Correct screen → parent drag start
      hitGroup.addEventListener("mousedown", (e) => {
        e.preventDefault();
        onNoteSelect?.(n.id);
        onNoteDragStart(n.id, e.clientX, e.clientY, g);
      });

      noteElements.current.set(n.id, g);
    });

    // Chords
    if (measure.chords?.length) {
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
}, [measures, selectedNoteId]);

  // -----------------------------
  // ⭐ Preview transform effect
  // -----------------------------
  useEffect(() => {
    if (!dragRef.current) {
      noteElements.current.forEach(g => g.removeAttribute("transform"));
      return;
    }

    if (!dragPreview) {
      isDragging.current = false;   // <--- drag ended
      return;
    }

    const { noteId, semitones, durationSteps } = dragPreview;
    const g = noteElements.current.get(noteId);
    if (!g) return;

    /*VexFlow’s default staff has 10px between lines, so:

    1 line step = 10px

    1 diatonic step (line→space or space→line) = 5px

    1 semitone ≈ 5px if you want chromatic snapping (lines and spaces)
    */
    const dy = semitones * -5;
    const dx = durationSteps * 30;

    g.setAttribute("transform", `translate(${dx}, ${dy})`);
  }, [dragPreview]);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <div
        className="ls-container"
        ref={lsContainerRef}
        style={{ width: "900px", minHeight: "600px" }}
      />
    </div>
  );
}

