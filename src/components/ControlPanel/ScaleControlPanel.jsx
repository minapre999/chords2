import { useState } from "react";
import ScaleSequencePanel from "./ScaleSequencePanel";
import ScalesPanel from "./ScalesPanel";
import "./ControlPanel.css"
import "./ScaleControlPanel.css"



export default function ScaleControlPanel({ children }) {
  const [openTop, setOpenTop] = useState(new Set(["scales", "sequence"]));

  const toggleTop = (name) => {
    setOpenTop(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div className="parent-layout">

    
      <div className="sub-panel-column">



        {/* TOP-LEVEL: SCALES */}
        <div className="top-accordion">
          <button
            className="top-accordion-header"
            onClick={() => toggleTop("scales")}
          >
            <span>Scales</span>
            <span className="chevron">{openTop.has("scales") ? "▾" : "▸"}</span>
          </button>

          {openTop.has("scales") && (

            <div className="top-accordion-body no-pad">
              <ScalesPanel />
            </div>
          )}
        </div>

        {/* TOP-LEVEL: SCALE SEQUENCE */}
        <div className="top-accordion">
          <button
            className="top-accordion-header"
            onClick={() => toggleTop("sequence")}
          >
            <span>Scale Sequence</span>
            <span className="chevron">{openTop.has("sequence") ? "▾" : "▸"}</span>
          </button>

          {openTop.has("sequence") && (
            <div className="top-accordion-body no-pad">
              <ScaleSequencePanel />
            </div>
          )}
        </div>

      </div>


        <div className="main-content">
        {children}
      </div>


    </div>
  );
}
