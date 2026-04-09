
import { useState } from "react"
import "./ScaleControlPanel.css"
import ScaleRootPanel from "./scale-panels/ScaleRootPanel.jsx"
import ScaleModePanel from "./scale-panels/ScaleModePanel.jsx"
import ScaleFormPanel from "./scale-panels/ScaleFormPanel.jsx"

import AccordionItem from "./AccordionItem"

export default function ScalesPanel(props) {
      const [openItems, setOpenItems] = useState(new Set(["root"]));

  const toggle = (name) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const openAll = () => {
    setOpenItems(new Set(["root", "scale", "form", "fret"]));
  };

  const closeAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 scale-grid">

        <div className="col-12 col-md-6">
          <ScaleRootPanel {...props} />
        </div>

        <div className="col-12 col-md-6">
                       <ScaleModePanel {...props} />
        </div>

        <div className="col-12 col-md-6">
          <div className="col-12 col-md-6">
                       <ScaleFormPanel {...props} />
        </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="scale-tile">
            <div className="scale-tile-header">Fret</div>
            <div className="scale-tile-body">
              {/* Fret controls */}
              Fret content…
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

