import React from "react";

export function InspectorPanel({ selected, leadSheet, onChange }) {
  if (!selected) {
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
        <strong>Inspector</strong>
        <div style={{ marginTop: 8 }}>Select a note or chord.</div>
      </div>
    );
  }

  if (selected.type === "note") {
    const bar = leadSheet.bars.find((b) => b.id === selected.barId);
    const note = bar?.melody.find((n) => n.id === selected.id);
    if (!note) return null;
    return <NoteInspector barId={bar.id} note={note} onChange={onChange} />;
  }

  if (selected.type === "chord") {
    const bar = leadSheet.bars.find((b) => b.id === selected.barId);
    const chord = bar?.chord;
    if (!chord) return null;
    return <ChordInspector barId={bar.id} chord={chord} onChange={onChange} />;
  }

  return null;
}

function NoteInspector({ barId, note, onChange }) {
  const update = (patch) => {
    onChange({ type: "note", barId, id: note.id, patch });
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
      <strong>Note</strong>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        <label>
          Pitch:
          <input
            value={note.pitch}
            onChange={(e) => update({ pitch: e.target.value })}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          Duration:
          <select
            value={note.duration}
            onChange={(e) => update({ duration: e.target.value })}
            style={{ marginLeft: 4 }}
          >
            <option value="4n">Quarter</option>
            <option value="8n">Eighth</option>
            <option value="2n">Half</option>
          </select>
        </label>
        <label>
          Start (beats):
          <input
            type="number"
            step="0.25"
            value={note.start}
            onChange={(e) => update({ start: parseFloat(e.target.value) })}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          String:
          <input
            type="number"
            min={1}
            max={6}
            value={note.string ?? ""}
            onChange={(e) => update({ string: Number(e.target.value) })}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          Fret:
          <input
            type="number"
            min={0}
            value={note.fret ?? ""}
            onChange={(e) => update({ fret: Number(e.target.value) })}
            style={{ marginLeft: 4 }}
          />
        </label>
      </div>
    </div>
  );
}

function ChordInspector({ barId, chord, onChange }) {
  const update = (patch) => {
    onChange({ type: "chord", barId, id: chord.id, patch });
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
      <strong>Chord</strong>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        <label>
          Root:
          <input
            value={chord.root}
            onChange={(e) => update({ root: e.target.value })}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          Quality:
          <input
            value={chord.quality}
            onChange={(e) => update({ quality: e.target.value })}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          Extensions (comma separated):
          <input
            value={chord.extensions?.join(",") ?? ""}
            onChange={(e) =>
              update({
                extensions: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            style={{ marginLeft: 4 }}
          />
        </label>
      </div>
    </div>
  );
}

