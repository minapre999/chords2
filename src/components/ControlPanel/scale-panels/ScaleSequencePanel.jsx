import { useState, useEffect } from "react";
import { patternsDB } from "../patternsDB";
import "../ControlPanel.css"
import "./ScaleSequencePanel.css"
import "./ScaleControlTab.css"



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
    <div className="container-fluid px-0">
      <div className="row g-3 scale-grid">

        {/* SCALE TEMPO */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
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
          </div>
        </div>

        {/* RHYTHM */}
        <div className="col-12 col-md-4">
  <div className="grid-tile">
    <div className="grid-tile-header">Scale tempo</div>
    <div className="grid-tile-body">
      {/* tempo controls */}
    </div>
  </div>
</div>





        <div className="col-12 col-md-4">
          <div className="grid-tile">
                <div className="grid-tile-header">Rhythm</div>
                  <div className="grid-tile-body">

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
            </div>
          </div>
        </div>
        {/* DIRECTION */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
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
          </div>
        </div>

        {/* PATTERN */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
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
          </div>
        </div>

        {/* METRONOME */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
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
              >
                Metronome
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
