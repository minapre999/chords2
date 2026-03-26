
import React, { useState, useEffect, useRef, useMemo } from "react";
import "./note-mode.css"

/* note mode widget for the toolbar */

  const modes = [
    { id: "note", label: "Note Names" },
    { id: "interval", label: "Chord Intervals" },
    { id: "fingering", label: "Fingering" },
    { id: "none", label: "Nothing" }
  ];

export default function NoteModeWidget({
     noteMode, 
     setNoteMode }) {
  const [open, setOpen] = useState(false);

  const modes = [
    { id: "note", label: "Note Names" },
    { id: "interval", label: "Chord Intervals" },
    { id: "fingering", label: "Fingering" },
    { id: "none", label: "Nothing" }
  ];

const current = modes.find(m => m.id === noteMode);

  return (
    <div className="fb-display-widget">
      <button className="fb-display-btn" onClick={() => setOpen(!open)}>
        <i className="fa fa-eye"></i>
        <span className="fb-display-label">{current.label}</span>
        <i className="fa fa-caret-down caret"></i>
      </button>

      {open && (
        <div className="fb-display-menu">
          {modes.map(m => (
            <div
              key={m.id}
              className={m.id === noteMode ? "selected" : ""}
              onClick={() => {
                setNoteMode(m.id);
                setOpen(false);
              }}
            >
              {m.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );

}
