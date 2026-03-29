import React, { useState, useEffect, useRef, useMemo } from "react";
 import "./Fretboard.css";
 import dc from "../../globals.js"
 import ChordDictionary from "../../harmony/cd-manager.js"
 import {CDManager} from "../../harmony/cd-manager.js"
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
const CHORDS = {
  G:  [3, 2, 0, 0, 0, 3],
  D:  [null, null, 0, 2, 3, 2],
  C:  [null, 3, 2, 0, 1, 0],
  Em: [0, 2, 2, 0, 0, 0],
  Am: [null, 0, 2, 2, 1, 0],
  E:  [0, 2, 2, 1, 0, 0],
};


function noteNameFromMidi(midi, { preferSharps = true } = {}) {
  const names = preferSharps ? NOTE_NAMES_SHARPS : NOTE_NAMES_FLATS;
  const idx = ((midi % 12) + 12) % 12;
  return names[idx];
}

// const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];
const STANDARD_TUNING  = [64, 59, 55, 50, 45, 40];
const SAMPLE_FILES = [
  "A2.wav", "A3.wav", "A4.wav",
  "C3.wav", "C4.wav", "C5.wav", "C6.wav",
  "D3.wav", "D4.wav", "D5.wav", "D6.wav",
  "E2.wav"
];

