
import "./ScaleControlPanel.css"

import AccordionItem from "./AccordionItem";
import { useState } from "react";

export default function ScalesPanel({
     className = "",
     }) {
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
          <div className="scale-tile">
            <div className="scale-tile-header">Root</div>
            <div className="scale-tile-body">
              {/* Root controls */}
              Root content…
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="scale-tile">
            <div className="scale-tile-header">Scale</div>
            <div className="scale-tile-body">
              {/* Scale controls */}
              Scale content…
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="scale-tile">
            <div className="scale-tile-header">Form</div>
            <div className="scale-tile-body">
              {/* Form controls */}
              Form content…
            </div>
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

