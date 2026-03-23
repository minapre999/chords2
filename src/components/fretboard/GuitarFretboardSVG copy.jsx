import React, { useState, useEffect, useRef, useMemo } from "react";
// import "./Fretboard.css";

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

const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];
//const STANDARD_TUNING  = [64, 59, 55, 50, 45, 40];
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

export default function GuitarFretboardSVG({
  numStrings = 6,
  tuning = STANDARD_TUNING,
  numFrets = 17,
  showNoteNames = true,
  preferSharps = true,
  interactive = true,
  onNoteClick,
  width = 1400,
  height = 180,
  fretboardColor = "#4a2619",
  stringColor = "#d0d0d0",
  fretboardImage = "",
  showHeadstock = true,

}) {
  const [selected, setSelected] = useState(null);
  const [vibratingString, setVibratingString] = useState(null);
  const [zoom, setZoom] = useState(1);
const [showHeadstockUI, setShowHeadstockUI] = useState(true);
// Visual customisation UI state
const [fretboardColorUI, setFretboardColorUI] = useState(fretboardColor);
const [stringColorUI, setStringColorUI] = useState(stringColor);
const [bassStringColorUI, setBassStringColorUI] = useState("#d4af37");
const [usePatternUI, setUsePatternUI] = useState(!!fretboardImage);

const [showOpenStringsUI, setShowOpenStringsUI] = useState(true);

  const audioCtxRef = useRef(null);
  const sampleBuffersRef = useRef({});

  const [activeChord, setActiveChord] = useState(null);
<select onChange={(e) => setActiveChord(e.target.value)}>
  <option value="">None</option>
  {Object.keys(CHORDS).map((name) => (
    <option key={name} value={name}>{name}</option>
  ))}
</select>




  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  useEffect(() => {
    const audioCtx = audioCtxRef.current;
    SAMPLE_FILES.forEach(async (file) => {
      const midi = midiFromFilename(file);
      if (midi == null) return;

      const response = await fetch("samples/" + file);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      sampleBuffersRef.current[midi] = audioBuffer;
    });
  }, []);

  const normalizedTuning = useMemo(() => {
    let t = tuning.slice();
    if (t.length < numStrings) {
      const diff = numStrings - t.length;
      t = [...Array(diff).fill(t[0]), ...t];
    } else if (t.length > numStrings) {
      t = t.slice(t.length - numStrings);
    }
    return t;
  }, [tuning, numStrings]);

  const headstockWidth = 180;
  const effectiveHeadstockWidth = showHeadstockUI ? headstockWidth : 0;
  const nutX = 20;

  const scaleWidth = width - nutX - 20;
  const fretSpacing = scaleWidth / (numFrets + 1);
  const stringSpacing = height / (numStrings + 1);

  const gaugeMap = [10, 8.4, 7, 6, 5, 4];
  const getStringWidth = (i) => gaugeMap[Math.min(gaugeMap.length - 1, i)];

  const inlayFrets = [3, 5, 7, 9, 12, 15, 17, 19];

  const getFretX = (fret) => nutX + fretSpacing * fret;

  const getVibrationAmplitude = (stringIndex) => {
    const amplitudes = [6, 5, 4, 3, 2, 1];
    return amplitudes[stringIndex] ?? 2;
  };

  const getMidiNumber = (stringIndex, fretIndex) =>
    normalizedTuning[stringIndex] + fretIndex;

  function getClosestSample(midi) {
    const available = Object.keys(sampleBuffersRef.current)
      .map(n => parseInt(n, 10))
      .sort((a, b) => Math.abs(a - midi) - Math.abs(b - midi));

    return available[0];
  }

  const PlayNote = (midi) => {
    
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    if (audioCtx.state !== "running") audioCtx.resume();

    const closest = getClosestSample(midi);
    const buffer = sampleBuffersRef.current[closest];
    if (!buffer) return;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const semitones = midi - closest;
    source.playbackRate.value = Math.pow(2, semitones / 12);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2);

    source.connect(gain);
    gain.connect(audioCtx.destination);
    console.log(`PlayNote midi: ${midi}  semitones: ${semitones}, closest: ${semitones}`)

    source.start();
  };


  function PlayNoteAtTime(midi, startTime) {
  const audioCtx = audioCtxRef.current;
  if (!audioCtx) return;

  if (audioCtx.state !== "running") audioCtx.resume();

  const closest = getClosestSample(midi);
  const buffer = sampleBuffersRef.current[closest];
  if (!buffer) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const semitones = midi - closest;
  source.playbackRate.value = Math.pow(2, semitones / 12);

  const gain = audioCtx.createGain();

  // ⭐ Use the SAME startTime for the envelope
  gain.gain.setValueAtTime(1, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2);

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start(startTime);
}

