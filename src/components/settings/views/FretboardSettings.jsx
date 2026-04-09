import React, { useState, useEffect, useRef, useMemo } from "react"

import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx"
import "./FretboardSettings.css"
export default function FretboardSettings(props){

      const {   showOpenStringsUI, setShowOpenStringsUI,
                showInlaysUI,setShowInlaysUI,
                stringColorUI, setStringColorUI, 
                bassStringColorUI, setBassStringColorUI,
                showHeadstockUI,setShowHeadstockUI, 
                ...rest } = props

       // This runs automatically whenever the user toggles the show headstock checkbox.
        // useEffect(() => {
        //   localStorage.setItem("showHeadstockUI", showHeadstockUI);
        // }, [showHeadstockUI]);
        
        // This runs automatically whenever the user toggles the inlay checkbox.
        


return (
<div id="fb-set-wrapper">

    <div>

     {/* Headstock toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showHeadstockUI}
          onChange={(e) => setShowHeadstockUI(e.target.checked)}
        />
        Show headstock
      </label>


    {/* Open strings */}
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
            type="checkbox"
            checked={showOpenStringsUI}
            onChange={(e) => setShowOpenStringsUI(e.target.checked)}
            />
            Show open string names
        </label>
    </div>

 {/* Inlays */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showInlaysUI}
          onChange={(e) => {console.log("toolbox inlays"); 
            setShowInlaysUI(e.target.checked)}}
        />
        Show inlays
      </label>
    
     {/* String colours  - toolbar sends update to the parent */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Treble strings colour:
        <input
          type="color"
          value={stringColorUI}

          onChange={(e) => setStringColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Bass strings colour:
        <input
          type="color"
          value={bassStringColorUI}
          onChange={(e) => setBassStringColorUI(e.target.value)}
        />
      </label>

   


    <div />

<div className="fb-wrapper">
 <FretboardSVG
        {...props}
        cfUI={null}
      chordRootUI={null}
      width={1800*.66}
      height={220*.66}
      zoomScope="fretboard-settings"

    
    />

</div>
</div>
)

}

