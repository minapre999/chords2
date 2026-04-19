import { useState, useEffect } from "react";
import { patternsDB } from "../patternsDB";
import "../ControlPanel.css"
import "./ScaleSequencePanel.css"
import "./ScaleControlTab.css"
import * as Tone from "tone";



// Built-in patterns
const BUILT_IN_PATTERNS = [
  "sequential",
  "1-3",
  "1-2-3",
  "1-2-3-4",
  "1-3-2-4",
  "1-3-4-2",
  "1-5-7-4",
  "1-4-3-7"
];

export default function ScaleSequencePanel(props ) {

const {
  className="",
  noteValueUI,setNoteValueUI,
  tempoUI,   setTempoUI,
  swingUI,   setSwingUI,
  rhythmUI,   setRhythmUI,
  directionUI, setDirectionUI,
  patternUI,    setPatternUI,
  metronomeLevelUI,setMetronomeLevelUI,
  metronomeMutedUI,setMetronomeMutedUI,
  scaleSequenceUI, setScaleSequenceUI,
  ...rest
} = props



  const toggle = (name) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
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
        {/* <div className="col-12 col-md-4">
          <div className="grid-tile">
          <div className="grid-tile-header">Sequencing</div>
         <div className="grid-tile-body">

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={scaleSequenceUI}
          onChange={(e) => setScaleSequenceUI(e.target.checked)}
        />
        Enable scale sequencing
      </label>



          </div>
        </div>
      </div> */}
        {/* SCALE TEMPO */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
          <div className="grid-tile-header">Tempo</div>
         <div className="grid-tile-body">

            <div className="control-group">
              <label>BPM: {tempoUI}</label>
              <input
                type="range"
                min="40"
                max="240"
                value={tempoUI}
                onChange={e => {
                  Tone.Transport.bpm.value = e.target.value
                  setTempoUI(Number(e.target.value))}
                }
              />

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={noteValueUI === "quarter"}
                    onChange={() => setNoteValueUI("quarter")}
                  />
                  Quarter notes
                </label>

                <label>
                  <input
                    type="radio"
                    checked={noteValueUI === "eighth"}
                    onChange={() => setNoteValueUI("eighth")}
                  />
                  Eighth notes
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    





        <div className="col-12 col-md-4">
          <div className="grid-tile">
                <div className="grid-tile-header">Rhythm</div>
                  <div className="grid-tile-body">

                  <div className="radio-group">

                 <label>Swing: {swingUI * 100}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={swingUI*100}
                    onChange={e => {
                      const value = Number(e.target.value) / 100;   // ← convert string → number
                      Tone.Transport.swing = value ;           // ← now swing works continuously
                      setSwingUI(value );
                    }}
                  />





                    {/* <label>
                      <input
                        type="radio"
                        checked={rhythmUI === "straight"}
                        onChange={() => setRhythmUI("straight")}
                      />
                      Straight 8ths
                    </label>

                    <label>
                      <input
                        type="radio"
                        checked={rhythmUI === "triplets"}
                        onChange={() => setRhythmUI("triplets")}
                      />
                      Triplets
                  </label> */}
                </div>
            </div>
          </div>
        </div>
        {/* DIRECTION */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
               <div className="grid-tile-header">Direction</div>
                  <div className="grid-tile-body">


            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={directionUI === "asc"}
                   onChange={() =>{ console.log("directionUI is currently: ", directionUI, " setting directionUI to asc.")
                                    setDirectionUI("asc") } }
                />
                Ascending
              </label>

              <label>
                <input
                  type="radio"
                  checked={directionUI === "desc"}
                  onChange={() =>{ console.log("directionUI is currently: ", directionUI, " setting directionUI to desc.")
                                    setDirectionUI("desc") } }
                />
                Descending
              </label>

              <label>
                <input
                  type="radio"
                  checked={directionUI === "asc-desc"}
                  onChange={() => setDirectionUI("asc-desc")}
                />
                Ascending → Descending
              </label>

              <label>
                <input
                  type="radio"
                  checked={directionUI === "desc-asc"}
                  onChange={() => setDirectionUI("desc-asc")}
                />
                Descending → Ascending
              </label>
            </div>
          </div>
        </div>
    </div>
        {/* PATTERN */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
            <div className="grid-tile-header">Pattern</div>
                  <div className="grid-tile-body">

            <div className="pattern-list">
              {allPatterns.map(p => (
                <div className="pattern-row" key={p.builtIn ? p.value : p.id}>
                  <label className="pattern-label">
                    <input
                      type="radio"
                      checked={patternUI === p.value}
                      onChange={() => setPatternUI(p.value)}
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
</div>
        {/* METRONOME */}
        <div className="col-12 col-md-4">
          <div className="grid-tile">
             <div className="grid-tile-header">Metronome</div>
                  <div className="grid-tile-body">


            <div className="control-group">
              <label>Level: {metronomeLevelUI}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={metronomeLevelUI}
                onChange={e => setMetronomeLevelUI(Number(e.target.value))}
              />

              <button
                className={`mute-btn ${metronomeMutedUI ? "muted" : ""}`}
                onClick={() => setMetronomeMutedUI(m => !m)}
              >
                Metronome
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
