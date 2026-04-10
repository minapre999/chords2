import React, { useState,useEffect } from "react";
import "./ControlPanel.css"
import "./ChordControlPanel.css"
import "/src/globals.js";
 import {Chord}  from "/src/harmony/harmony-manager.js"
 import AccordionItem from "./AccordionItem"

import PianoPanel from "./chord-panels/PianoPanel.jsx"
import ChordQualityPanel from "./chord-panels/ChordQualityPanel"
import FormSSPanel from "./chord-panels/FormSSPanel.jsx"
import InversionPanel from "./chord-panels/InversionPanel.jsx"
import ChordsPanel from "./ChordsPanel.jsx"
 import ChordSequencePanel from "./ChordSequencePanel.jsx"



export default function ChordControlPanel(props
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