function midiFromFilename(filename) {
  const match = filename.match(/([A-G][b#]?)(\d)/i);
  if (!match) return null;

  const note = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);

  const NOTE_TO_SEMITONE = {
    "C": 0, "C#": 1, "DB": 1,
    "D": 2, "D#": 3, "EB": 3,
    "E": 4,
    "F": 5, "F#": 6, "GB": 6,
    "G": 7, "G#": 8, "AB": 8,
    "A": 9, "A#": 10, "BB": 10,
    "B": 11
  };

  const semitone = NOTE_TO_SEMITONE[note];
  if (semitone === undefined) return null;

  return 12 * (octave + 1) + semitone;
}




export default function FretboardSVG({
  renderDataUI,
  cfUI=null,
  chordRootUI="C",
  numStrings = 6,
  tuning = STANDARD_TUNING,
  numFrets = 16,

  preferSharps = true,
  interactive = true,
  onNoteClick,
  width = 1400,
  height = 180,
 zoom = 1,
  showHeadstockUI,
  showInlaysUI,
  onOpenPanel,
    stringColorUI,   // ← ADD THIS
    bassStringColorUI,
    activeChord,
    showChord,
showOpenStringsUI,
showNoteNamesUI,
  showAllNotesUI=false,
setOpenMarkers,
openMarkers,
noteMode
}) {
  const [selected, setSelected] = useState(null);
  const [vibratingString, setVibratingString] = useState(null);


// Visual customisation UI state

  

const normalizedTuning = dc.TUNING_MANAGER.midi

 

  const headstockWidth = 180;
  const effectiveHeadstockWidth = showHeadstockUI ? headstockWidth : 0;
  const nutX = 35;

  // const scaleWidth = width - nutX - 20;
  // const fretSpacing = scaleWidth / (numFrets + 1);
  const stringSpacing = height / (numStrings + 1);
//  const getFretX = (fret) => nutX + fretSpacing * fret;
  const stringY = (string) => stringSpacing * (string+1);

  const scaleWidth = width - nutX;   // must be positive
const fretSpacing = scaleWidth / numFrets;

const getFretX = (fretIndex) => nutX + fretSpacing * fretIndex;



  const gaugeMap = [4,5,6,7,8.4,10];
  const getStringWidth = (i) => gaugeMap[Math.min(gaugeMap.length - 1, i)];

  const inlayFrets = [3, 5, 7, 9, 12, 15, 17, 19];

 
  const getVibrationAmplitude = (stringIndex) => {
    const amplitudes = [6, 5, 4, 3, 2, 1];
    return amplitudes[stringIndex] ?? 2;
  };

  const getMidiNumber = (stringIndex, fretIndex) =>
    normalizedTuning[stringIndex] + fretIndex;

  





  const handleNoteClick = (stringIndex, fretIndex) => {
   
    const midi = getMidiNumber(stringIndex, fretIndex);
    PlayNote(midi);

    const noteName = noteNameFromMidi(midi, { preferSharps });
    const info = { stringIndex, fretIndex, midi, noteName };

    setSelected(info);
    setVibratingString(stringIndex);
    setTimeout(() => setVibratingString(null), 300);

    if (onNoteClick) onNoteClick(info);
  };



  
let cf=null
if( cfUI ) {
  const hm = dc.HARMONY_MANAGER
  //  console.log("chordRootUI2: ", chordRootUI)
  cf = cfUI
  cf.root = chordRootUI
}


 return (
  <div style={{ width: "100%", position: "relative" }}>
    {/* SCROLL WRAPPER */}
    <div
      className="fretboard-scroll"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        position: "relative",
      }}
      onWheel={(e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setZoom((z) => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          return Math.min(3, Math.max(0.5, z + delta));
        });
      }}
    >
      {/* MAIN WRAPPER (headstock + fretboard) */}
      <div
        style={{
          position: "relative",
          width: width * zoom + headstockWidth * zoom + 20,
          height: height * zoom,
        }}
      >
        {/* HEADSTOCK */}
        <div
          style={{
            position: "absolute",
            left: -(headstockWidth + 20) * zoom,
            top: 0,
            width: headstockWidth * zoom,
            height: height * zoom,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {showHeadstockUI && (
            <svg width={headstockWidth} height={height}>
              <defs>
                <linearGradient id="headstockGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5b3a1f" />
                  <stop offset="100%" stopColor="#3b2413" />
                </linearGradient>
              </defs>

              <g transform={`translate(${headstockWidth} 0) scale(-1, 1)`}>
                <path
                  d={`
                    M 0 ${height * 0.2}
                    L ${headstockWidth * 0.7} ${height * 0.1}
                    L ${headstockWidth} ${height * 0.25}
                    L ${headstockWidth} ${height * 0.75}
                    L ${headstockWidth * 0.7} ${height * 0.9}
                    L 0 ${height * 0.8}
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
                      <circle cx={x} cy={y} r={5} fill="#a38c8c" stroke="#a59a9a" strokeWidth="1" />
                      <rect x={x - 1} y={y - 10} width={2} height={10} fill="#b0b0b0" />
                    </g>
                  );
                })}
              </g>
            </svg>
          )}
        </div>

        {/* BACKGROUND WRAPPER */}
        <div
          style={{
            width: width * zoom,
            height: height * zoom,
            position: "relative",
            overflow: "visible",
            zIndex: 2,
          }}
        >
          {/* OUTER ZOOM WRAPPER */}
          <div style={{ width, height, position: "relative" }}>
            {/* INNER ZOOM WRAPPER */}
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "0 0",
                width,
                height,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {/* === VIBRATION OVERLAY === */}
               <VibrationOverlay
                  vibratingString={vibratingString}
                  width={width}
                  height={height}
                  stringY={stringY}
                  getStringWidth={getStringWidth}
                  getVibrationAmplitude={getVibrationAmplitude}
                />


              {/* === MAIN SVG === */}
              <svg width={width} height={height}>
                <FretboardSurface
                  width={width}
                  height={height}
                  numFrets={numFrets}
                  nutX={nutX}
                  getFretX={getFretX}
                  showInlaysUI={showInlaysUI}
                  inlayFrets={inlayFrets}
                />

                {/* STRING + NOTE LAYERS */}
               

                {normalizedTuning.map((openMidi, stringIndex) => (
                  <StringLane
                  renderDataUI={renderDataUI}
                    key={stringIndex}
                    stringIndex={stringIndex}
                    openMidi={openMidi}
                    cf={cf}
                    showOpenStringsUI={showOpenStringsUI}
                    stringColorUI={stringColorUI}   // ← ADD THIS
                     bassStringColorUI={bassStringColorUI}
                    showNoteNamesUI={showNoteNamesUI}
                    openMarkers={openMarkers}
                    cfUI={cfUI}
                    interactive={interactive}
                    handleNoteClick={handleNoteClick}
                    preferSharps={preferSharps}
                    width={width}
                    numFrets={numFrets}
                    nutX={nutX}
                    getFretX={getFretX}
                    stringY={stringY}
                    getStringWidth={getStringWidth}
                    noteNameFromMidi={noteNameFromMidi}
                    showAllNotesUI={showAllNotesUI}
                    fretSpacing={fretSpacing}
                    noteMode={noteMode}
                  />
                ))}
              </svg>

              {selected && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Selected: string {selected.stringIndex + 1}, fret {selected.fretIndex} →{" "}
                  {selected.noteName}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
          // ← FIXED — no extra </div>


}
