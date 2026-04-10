
import { useState } from "react"
import ScaleRootPanel from "./ScaleRootPanel.jsx"
import ScaleModePanel from "./ScaleModePanel.jsx"
import ScaleFormPanel from "./ScaleFormPanel.jsx"
import ScalePositionPanel from "./ScalePositionPanel.jsx"



export default function ScalesPanel(props) {

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 scale-grid">

        <div className="col-12 col-md-6">   
          <div className="row">
            <ScaleRootPanel {...props} />
            <ScalePositionPanel {...props} />
            <ScaleFormPanel {...props} />
          </div>
        </div>

      <div className="col-12 col-md-6">
        <ScaleModePanel {...props} />
      </div>

     </div>
  </div>
  );
}

