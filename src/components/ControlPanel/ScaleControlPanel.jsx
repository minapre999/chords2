
import React, { useState,useEffect } from "react";
 import AccordionItem from "./AccordionItem"

import "./ControlPanel.css"
import "./ScaleControlPanel.css"
// import AccordionItem from "./AccordionItem";
import { patternsDB } from "./patternsDB"; // import Dexie store

// Built-in patterns
const BUILT_IN_PATTERNS = [
  "1-2-3-4",
  "1-2-3",
  "1-3-2-4",
  "1-3-4-2",
  "1-5-7-4",
  "1-4-3-7"
];



export default function ScaleControlPanel({
  bpm,
  setBpm,
  noteValue,
  setNoteValue,
  rhythm,
  setRhythm,
  direction,
  setDirection,
  pattern,
  setPattern,
  metronomeLevel,
  setMetronomeLevel,
  metronomeMuted,
  setMetronomeMuted
}) {
  // Option A: Only one accordion item open at a time
  const [openItem, setOpenItem] = useState("tempo");
  const toggle = (name) => setOpenItem(prev => (prev === name ? null : name));

  // Custom patterns from Dexie
  const [customPatterns, setCustomPatterns] = useState([]);

  // Load custom patterns on mount
  useEffect(() => {
    patternsDB.patterns.toArray().then(setCustomPatterns);
  }, []);

  // Add new pattern
  const addPattern = async () => {
    const value = prompt("Enter a custom pattern (e.g., 1-4-2-7)");
    if (!value) return;

    const id = await patternsDB.patterns.add({ value });
    setCustomPatterns(prev => [...prev, { id, value }]);
  };

  // Remove pattern
  const removePattern = async (id) => {
    await patternsDB.patterns.delete(id);
    setCustomPatterns(prev => prev.filter(p => p.id !== id));
  };

  // Combined list
  const allPatterns = [
    ...BUILT_IN_PATTERNS.map(p => ({ id: null, value: p, builtIn: true })),
    ...customPatterns.map(p => ({ id: p.id, value: p.value, builtIn: false }))
  ];

  return (
    <div className="layout">
      <div className="accordion">

        {/* TEMPO */}
        <AccordionItem
          title="Scale tempo"
          open={openItem === "tempo"}
          onToggle={() => toggle("tempo")}
        >
          <div className="control-group">
            <label>BPM: {bpm}</label>
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
            />

            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={noteValue === "quarter"}
                  onChange={() => setNoteValue("quarter")}
                />
                Quarter notes
              </label>

              <label>
                <input
                  type="radio"
                  checked={noteValue === "eighth"}
                  onChange={() => setNoteValue("eighth")}
                />
                Eighth notes
              </label>
            </div>
          </div>
        </AccordionItem>

        {/* RHYTHM */}
        <AccordionItem
          title="Rhythm"
          open={openItem === "rhythm"}
          onToggle={() => toggle("rhythm")}
        >
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={rhythm === "swing"}
                onChange={() => setRhythm("swing")}
              />
              Swing 8ths
            </label>

            <label>
              <input
                type="radio"
                checked={rhythm === "straight"}
                onChange={() => setRhythm("straight")}
              />
              Straight 8ths
            </label>

            <label>
              <input
                type="radio"
                checked={rhythm === "triplets"}
                onChange={() => setRhythm("triplets")}
              />
              Triplets
            </label>
          </div>
        </AccordionItem>

        {/* DIRECTION */}
        <AccordionItem
          title="Direction"
          open={openItem === "direction"}
          onToggle={() => toggle("direction")}
        >
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={direction === "asc"}
                onChange={() => setDirection("asc")}
              />
              Ascending
            </label>

            <label>
              <input
                type="radio"
                checked={direction === "desc"}
                onChange={() => setDirection("desc")}
              />
              Descending
            </label>

            <label>
              <input
                type="radio"
                checked={direction === "asc-desc"}
                onChange={() => setDirection("asc-desc")}
              />
              Ascending → Descending
            </label>

            <label>
              <input
                type="radio"
                checked={direction === "desc-asc"}
                onChange={() => setDirection("desc-asc")}
              />
              Descending → Ascending
            </label>
          </div>
        </AccordionItem>

        {/* PATTERN */}
        <AccordionItem
          title="Pattern"
          open={openItem === "pattern"}
          onToggle={() => toggle("pattern")}
        >
          <div className="pattern-list">

            {allPatterns.map(p => (
              <div className="pattern-row" key={p.builtIn ? p.value : p.id}>
                <label className="pattern-label">
                  <input
                    type="radio"
                    checked={pattern === p.value}
                    onChange={() => setPattern(p.value)}
                  />
                  {p.value}
                </label>

                {!p.builtIn && (
                  <button
                    className="pattern-trash"
                    onClick={() => removePattern(p.id)}
                    title="Remove pattern"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            {/* Add new pattern */}
            <button
              className="pattern-add"
              onClick={addPattern}
              title="Add custom pattern"
            >
              ➕ Add pattern
            </button>

          </div>
        </AccordionItem>

        {/* METRONOME */}
        <AccordionItem
          title="Metronome"
          open={openItem === "metronome"}
          onToggle={() => toggle("metronome")}
        >
          <div className="control-group">
            <label>Level: {metronomeLevel}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={metronomeLevel}
              onChange={e => setMetronomeLevel(Number(e.target.value))}
            />

            <button
            className="mute-btn"
            onClick={() => setMetronomeMuted(m => !m)}
            title={metronomeMuted ? "Unmute" : "Mute"}
            >
            {metronomeMuted ? "🔇" : "🔊"}
            </button>

          </div>
        </AccordionItem>

      </div>

      <div className="main-content">
        {/* Your fretboard or scale visualizer */}
      </div>
    </div>
  );
}



