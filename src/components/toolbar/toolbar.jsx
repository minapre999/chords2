import React, { useState, useEffect, useRef, useMemo } from "react"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "bootstrap/dist/css/bootstrap.min.css"

import ChordTools from "/src/components/toolbar/toolbar-pages/chord-tools.jsx";
import ScaleTools from "/src/components/toolbar/toolbar-pages/scale-tools.jsx";
import SettingsTools from "/src/components/toolbar/toolbar-pages/settings-tools.jsx";
import ZoomControls from "/src/components/toolbar/toolbar-global/zoom-controls.jsx"
import ColorControls from "/src/components/toolbar/toolbar-global/color-controls.jsx"
import HeadstockToggle from "/src/components/toolbar/toolbar-global/headstock-toggle.jsx"


import "./toolbar.css";

export default function Toolbar({ 
  page,
...props 
 
 }) {
  return (
    <div className="toolbar">

      {/* GLOBAL LEFT */}
     

      <div className="toolbar-left">

        <div className="toolbar-group">
        <ZoomControls {...props }/>
        {/* <ColorControls {...props } /> */}
          {/* <HeadstockToggle {...props }  /> */}
        </div>
      </div>

      <div className="toolbar-divider" />

    <div className="toolbar-group">
      {/* PAGE-SPECIFIC CENTER */}
        <div className="toolbar-center">
          {page === "chords" && <ChordTools {...props} />}
          {page === "scales" && <ScaleTools {...props} />}
          {page === "settings" && <SettingsTools {...props} />}
        </div>
      </div>

      {/* GLOBAL RIGHT */}
      <div className="toolbar-right">
      </div>

    </div>
  );
}
