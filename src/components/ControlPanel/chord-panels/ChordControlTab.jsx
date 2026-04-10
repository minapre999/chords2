import React, { useState,useEffect } from "react";
import "/src/globals.js";
import ChordsPanel from "./ChordsPanel.jsx"
 import ChordSequencePanel from "./ChordSequencePanel.jsx"
import "../ControlPanel.css"
import "./ChordControlTab.css"


export default function ChordControlTab(props
  ) {
    const [activeTab, setActiveTab] = useState("chord");

  return (
    <div className='chords-panel'>

      {/* TAB BAR */}
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === "chord" ? "active" : ""}`}
          onClick={() => setActiveTab("chord")}
        >
          Chord
        </button>

        <button
          className={`tab ${activeTab === "sequence" ? "active" : ""}`}
          onClick={() => setActiveTab("sequence")}
        >
          Sequence
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "chord" && (
          <ChordsPanel {...props} />
              )}
        {activeTab === "sequence" && (
          <ChordSequencePanel {...props} />
            )}
      </div>

    </div>
  );

}