function PlayChord(name) {
  const shape = CHORDS[name];
  shape.forEach((fret, stringIndex) => {
    if (fret !== null) {
      PlayNote(stringIndex, fret);
    }
  });
}



function PlayChord(name) {
  const audioCtx = audioCtxRef.current;
  if (!audioCtx) return;

  const shape = CHORDS[name];
  const startTime = audioCtx.currentTime + 0.02; // small scheduling buffer

  // 1. Create all sources FIRST
  const voices = shape.map((fret, stringIndex) => {
    if (fret === null) return null;

    const midi = tuning[stringIndex] + fret;

    const closest = getClosestSample(midi);
    const buffer = sampleBuffersRef.current[closest];
    if (!buffer) return null;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const semitones = midi - closest;
    source.playbackRate.value = Math.pow(2, semitones / 12);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2);

    source.connect(gain);
    gain.connect(audioCtx.destination);

    return source;
  });

  // 2. Start ALL sources in a separate pass
  voices.forEach((source) => {
    if (source) source.start(startTime);
  });
}






function PlayChordStrum(name, direction = "down") {
  const shape = CHORDS[name];
  const order =
    direction === "down"
      ? [...shape.keys()]            // 0 → 5
      : [...shape.keys()].reverse(); // 5 → 0

  order.forEach((stringIndex, i) => {
    const fret = shape[stringIndex];
    if (fret !== null) {
      const midi = tuning[stringIndex] + fret;
      setTimeout(() => PlayNote(midi), i * 40);
    }
  });
}




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


  function getChordFrets(name) {
  return CHORDS[name];
}



  return (
  <div style={{ width: "100%", position: "relative" }}>

    {/* TOOLBAR */}
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        background: "#222",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "16px",
        zIndex: 2000,
        color: "white",
        borderBottom: "1px solid #444",
      }}
    >
      {/* Fretboard colour */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Fretboard:
        <input
          type="color"
          value={fretboardColorUI}
          onChange={(e) => setFretboardColorUI(e.target.value)}
        />
      </label>

      {/* Pattern toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={usePatternUI}
          onChange={(e) => setUsePatternUI(e.target.checked)}
        />
        Use pattern
      </label>

      {/* String colours */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Strings:
        <input
          type="color"
          value={stringColorUI}
          onChange={(e) => setStringColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Bass:
        <input
          type="color"
          value={bassStringColorUI}
          onChange={(e) => setBassStringColorUI(e.target.value)}
        />
      </label>

      {/* Inlays */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showInlaysUI}
          onChange={(e) => setShowInlaysUI(e.target.checked)}
        />
        Inlays
      </label>

      {/* Note names */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showNoteNamesUI}
          onChange={(e) => setShowNoteNamesUI(e.target.checked)}
        />
        Note names
      </label>

      {/* Open strings */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showOpenStringsUI}
          onChange={(e) => setShowOpenStringsUI(e.target.checked)}
        />
        Open strings
      </label>

      {/* Zoom controls */}
      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>–</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>

      {/* Headstock toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showHeadstockUI}
          onChange={(e) => setShowHeadstockUI(e.target.checked)}
        />
        Show headstock
      </label>


  <button onClick={() => PlayChord("G")}>G</button>
  <button onClick={() => PlayChord("D")}>D</button>
  <button onClick={() => PlayChord("C")}>C</button>
  <button onClick={() => PlayChord("Em")}>Em</button>




    </div>





    {/* SPACER BELOW TOOLBAR */}
    <div style={{ height: "48px" }} />

   {/* FULL-WIDTH FRETBOARD CONTAINER */}
<div
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

 {/* NEW WRAPPER */}
  <div
    style={{
      position: "relative",
      width: width * zoom + headstockWidth * zoom + 20, // total width
      height: height * zoom,
    }}
  >

 
  {/* HEADSTOCK */}
  <div
    style={{
      position: "absolute",
      //left: 0,
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
              {showHeadstockUI && (
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
                        <circle cx={x} cy={y} r={5} fill="#d9d9d9" stroke="#555" strokeWidth="1" />
                        <rect x={x - 1} y={y - 10} width={2} height={10} fill="#b0b0b0" />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
    )}
        </div>

 {/* BACKGROUND WRAPPER — NO ZOOM HERE */}
  <div
    style={{
      width: width,
      height: height,
      background: usePatternUI && fretboardImage
        ? `url(${fretboardImage})`
        : fretboardColorUI,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
 
    

      width: width * zoom,
    height: height * zoom,
  
    position: "relative",
    overflow: "visible",
    zIndex: 2,   // ← higher (or remove entirely)


     // marginLeft: (headstockWidth + 20) * zoom, // aligns nut with headstock
    }}
  >

    {/* OUTER ZOOM WRAPPER */}
    <div
      style={{
        width: width,
        height: height,
        position: "relative",
      }}
    >

      {/* INNER ZOOM WRAPPER — ONLY PLACE WHERE ZOOM HAPPENS */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
          width: width,
          height: height,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >

            {/* === VIBRATION OVERLAY === */}
            {vibratingString !== null && (
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
                  {(() => {
                    const y = stringSpacing * (numStrings - vibratingString);
                    const amp = getVibrationAmplitude(vibratingString);

                    return (
                      <line
                        x1="0"
                        y1={y}
                        x2={width}
                        y2={y}
                        stroke="#ffffff88"
                        strokeWidth={getStringWidth(vibratingString)}
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
                    );
                  })()}
                </g>
              </svg>
            )}

            {/* === MAIN SVG === */}

          


            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              <defs>
                {/* {fretboardImage && ( */}

            <pattern
                id="rosewoodPattern"
                patternUnits="userSpaceOnUse"
                width="75"
                height="192"
              >
                <image
                  href="/images/rosewood5.png"
                  width="75"
                  height="192"
                  preserveAspectRatio="none"
                />
              </pattern>

               {/* <pattern
                    id="fretboardImagePattern"
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4"
                
                  >
                    <image
                      href={fretboardImage}
                      width={width}
                      height={height}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </pattern> */}


                  {/* <pattern
                    id="fretboardWood"
                    patternUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <image
                        href="/images/rosewood10.png"
                        patternUnits="userSpaceOnUse"
                        width={width}
                        height={height}
                          preserveAspectRatio="xMidYMid slice"
  imageRendering="crisp-edges"
  style={{ imageRendering: "crisp-edges" }}
                        // preserveAspectRatio="none"
                    />
                  </pattern> */}
                {/* )} */}
              </defs>

            

              {/* Fretboard */}


              <rect
             x="0"
            y="0"
            width="1800"
            height="220"
            fill="url(#rosewoodPattern)"
              />

              {/* Nut */}
              <rect
                x={nutX}
                y={0}
                width={6}
                height={height}
                fill="#f0f0f0"
                stroke="#999"
                strokeWidth="1.5"
              />

              {/* Frets */}
              {Array.from({ length: numFrets  }).map((_, i) => {
                const x = getFretX(i + 1);
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={height}
                    stroke="#cfcfcf"
                    strokeWidth={8}
                  />
                );
              })}

              {/* Inlays */}
              {showInlaysUI &&
                inlayFrets.map((fret) => {
                  if (fret > numFrets) return null;
                  const isDouble = fret === 12;
                  const x = (getFretX(fret) + getFretX(fret - 1)) / 2;
                  const r = 6;

                  if (isDouble) {
                    return (
                      <g key={fret}>
                        <circle cx={x} cy={height * 0.35} r={r} fill="#f5f5f5" stroke="#999" />
                        <circle cx={x} cy={height * 0.65} r={r} fill="#f5f5f5" stroke="#999" />
                      </g>
                    );
                  }

                  return (
                    <circle
                      key={fret}
                      cx={x}
                      cy={height / 2}
                      r={r}
                      fill="#f5f5f5"
                      stroke="#999"
                    />
                  );
                })}



          {normalizedTuning.map((openMidi, stringIndex) => {

          const y = stringSpacing * (numStrings - stringIndex);
          const stringThickness = getStringWidth(stringIndex);
          const openNoteName = noteNameFromMidi(openMidi, { preferSharps });
          const isWound = stringIndex <= 2; // 0,1,2 = wound; 3+ = plain
          const strokeCol = stringIndex <= 2 ? bassStringColorUI : stringColorUI;
          const chordFrets = activeChord ? CHORDS[activeChord] : null;

          // Highlight open or muted strings when a chord is active
if (activeChord) {
  const fret = CHORDS[activeChord][stringIndex];

  if (fret === 0) {
    // Open string
    openMarkers.push(
      <text
        key={`open-${stringIndex}`}
        x={nutX - 20}
        y={y + 4}
        fill="#ff0"
        fontSize={14}
      >
        O
      </text>
    );
  }

  if (fret === null) {
    // Muted string
    openMarkers.push(
      <text
        key={`mute-${stringIndex}`}
        x={nutX - 20}
        y={y + 4}
        fill="#ff0"
        fontSize={14}
      >
        X
      </text>
    );
  }
}




          //console.log("String index: stringIndex")
          return (
             <g key={stringIndex}>
                    
                    {/* String line */}

           {/* Base string with optional winding */}
      <rect
        x={0}
        y={y - stringThickness / 2}
        width={width}
        height={stringThickness}
        fill={strokeCol}
        {...(isWound ? { mask: "url(#woundMask)" } : {})}
      />

      {/* Sheen on top, no mask */}
      <rect
        x={0}
        y={y - stringThickness / 2}
        width={width}
        height={stringThickness}
        fill="url(#stringSheen)"
      />

                  
                    {/* Open string */}

                    
                    {showOpenStringsUI && (
                      <g
                        onClick={() =>
                          interactive && handleNoteClick(stringIndex, 0)
                        }
                        style={{
                          cursor: interactive ? "pointer" : "default",
                          pointerEvents: "auto",
                        }}
                      >
                        <circle cx={nutX - 18} cy={y} r={10} fill="#fff" stroke="#333" />
                        {showNoteNamesUI && (
                          <text
                            x={nutX - 18}
                            y={y + 4}
                            fontSize={10}
                            textAnchor="middle"
                            fill="#000"
                          >
                            {openNoteName}
                          </text>
                        )}
                      </g>
                    )}

                    {/* Fretted notes */}

                    
                    {console.log("numFrets =", numFrets)
                    }
                    
                    {Array.from({ length: numFrets }).map((_, fretIndex) => {

                   



                      const fret = fretIndex + 1;
                      const midi = openMidi + fret;
                      const noteName = noteNameFromMidi(midi, { preferSharps });
                      // const x = (getFretX(fret) + getFretX(fret - 1)) / 2;
                      const left = getFretX(fret - 1);
                      const right = Math.min(getFretX(fret), width);
                      const x = (left + right) / 2;
                      const chordFrets = getChordFrets(activeChord);
                     // const isChordNote = chordFrets && chordFrets[stringIndex] === fret;  
const isChordNote =
  activeChord &&
  CHORDS[activeChord][stringIndex] === fret;

                  //  console.log("fret", fret, "left", left, "right", getFretX(fret), "clamped", right);

          // console.log("ITERATING FRET", fret);
// console.log("FRET", fret, "left", left, "right", right, "x", x);
                      return (
                        <g
                          key={fretIndex}
                          onClick={() =>
                            interactive && handleNoteClick(stringIndex, fretIndex + 1)
                          }
                          style={{ cursor: interactive ? "pointer" : "default" }}
                        >
                           {/* // DEBUG: draw a vertical red line at the computed X */}
                    {/* <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={1000}
                      stroke="red"
                      strokeWidth={1}
                    /> */}

                        {/* bigger circle for chord note + highlight + thicker outline*/}
                          <circle
                            cx={x}
                            cy={y}
                            r={isChordNote ? 14 : 10}
                            fill={isChordNote ? "rgba(255,255,0,0.35)" : "rgba(255,255,255,0.12)"}
                            stroke={isChordNote ? "#ff0" : "#333"}
                            strokeWidth={isChordNote ? 2 : 1}
                          />
                          {showNoteNamesUI && (
                            <text
                              x={x}
                              y={y + 4}
                              fontSize={10}
                              textAnchor="middle"
                              fill="#fff"
                            >
                              {noteName}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {selected && (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                Selected: string {selected.stringIndex + 1}, fret {selected.fretIndex} →{" "}
                {selected.noteName}
              </div>
            )}
          </div>
        </div>
      </div> {/* end of background wrapper */}
    </div>
  </div>
   </div>
);

}
