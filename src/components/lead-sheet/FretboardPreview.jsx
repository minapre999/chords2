import React from "react";
// import FretboardSVG from "../your/fretboard/component";

export function FretboardPreview({ selected, leadSheet, onChange }) {
  if (!selected) {
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
        <strong>Fretboard</strong>
        <div style={{ marginTop: 8 }}>Select a note or chord.</div>
      </div>
    );
  }

  const handleFretClick = (string, fret) => {
    if (selected.type === "note") {
      onChange({
        type: "note",
        barId: selected.barId,
        id: selected.id,
        patch: { string, fret },
      });
    }

    if (selected.type === "chord") {
      const bar = leadSheet.bars.find((b) => b.id === selected.barId);
      const chord = bar?.chord;
      if (!chord) return;

      const nextVoicing = [...(chord.voicing ?? []), { string, fret }];
      onChange({
        type: "chord",
        barId: selected.barId,
        id: selected.id,
        patch: { voicing: nextVoicing },
      });
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 8 }}>
      <strong>Fretboard</strong>
      <div style={{ marginTop: 8 }}>
        {/* Replace this with your real fretboard component */}
        <div
          style={{
            height: 120,
            background: "#fafafa",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#666",
          }}
        >
          Fretboard placeholder — wire your FretboardSVG here and call handleFretClick(string, fret)
        </div>
      </div>
    </div>
  );
}
