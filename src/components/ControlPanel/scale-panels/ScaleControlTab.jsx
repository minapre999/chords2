import { useState } from "react";
import ScaleSequencePanel from "./ScaleSequencePanel";
import ScalesPanel from "./ScalesPanel";
import "../ControlPanel.css"
import "./ScaleControlTab.css"



export default function ScaleControlTab(props
  ) {
    const [activeTab, setActiveTab] = useState("scale");

  return (
    <div className='scales-panel'>

      {/* TAB BAR */}
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === "scale" ? "active" : ""}`}
          onClick={() => setActiveTab("scale")}
        >
          Scale
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
        {activeTab === "scale" && (
          <ScalesPanel {...props} />
              )}
        {activeTab === "sequence" && (
          <ScaleSequencePanel {...props} />
            )}
      </div>

    </div>
  );

}
