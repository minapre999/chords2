import { useState, useEffect } from "react";
import AccordionItem from "./AccordionItem";
import { patternsDB } from "./patternsDB";
import "./ControlPanel.css"
import "./ScaleSequencePanel.css"



// Built-in patterns
const BUILT_IN_PATTERNS = [
  "1-2-3-4",
  "1-2-3",
  "1-3-2-4",
  "1-3-4-2",
  "1-5-7-4",
  "1-4-3-7"
];

export default function ScaleSequencePanel({
  className="",
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
  // MULTI-OPEN ACCORDION
  const [openItems, setOpenItems] = useState(new Set(["tempo"]));

  const toggle = (name) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const openAll = () => {
    setOpenItems(new Set(["tempo", "rhythm", "direction", "pattern", "metronome"]));
  };

  const closeAll = () => {
    setOpenItems(new Set());
  };

  // Custom patterns from Dexie
  const [customPatterns, setCustomPatterns] = useState([]);

  useEffect(() => {
    patternsDB.patterns.toArray().then(setCustomPatterns);
  }, []);

  const addPattern = async () => {
    const value = prompt("Enter a custom pattern (e.g., 1-4-2-7)");
    if (!value) return;

    const id = await patternsDB.patterns.add({ value });
    setCustomPatterns(prev => [...prev, { id, value }]);
  };

  const removePattern = async (id) => {
    await patternsDB.patterns.delete(id);
    setCustomPatterns(prev => prev.filter(p => p.id !== id));
  };

  const allPatterns = [
    ...BUILT_IN_PATTERNS.map(p => ({ id: null, value: p, builtIn: true })),
    ...customPatterns.map(p => ({ id: p.id, value: p.value, builtIn: false }))
  ];

  return (
        <div className={`accordion sequence-panel ${className}`}>
    {/* <div className="layout"> */}
      <div className="accordion">

        {/* OPEN / CLOSE ALL CONTROLS */}
        <div className="accordion-controls">
          <button className="accordion-btn" onClick={openAll} title="Open all">
            ▾
          </button>
          <button className="accordion-btn" onClick={closeAll} title="Close all">
            ▴
          </button>
        </div>

        {/* TEMPO */}
        <AccordionItem
          title="Scale tempo"
          open={openItems.has("tempo")}
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
          open={openItems.has("rhythm")}
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
          open={openItems.has("direction")}
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
          open={openItems.has("pattern")}
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
          open={openItems.has("metronome")}
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
              className={`mute-btn ${metronomeMuted ? "muted" : ""}`}
              onClick={() => setMetronomeMuted(m => !m)}
              title={metronomeMuted ? "Unmute" : "Mute"}
            >
              <svg className="speaker-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
                {!metronomeMuted && (
                  <>
                    <path d="M14 9.23v1.77c1.19.69 2 1.97 2 3.5s-.81 2.81-2 3.5v1.77c2.33-.82 4-3.04 4-5.27s-1.67-4.45-4-5.27z" fill="currentColor"/>
                    <path d="M14 3v1.77c3.39 1.24 6 4.47 6 8.23s-2.61 6.99-6 8.23V23c4.66-1.33 8-5.64 8-10.77S18.66 4.33 14 3z" fill="currentColor"/>
                  </>
                )}
              </svg>

              {metronomeMuted && <div className="speaker-slash"></div>}
            </button>
          </div>
        </AccordionItem>

      </div>

      <div className="main-content">
        {/* fretboard */}
      </div>
    {/* </div> */}
  </div>
  );
}
