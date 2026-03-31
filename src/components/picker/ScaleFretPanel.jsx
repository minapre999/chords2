
import React, { useState, useEffect , useRef} from "react";
import "/src/globals.js"
import Scale, { ScaleDictionary } from "/src/harmony/scale-manager";

export default function ScaleFretPanel(props) {

const {forceAll, scaleRootUI, scaleQualityUI, scaleModeUI, scaleFormUI,
       setScaleFormUI, ...rest} = props
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

const spId = "scale-fret-panel"
const spClass = "scale-fret-subpanel subpanel"

 return (
   scaleModeUI && ( 
  <>
     
  <div id={spId} className={spClass}>
    <div className="title-bar" onClick={toggle}>
       <div className="title">Fret</div>
    </div>

      {isOpen && (
        <div className="fret-picker-container picker-container">

           <div class='fretboard'>
              <div class='fret fret_1 '><span>1</span></div>  
              <div class='fret fret_2 '><span>2</span></div>  
              <div class='fret fret_3 '><span>3</span></div>  
              <div class='fret fret_4  '><span>4</span></div>  
              <div class='fret fret_5 '><span>5</span></div>  
              <div class='fret fret_6 '><span>6</span></div>  
              <div class='fret fret_7  '><span>7</span></div>  
              <div class='fret fret_8 '><span>8</span></div>  
              <div class='fret fret_9  '><span>9</span></div>  
              <div class='fret fret_10 '><span>10</span></div>  
              <div class='fret fret_11  '><span>11</span></div>  
              <div class='fret fret_12 '><span>12</span></div>  
              <div class='fret fret_13 '><span>13</span></div> 
          </div>
        </div>
      )}

</div>
  
</>
  ))

}
