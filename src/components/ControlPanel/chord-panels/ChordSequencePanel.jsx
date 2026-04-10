import { useState, useEffect } from "react";
import "../ControlPanel.css"



export default function ChordSequencePanel(
    props) {
  // MULTI-OPEN ACCORDION

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 scale-grid">
      <div className="col-12 col-md-4">
          <div className="grid-tile"></div>
          chord sequence
          </div>

      </div>
    </div>
  );
}
