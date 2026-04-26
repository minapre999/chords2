import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import "/node_modules/vexflow/releases/vexflow-debug.js";
import RenderData, {RenderNote} from "/src/render-notes.js"
import Note from "/src/harmony/note.js"
import "./LeadSheetRenderer.css"
import { isNumber } from "tone";



function debug(label, value) {
  console.log(`DEBUG ${label}:`, value);
  if (value === "4/q" || value === "4q" || value === "r") {
    console.trace("STACK TRACE FOR BAD VALUE");
  }
}



const durationMap = {
  "s": "16",
  "e": "8",
  "q": "4",
  "h": "2",
  "w": "1"
};


function pitchToVexFlowKey(pitch) {
  // pitch formats supported:
  // C4, F#3, Bb5

  const letter = pitch[0].toLowerCase();

  let accidental = "";
  let octave = "";

  if (pitch[1] === "#" || pitch[1] === "b") {
    accidental = pitch[1];
    octave = pitch[2];
  } else {
    octave = pitch[1];
  }

  return `${letter}${accidental}/${octave}`;
}


// function pitchToVexFlowKey(pitch) {
//   // pitch is like "C4", "Eb4", "F#3"
//   const match = pitch.match(/^([A-Ga-g])(b|#)?(\d)$/);
//   if (!match) throw new Error("Invalid pitch: " + pitch);

//   let [, letter, accidental, octave] = match;

//   letter = letter.toLowerCase(); // VexFlow requires lowercase note names

//   if (!accidental) accidental = "";

//   return `${letter}${accidental}/${octave}`;
// }
function tokenToVFNote(n) {
  const VF = window.Vex.Flow;
  const raw = typeof n === "string" ? n : n.token;
  const token = raw.trim();

  // REST
  if (token.endsWith("r")) {
    const pitch = token.slice(0, -1); // e.g. "C4"
    const dur = token.slice(-1);      // "r"
    const durationChar = pitch.slice(-1); // last char before r is duration
    return new VF.StaveNote({
      keys: ["b/4"],
      duration: durationMap[durationChar] + "r"
    });
  }

  // NORMAL NOTE
  // Format: C4q → pitch="C4", dur="q"
  const pitch = token.slice(0, -1);
  const dur = token.slice(-1);

  const vfKey = pitchToVexFlowKey(pitch);
  const note = new VF.StaveNote({
    keys: [vfKey],
    duration: durationMap[dur]
  });

  // Extract accidental
  const accidental = pitch[1] === "#" ? "#" :
                     pitch[1] === "b" ? "b" : null;

  if (accidental) {
    note.addAccidental(0, new VF.Accidental(accidental));
  }

  return note;
}






