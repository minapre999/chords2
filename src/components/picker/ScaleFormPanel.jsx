
  import React, { useState, useEffect } from "react";



export default function ScaleFormPanel(props) {

const {forceAll,  ...rest} = props

const [isOpen, setIsOpen] = useState(true);

  // console.log("PianoPanel component forceAll: ", forceAll, "isOpen:", isOpen, "setCFUI: ", setCFUI)




 // Respond to global force command
  useEffect(() => {
    if (forceAll === "open") setIsOpen(true);
    if (forceAll === "close") setIsOpen(false);
  }, [forceAll]);
  
  
const toggle = () => setIsOpen(prev => !prev);


 


//   const ClickPiano=(root)=>{
//     if(cfUI !== undefined) {
//       cfUI.root = root // this was previously set in FretboardSVG render
//       setChordRootUI(root)
//       }
//     if( scaleUI !== undefined) {
//       scaleUI.root = root
//       const clone = scaleUI.copy()
//       setScaleUI(clone)
//     }
//   }




 return (
  <div>Scale Forms</div>
)

}
