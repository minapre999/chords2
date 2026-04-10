
import { useState } from "react"
import "./ScaleControlPanel.css"
import PianoPanel from "./chord-panels/PianoPanel.jsx"
import InversionPanel from "./chord-panels/InversionPanel.jsx"
import FormSSPanel from "./chord-panels/FormSSPanel.jsx"
import ChordQualityPanel from "./chord-panels/ChordQualityPanel.jsx"

// import ScalePositionPanel from "./scale-panels/ScalePositionPanel.jsx"

export default function ChordsPanel(props) {

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 scale-grid">

        <div className="col-12 col-md-6">   
          <div className="row">
            <PianoPanel {...props} />
            <InversionPanel {...props} />
            <FormSSPanel {...props} />
          </div>
        </div>

      <div className="col-12 col-md-6">
        <ChordQualityPanel {...props} />
      </div>

     </div>
  </div>
  );
}

