import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef,   useLayoutEffect, } from "react";
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



function getAccidentalFromToken(token) {
  const match = token.match(/^([A-Ga-g])([#b]{1,2}|)(\d)/);
  if (!match) return null;

  const [, , accidental] = match;
  if (accidental === "") return null;

  return accidental; // "#", "b", "##", "bb"
}



function parseToken(token) {
  // console.log("PARSE TOKEN", "\n token: ", token)
  // Handles: C4q, C#4q, Eb4h, F##4q, etc.
  const match = token.match(/^([A-Ga-g])([#b]{0,2})(\d)(.+)$/);
  if (!match) {
    console.warn("parseToken: unexpected token:", token);
    return null;
  }

  const [, letter, accidental, octave, duration] = match;

  return {
    letter: letter.toUpperCase(),
    accidental: accidental || null,
    octave,
    duration
  };
}




const KEY_SIGNATURES = {
  // No sharps or flats
  C: {},

  // Sharp keys
  G:  { F: "#" },
  D:  { F: "#", C: "#" },
  A:  { F: "#", C: "#", G: "#" },
  E:  { F: "#", C: "#", G: "#", D: "#" },
  B:  { F: "#", C: "#", G: "#", D: "#", A: "#" },
  "F#": { F: "#", C: "#", G: "#", D: "#", A: "#", E: "#" },
  "C#": { F: "#", C: "#", G: "#", D: "#", A: "#", E: "#", B: "#" },

  // Flat keys
  F:  { B: "b" },
  Bb: { B: "b", E: "b" },
  Eb: { B: "b", E: "b", A: "b" },
  Ab: { B: "b", E: "b", A: "b", D: "b" },
  Db: { B: "b", E: "b", A: "b", D: "b", G: "b" },
  Gb: { B: "b", E: "b", A: "b", D: "b", G: "b", C: "b" },
  Cb: { B: "b", E: "b", A: "b", D: "b", G: "b", C: "b", F: "b" }
};




function getKeySigAccidental(key, letter) {
  const map = KEY_SIGNATURES[key] || {};
  return map[letter.toUpperCase()] || null;
}


function shouldShowAccidental({
  writtenAcc,
  keySigAcc,
  previousAcc
}) {
  // Rule 1: differs from key signature
  if (writtenAcc !== keySigAcc) return true;

  // Rule 2: differs from previous accidental in measure
  if (writtenAcc !== previousAcc) return true;

  return false;
}






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
function tokenToVFNote(token, currentKey, accidentalMemory) {
  // console.log("TOKEN TO VFNOTE", "   \ntoken: ", token, "   \ncurrentKey: ", currentKey)
    const VF = window.Vex.Flow;


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


  const parsed = parseToken(token);
  if (!parsed) return null;

  const { letter, accidental, octave, duration } = parsed;
const vfDuration = durationMap[duration]
console.log("  vfDuration: ", vfDuration)
  const key = `${letter.toLowerCase()}${accidental || ""}/${octave}`;
  const keyAcc = getKeySigAccidental(currentKey, letter);



    // NORMAL NOTE
  // Format: C4q → pitch="C4", dur="q"

  const validDurations = new Set(["1","2","4","8","16","32"]);

if (!validDurations.has(vfDuration)) {
  console.log("Invalid duration:", vfDuration, "from token:", token);
   return null;
}


  const vfNote = new VF.StaveNote({
    keys: [key],
    duration: vfDuration
  });

  // --- ACCIDENTAL LOGIC ---
  let writtenAcc = accidental; // "#", "b", "##", "bb", or null
  if (!writtenAcc && keyAcc) {
    writtenAcc = "n"; // natural sign required
  }
  const prevAcc = accidentalMemory[letter];

  if (shouldShowAccidental({ writtenAcc, keySigAcc: keyAcc, previousAcc: prevAcc })) {
    if (writtenAcc) {
      vfNote.addAccidental(0, new VF.Accidental(writtenAcc));
    } else if (keyAcc) {
      vfNote.addAccidental(0, new VF.Accidental("n"));
    }
  }

  accidentalMemory[letter] = writtenAcc;

  return vfNote;
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
    rendererRef,
    selectedNoteId,
    onNoteSelect,
    onNoteDragStart,
    dragPreview,
    dragRef,
    caret,
    setCaret,
    noteInputMode,
    ...rest
  } = props;

  const lsContainerRef = useRef(null);
  const noteElements = useRef(new Map());
  const measureElements = useRef(new Map());
  const playheadRef = useRef(null);
  const isDragging = useRef(false);
  const originalYRef = useRef({});
  const semitoneStepRef = useRef(3);

  const measures = leadSheet?.measures ?? [];
  const effectGuard = useRef(false);

  useImperativeHandle(rendererRef, () => ({
    highlightNote(noteId) {
      noteElements.current.forEach(el => el.classList.remove("vf-highlight-note"));
      const el = noteElements.current.get(noteId);
      if (!el) return;
      el.classList.add("vf-highlight-note");
    },
    highlightMeasure(measureId) {
      measureElements.current.forEach(el => el.classList.remove("vf-highlight-measure"));
      const el = measureElements.current.get(measureId);
      if (!el) return;
      el.classList.add("vf-highlight-measure");
    },
    setPlayheadBeat(x, y1, y2) {
      if (!playheadRef.current) return;
      playheadRef.current.setAttribute("x1", x);
      playheadRef.current.setAttribute("x2", x);
      playheadRef.current.setAttribute("y1", y1);
      playheadRef.current.setAttribute("y2", y2);
    }
  }));

  const drawCaret = (svg, x, yTop, yBottom) => {
    const caretLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    caretLine.setAttribute("x1", x);
    caretLine.setAttribute("x2", x);
    caretLine.setAttribute("y1", yTop);
    caretLine.setAttribute("y2", yBottom);
    caretLine.setAttribute("stroke", "#4a7aff");
    caretLine.setAttribute("stroke-width", "2");
    caretLine.setAttribute("pointer-events", "none");
    svg.appendChild(caretLine);
  };





  // ⭐ StrictMode‑safe VexFlow render
  useLayoutEffect(() => {
    if (!lsContainerRef.current) return;
    if (dragRef.current) return; // freeze during drag

    // StrictMode dev double‑invoke guard
    if (effectGuard.current) return;
    effectGuard.current = true;

    let caretDrawInfo = null;








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
        stave.addKeySignature(leadSheet.key || "G");
      }

      const measureGroup = ctx.openGroup();
      stave.setContext(ctx).draw();
      ctx.closeGroup();
      measureElements.current.set(measure.id, measureGroup);

      const lineSpacing = stave.getSpacingBetweenLines();
      const semitoneStep = (lineSpacing / 2) * (7 / 12);
      semitoneStepRef.current = semitoneStep;

      const accidentalMemory = {};

   const notes = (measure.melody || []).map(n => {
  const token = typeof n === "string" ? n : n.token;
  const id = typeof n === "string" ? null : n.id;
  const vfNote = tokenToVFNote(token, leadSheet.key, accidentalMemory);
  return { vfNote, id };
}).filter(n => n.vfNote);  // ✅ drop nulls

const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
voice.addTickables(notes.map(n => n.vfNote));


      const formatter = new VF.Formatter();
      formatter.joinVoices([voice]);
      formatter.formatToStave([voice], stave);

      // Draw notes + hit areas
      notes.forEach((n, idx) => {
        const { vfNote, id } = n;
        vfNote.setStave(stave);

        const g = ctx.openGroup();
        vfNote.setContext(ctx).draw();
        ctx.closeGroup();

        if (caret &&
            caret.measure === i &&
            caret.index === idx) {
          const noteX = vfNote.getAbsoluteX();
          caretDrawInfo = {
            x: noteX,
            top: y - 5,
            bottom: y + staveHeight - 5
          };
        }

        const ys = vfNote.getYs();
        if (ys && ys.length > 0 && id) {
          originalYRef.current[id] = ys[0];
        }

        const hitGroup = ctx.openGroup();
        const bbox = vfNote.getBoundingBox();
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

        if (selectedNoteId === id) {
          g.classList.add("selected-note");
        }

        hitGroup.style.cursor = "pointer";

        hitGroup.addEventListener("mousedown", e => {
          e.preventDefault();

          if (noteInputMode) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            setCaret({ measure: i, index: idx });
            return;
          }

          const startX = e.clientX;
          const startY = e.clientY;
          let moved = false;

          const onMove = ev => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            if (!moved && Math.hypot(dx, dy) > 3) {
              moved = true;
              onNoteSelect?.(id);
              onNoteDragStart(id, startX, startY, g);
            }
          };

          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            if (!moved) {
              onNoteSelect?.(id);
            }
          };

          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        });

        if (id) {
          noteElements.current.set(id, g);
        }
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

    // After VexFlow is done: get FINAL SVG and draw playhead + caret
    const svg = lsContainerRef.current.querySelector("svg");
    if (svg) {
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

      if (caretDrawInfo) {
        drawCaret(svg, caretDrawInfo.x, caretDrawInfo.top, caretDrawInfo.bottom);
      }
    }

    return () => {
      effectGuard.current = false;
      if (lsContainerRef.current) {
        lsContainerRef.current.innerHTML = "";
      }
      noteElements.current.clear();
      measureElements.current.clear();
      originalYRef.current = {};
    };
  }, [measures, selectedNoteId, noteInputMode, caret, dragRef]); // useLayoutEffect



  // Preview transform effect stays as‑is
  useEffect(() => {
    if (!dragRef.current) {
      noteElements.current.forEach(g => g.removeAttribute("transform"));
      return;
    }

    if (!dragPreview) {
      isDragging.current = false;
      return;
    }

    const { noteId, semitones, durationSteps } = dragPreview;
    const g = noteElements.current.get(noteId);
    if (!g) return;

    const dy = semitones * -5;
    const dx = durationSteps * 30;

    g.setAttribute("transform", `translate(${dx}, ${dy})`);
  }, [dragPreview, dragRef]);

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


