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




//  function tokenToVFNote(entry) {
//   const token = typeof entry === "string" ? entry : entry.token;
//   const isRest = token.endsWith("r");
//   const VF = window.Vex.Flow;
//   if (isRest) {
//     const note = new VF.StaveNote({
//       keys: ["b/4"],
//       duration: token,
//       clef: "treble"
//     });

//     note.attrs.id = entry.id;   // ⭐ FIXED

//     return note;
//   }

//   const pitch = token.slice(0, -1);
//   const durationChar = token.slice(-1);

//   const letter = pitch[0].toLowerCase();
//   const accidental = pitch.length === 3 ? pitch[1] : "";
//   const octave = String(Number(pitch[pitch.length - 1]) + 1);

//   const key = `${letter}${accidental}/${octave}`;

//   const note = new VF.StaveNote({
//     keys: [key],
//     duration: durationChar,
//     clef: "treble"
//   });

//   note.attrs.id = entry.id;   // ⭐ FIXED

//   if (accidental) {
//     note.addAccidental(0, new VF.Accidental(accidental));
//   }

//   return note;
// }


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

  const{leadSheet,
    ref,
    renderDataUI, setRenderDataUI,
    selectedNoteId, setSelectedNoteId, 
    onNoteSelect,
    ...rest 
      } = props


// const LeadSheetRenderer = forwardRef(function LeadSheetRenderer({ leadSheet }, ref) {
  const lsContainerRef = useRef(null);



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

   
    console.log("LeadSheetRenderer leadSheet: ", leadSheet, "noteId: ", noteId)
    let found = null
    for(let m of leadSheet.measures) {
      for(let item of m.melody) {
        if(item.id==noteId) {
          found = item
          break;
          // found the note item
        }
        if( found != null) break;
      }
    }
  // const note = newNote({}).autoPosition()

  const pitch = found.token.slice(0, -1);
  const letter = pitch[0].toUpperCase();
  const accidental = pitch.length === 3 ? pitch[1] : "";
  const octave = String(Number(pitch[pitch.length - 1]) );
  const fret = found.fret
  const string = found.string
  console.log("found: ", found, "letter: ", letter, "accidental: ", accidental, "octave: ", octave, "fret: ", fret, " string: ", string)
  if(!isNaN(octave) ) { // not a rest

    const name = `${letter.toUpperCase()}${accidental}${octave}`
    console.log("note name: ", name)
    const note = new Note({name: name, fret: fret, stringNumber: string})
    console.log("note: ", note)
     const rData = new RenderData(props)
     const rn = new RenderNote({note: note, text: `${letter}${accidental}`,})
     rData.add(rn)
     console.log("render data: ", rData)
     setRenderDataUI(rData)
  }
    // const noteLetter = leadSheet.measure.
    //  const rn = new RenderNote({note: n, text: text ,})
    //       rData.add(rn, n.stringNumber)

      // ⭐ Controlled scroll (no snapping)
  const container = lsContainerRef.current;
  if (container) {
    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offset = rect.top - containerRect.top - containerRect.height / 2;

    container.scrollBy({
      top: offset,
      behavior: "smooth"
    });
  }


    // el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
},


    highlightMeasure(measureId) {
      measureElements.current.forEach(el => el.classList.remove("vf-highlight-measure"));
      const el = measureElements.current.get(measureId);
      if (el) {
        el.classList.add("vf-highlight-measure");


  // ⭐ Controlled scroll (no snapping)
        const container = lsContainerRef.current;
        if (container) {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const offset = rect.top - containerRect.top - containerRect.height / 2;

          container.scrollBy({
            top: offset,
            behavior: "smooth"
          });
        }



        // el.scrollIntoView({ block: "center", behavior: "smooth" });
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
    if (!lsContainerRef.current) return;

    lsContainerRef.current.innerHTML = "";
    noteElements.current.clear();
    measureElements.current.clear();

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
    ctx.svg.style.width = `${svgWidth}px`;
    ctx.svg.style.height = `${svgHeight}px`;
    ctx.svg.style.display = "block";

    // --- PLAYHEAD LINE ---
    const playhead = document.createElementNS("http://www.w3.org/2000/svg", "line");
    playhead.setAttribute("stroke", "red");
    playhead.setAttribute("stroke-width", "2");
    ctx.svg.appendChild(playhead);
    playheadRef.current = playhead;

   



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
        const vfNote = tokenToVFNote(n);
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
  n.vfNote.setStave(stave);

  // --- 1. Create NOTE GROUP (draw the note first) ---
  const g = ctx.openGroup();
  n.vfNote.setContext(ctx).draw();
  ctx.closeGroup();

  // --- 2. Create HIT AREA GROUP (ABOVE the note) ---
  const hitGroup = ctx.openGroup();
  const bbox = n.vfNote.getBoundingBox();
  if (bbox) {
    const padding = 6;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", bbox.getX() - padding);
    rect.setAttribute("y", bbox.getY() - padding);
    rect.setAttribute("width", bbox.getW() + padding * 2);
    rect.setAttribute("height", bbox.getH() + padding * 2);

    // ⭐ Fully invisible, but clickable
    rect.setAttribute("fill", "transparent");
    rect.setAttribute("stroke", "none");
    rect.setAttribute("pointer-events", "all");

    hitGroup.appendChild(rect);
  }
  ctx.closeGroup();

  // --- Highlight ---
  if (selectedNoteId === n.id) {
    g.classList.add("selected-note");
  }

  // --- Hit testing (on hitGroup, not g) ---
  hitGroup.setAttribute("data-note-id", n.id);
  hitGroup.style.cursor = "pointer";

  hitGroup.addEventListener("mousedown", (e) => {
    onNoteSelect?.(n.id);
    onNoteDragStart?.(n.id, e.clientY, e.clientX);
    e.stopPropagation();
  });

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
  }, [measures, selectedNoteId]);





  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        // overflowX: "hidden",
      }}
    >
      <div
      className="ls-container"
        ref={lsContainerRef}
        style={{
          width: "900px",
          minHeight: "600px",
        }}
      />
    </div>
  );
}

