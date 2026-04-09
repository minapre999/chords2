import React, { useState, useEffect, useRef, useMemo } from "react";
 import "./Fretboard.css";
 import dc from "../../globals.js"
//  import ChordDictionary from "../../harmony/cd-manager.js"
//  import {CDManager} from "../../harmony/cd-manager.js"
  import  ChordForm, {Chord}  from "../../harmony/harmony-manager.js"
 import Note from "/src/harmony/note.js"
import StringLane from "./StringLane.jsx"
import FretboardSurface from "./FretboardSurface.jsx"
import VibrationOverlay from "./VibrationOverlay.jsx"
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import  PlayNote  from "../../sound/Play.js";


// import "../../css/Fretboard.css";



// const hDict = getHarmonyDict()
// console.log(hDict)






const NOTE_NAMES_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_NAMES_FLATS  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function noteNameFromMidi(midi, { preferSharps = true } = {}) {
  const names = preferSharps ? NOTE_NAMES_SHARPS : NOTE_NAMES_FLATS;
  const idx = ((midi % 12) + 12) % 12;
  return names[idx];
}

// const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];
const STANDARD_TUNING  = [64, 59, 55, 50, 45, 40];





export default function FretboardSVG(
  props

) {

 const {
  cfUI=null,
  chordRootUI="C",
  numStrings = dc.TUNING_MANAGER.numberOfStrings,
  numFrets = dc.FRETBOARD_MANAGER.numFrets,
  preferSharps = true,
  interactive = true,
  onNoteClick,
  // width = 1400,
  // height = 180,
 zoom = 1,
  showHeadstockUI,
  
} = props







const [selected, setSelected] = useState(null);
const [vibratingString, setVibratingString] = useState(null);
const [vibeTick, setVibeTick] = useState(0);

const clearVibration = () => {
  setVibratingString(null);
};



  // const scaledWidth = width * zoom;

// Visual customisation UI state

const normalizedTuning = dc.TUNING_MANAGER.midi

const nutX = 35;
let width = 1400
let height = 180
const stringSpacing = height / (numStrings + 1);
const stringY = (string) => stringSpacing * (string+1);
const fretSpacing = (width - nutX) / numFrets;
const getFretX = (fret) => nutX  + fretSpacing * fret;
const fretboardLength = getFretX(numFrets);
const headstockWidth = 180;
width = fretboardLength + headstockWidth

const scaledWidth = (fretboardLength + headstockWidth) * zoom;
const scaledHeight = height * zoom;

  const gaugeMap = [4,5,6,7,8.4,10];
  const getStringWidth = (i) => gaugeMap[Math.min(gaugeMap.length - 1, i)];



  const getMidiNumber = (stringIndex, fretIndex) =>
    normalizedTuning[stringIndex] + fretIndex;


  const handleNoteClick = (stringIndex, fretIndex) => {
   
    const midi = getMidiNumber(stringIndex, fretIndex);
    PlayNote(midi);

    const noteName = noteNameFromMidi(midi, { preferSharps });
    const info = { stringIndex, fretIndex, midi, noteName };

    setSelected(info);
    setVibratingString(stringIndex);
    setVibeTick(t => t + 1);



    if (onNoteClick) onNoteClick(info);
  };



  
let cf=null
if( cfUI ) {
  const hm = dc.HARMONY_MANAGER
  //  console.log("chordRootUI2: ", chordRootUI)
  cf = cfUI
  cf.root = chordRootUI
}


const scrollRef = useRef(null);


return (
  <div
    className="fretboard-scroll"
    ref={scrollRef}
    style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}
  >
   <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`-${headstockWidth} 0 ${fretboardLength + headstockWidth} ${height}`}
    >

      {/* ================= HEADSTOCK ================= */}
      {showHeadstockUI && (
        <g transform={`translate(${-headstockWidth}, 0)`}>
          <defs>
            <linearGradient id="headstockGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5b3a1f" />
              <stop offset="100%" stopColor="#3b2413" />
            </linearGradient>
          </defs>

          <path
            d={`
              M ${headstockWidth} ${height * 0.2}
              L ${headstockWidth * 0.3} ${height * 0.1}
              L 0 ${height * 0.25}
              L 0 ${height * 0.75}
              L ${headstockWidth * 0.3} ${height * 0.9}
              L ${headstockWidth} ${height * 0.8}
              Z
            `}
            fill="url(#headstockGradient)"
            stroke="#1b0f08"
            strokeWidth="2"
          />


          {Array.from({ length: numStrings }).map((_, i) => {
            const isBassSide = i >= numStrings / 2;
            const sideIndex = isBassSide ? i - numStrings / 2 : i;
            const baseY = isBassSide ? height * 0.7 : height * 0.3;
            const y = baseY + sideIndex * 18;
            const x = headstockWidth * 0.85;

            return (
              <g key={i}>
                <circle cx={x} cy={y} r={5} fill="#a38c8c" />
                <rect x={x - 1} y={y - 10} width={2} height={10} fill="#b0b0b0" />
              </g>
            );
          })}
        </g>
      )}

      {/* ================= FRETBOARD ================= */}
      <g >

      

        {/* === MAIN FRETBOARD SURFACE === */}
        <FretboardSurface
          {...props}
          width = {fretboardLength}
          height={height}
          numFrets={numFrets}
          nutX={nutX}
          getFretX={getFretX}
        />

        {/* === STRINGS + NOTES === */}
        {normalizedTuning.map((openMidi, stringIndex) => (
          <StringLane
            {...props}
            key={stringIndex}
            stringIndex={stringIndex}
            openMidi={openMidi}
            cf={cf}
            interactive={interactive}
            handleNoteClick={handleNoteClick}
            width={fretboardLength}
            numFrets={numFrets}
            nutX={nutX}
            getFretX={getFretX}
            stringY={stringY}
            getStringWidth={getStringWidth}
            noteNameFromMidi={noteNameFromMidi}
            fretSpacing={fretSpacing}
          />
        ))}
      </g>

        {/* === VIBRATION OVERLAY === */}

      <VibrationOverlay
    vibratingString={vibratingString}
    vibeTick={vibeTick}
    width={fretboardLength}
    stringY={stringY}
    getStringWidth={getStringWidth}
    onDone={clearVibration}
  />

  
    </svg>
  </div>
);
          // ← FIXED — no extra </div>


}