
import { useState } from "react"
import "./ScaleControlPanel.css"
import ScaleRootPanel from "./scale-panels/ScaleRootPanel.jsx"
import ScaleModePanel from "./scale-panels/ScaleModePanel.jsx"
import ScaleFormPanel from "./scale-panels/ScaleFormPanel.jsx"
import ScalePositionPanel from "./scale-panels/ScalePositionPanel.jsx"

import AccordionItem from "./AccordionItem"

export default function ScalesPanel(props) {
      const [openItems, setOpenItems] = useState(new Set(["root"]));

 


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