const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function semitoneToPitch(baseMidi, offset) {
  const midi = baseMidi + offset;
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${PITCH_CLASSES[pc]}${octave}`; // e.g. "C4"
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
    caret,
    noteInputMode,
    onNoteInput,
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


function drawCaret(svg, x, yTop, yBottom) {
      const caret = document.createElementNS("http://www.w3.org/2000/svg", "line");
      caret.setAttribute("x1", x);
      caret.setAttribute("x2", x);
      caret.setAttribute("y1", yTop);
      caret.setAttribute("y2", yBottom);
      caret.setAttribute("stroke", "#4a7aff");
      caret.setAttribute("stroke-width", "2");
      caret.setAttribute("pointer-events", "none");
      svg.appendChild(caret);
    }


const pitchFromY = (clientY) => {
  const svg = lsContainerRef.current?.querySelector("svg");
  if (!svg) return "C4";

  const bbox = svg.getBoundingClientRect();
  const localY = clientY - bbox.top;

  const semitoneStep = semitoneStepRef.current || 3;

  // Reference: middle line of treble staff = B4 (MIDI 71)
  const baseMidi = 71;

  // Compute middle line Y
  const lineSpacing = semitoneStep * (12 / 7) * 2;
  const middleLineY = 40 + 2 * lineSpacing;

  const dy = localY - middleLineY;
  const semitoneOffset = Math.round(-dy / semitoneStep);

  const midi = baseMidi + semitoneOffset;
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  return `${PITCH_CLASSES[pc]}${octave}`;
};


const computeBeatFromX = (clientX) => {
  if (!lsContainerRef.current) return 0;

  const svg = lsContainerRef.current.querySelector("svg");
  if (!svg) return 0;

  const bbox = svg.getBoundingClientRect();
  const localX = clientX - bbox.left;

  // We’ll reconstruct the same layout logic you use in the effect
  const staveWidth = 350;
  const colsPerRow = 2;

  // Find which measure column this X falls into
  const col = Math.floor((localX - 20) / staveWidth);
  const clampedCol = Math.max(0, Math.min(colsPerRow - 1, col));

  const measureX = 20 + clampedCol * staveWidth;

  // Approximate beat region inside the stave
  const VF = window.Vex.Flow;
  const tempStave = new VF.Stave(measureX, 0, staveWidth);
  const left = tempStave.getNoteStartX();
  const right = tempStave.getX() + tempStave.getWidth() - 20;
  const beatSpacing = (right - left) / 4; // 4 beats

  const dx = localX - left;
  const beatIndex = Math.round(dx / beatSpacing);

  return Math.max(0, Math.min(3, beatIndex)); // clamp 0–3
};




  // -----------------------------
  // ⭐ Freeze redraw during drag
  // -----------------------------
  useEffect(() => {
  if (dragRef.current) return;
  if (!lsContainerRef.current) return;

  lsContainerRef.current.innerHTML = "";
  noteElements.current.clear();
  measureElements.current.clear();
  originalYRef.current = {};

  const VF = window.Vex.Flow;

  const staveWidth = 350;
  const staveHeight = 120;
  const colsPerRow = 2;

  const rows = Math.ceil(measures.length / colsPerRow);
  const svgWidth = 900;
  const svgHeight = 40 + rows * staveHeight;

  const renderer = new VF.Renderer(
    lsContainerRef.current,
    VF.Renderer.Backends.SVG
  );
  renderer.resize(svgWidth, svgHeight);

  const ctx = renderer.getContext();

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

    const lineSpacing = stave.getSpacingBetweenLines();
    const semitoneStep = (lineSpacing / 2) * (7 / 12);
    semitoneStepRef.current = semitoneStep;

  const notes = (measure.melody || []).map((n, idx) => {
  console.log("---- NOTES() DEBUG ----");
  console.log(`index: ${idx}`);
  console.log("raw n:", n);
  console.log("typeof n:", typeof n);

  if (typeof n === "string") {
    console.log("STRING TOKEN DETECTED:", JSON.stringify(n));
    console.log("STRING CHAR CODES:", [...n].map(c => c.charCodeAt(0)));
    console.trace("STRING ENTERED notes() — THIS CAUSES 4/q");
  }

  if (typeof n === "object") {
    console.log("OBJECT TOKEN DETECTED:", JSON.stringify(n));
    if (!n.token) {
      console.log("🔥 OBJECT MISSING .token — THIS WILL BREAK");
      console.trace("BROKEN OBJECT ENTERED notes()");
    }
  }

  // Normalize the token so tokenToVFNote always receives { token }
  const token = typeof n === "string" ? n : n.token;
  const id = typeof n === "string" ? null : n.id;

  console.log("NORMALIZED TOKEN:", token);

  const vfNote = tokenToVFNote({ token });

  return { vfNote, id };
});



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

      const g = ctx.openGroup();
      n.vfNote.setContext(ctx).draw();
      ctx.closeGroup();

      const ys = n.vfNote.getYs();
      if (ys && ys.length > 0) {
        originalYRef.current[n.id] = ys[0];
      }

      const hitGroup = ctx.openGroup();
      const bbox = n.vfNote.getBoundingBox();
      if (bbox) {
        const padding = 6;
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
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

      hitGroup.addEventListener("mousedown", e => {
        e.preventDefault();

        // NOTE INPUT MODE
        if (noteInputMode) {
          const pitch = pitchFromY(e.clientY);
            console.log("pitchFromY →", pitchFromY(e.clientY));

          const beatIndex = computeBeatFromX(e.clientX);
          onNoteInput(pitch, i, beatIndex);
          return;
        }

        // NORMAL MODE (drag or select)
        const startX = e.clientX;
        const startY = e.clientY;
        let moved = false;

        const onMove = ev => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;

          if (!moved && Math.hypot(dx, dy) > 3) {
            moved = true;
            isDragging.current = true;
            onNoteSelect?.(n.id);
            onNoteDragStart(n.id, startX, startY, g);
          }

          if (moved) {
            // drag logic continues
          }
        };

        const onUp = () => {
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);

          if (!moved) {
            onNoteSelect?.(n.id);
          }
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
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

    // CARET for this measure (we'll compute X later)
  });

  // -----------------------------
  // After VexFlow is done: get FINAL SVG and draw playhead + caret
  // -----------------------------
  const svg = lsContainerRef.current.querySelector("svg");
  if (!svg) return;

  svg.style.width = `${svgWidth}px`;
  svg.style.height = `${svgHeight}px`;
  svg.style.display = "block";

  const playhead = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  playhead.setAttribute("stroke", "red");
  playhead.setAttribute("stroke-width", "2");
  svg.appendChild(playhead);
  playheadRef.current = playhead;

  // CARET (simple 4-beat grid based on current caret.measure/index)
  if (caret) {
    const measureIndex = caret.measure;
    const row = Math.floor(measureIndex / colsPerRow);
    const col = measureIndex % colsPerRow;
    const x = 20 + col * staveWidth;
    const y = 40 + row * staveHeight;

    const stave = new VF.Stave(x, y, staveWidth);
    const left = stave.getNoteStartX();
    const right = stave.getX() + stave.getWidth() - 20;
    const beatSpacing = (right - left) / 4;
    const caretX = left + caret.index * beatSpacing;

    drawCaret(svg, caretX, y - 5, y + staveHeight - 5);
  }
}, [measures, selectedNoteId, noteInputMode, caret]);


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

