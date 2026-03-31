
import React, { useState, useEffect , useRef} from "react";
import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";

export default function ScaleModePanel(props) {

const {forceAll, scaleModeUI, setScaleModeUI, ...rest} = props
const [isOpen, setIsOpen] = useState(true);

  // console.log("PianoPanel component forceAll: ", forceAll, "isOpen:", isOpen, "setCFUI: ", setCFUI)

 // Respond to global force command
  useEffect(() => {
    if (forceAll === "open") setIsOpen(true);
    if (forceAll === "close") setIsOpen(false);
  }, [forceAll]);
  
  
const toggle = () => setIsOpen(prev => !prev);


const mode_names = dc.SCALE_MANAGER.activeDict.scaleNames()  // these come grouped, but not in order
const modeGroups = [
  mode_names.major,
  mode_names.melodic_minor,
  mode_names.harmonic_minor,
  mode_names.other,
  mode_names.arpeggio
];

const spId = "scale-mode-panel"
const spClass = "scale-mode-subpanel subpanel"

 return (
   scaleModeUI && ( 
  <>
     
  <div id={spId} className={spClass}>
    <div className="title-bar" onClick={toggle}>
    <div className="title">Scale</div>
    </div>

      {isOpen && (
        <div className="quality-picker-container picker-container">

          {modeGroups.map((group, idx) => (
            <div key={idx} className="chord-picker-group picker-group">
              {group.map(s => (
                <div
                  key={s}
                  className={`picker-group-item ${s == scaleModeUI ? "selected" : ""}`}
                  onClick={() => setScaleModeUI(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          ))}

        </div>
      )}


  </div>
</>
  ))

}
