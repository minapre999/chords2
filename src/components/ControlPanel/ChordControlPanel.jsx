import React, { useState,useEffect } from "react";
import "./ControlPanel.css"
import "./ChordControlPanel.css"
import "/src/globals.js";
 import {Chord}  from "/src/harmony/harmony-manager.js"
 import AccordionItem from "./AccordionItem"

import PianoPanel from "./chord-panels/PianoPanel.jsx"
import ChordQualityPanel from "./chord-panels/ChordQualityPanel"
import FormSSPanel from "./chord-panels/FormSSPanel.jsx"
import InversionPanel from "./chord-panels/InversionPanel.jsx"
  
 


export default function ChordControlPanel(props) {
  // Option A: Only one accordion item open at a time
  const [openItem, setOpenItem] = useState("tempo");
  const toggle = (name) => setOpenItem(prev => (prev === name ? null : name));


  return (
    <div className="layout">
      <div className="accordion">

        {/* Chord Root */}
        <AccordionItem
          title="Root"
          open={openItem === "chord-root"}
          onToggle={() => toggle("chord-root")}
        >
         <PianoPanel  {...props}  />
        </AccordionItem>

  {/* CHORD QUALITY */}
        <AccordionItem
          title="Quality"
          open={openItem === "quality"}
          onToggle={() => toggle("quality")}
        >
         
       <ChordQualityPanel  {...props}  />
        </AccordionItem>

  {/* CHORD FORM */}
        <AccordionItem
          title="Form"
          open={openItem === "form"}
          onToggle={() => toggle("form")}
        >
         
       <FormSSPanel  {...props}  />
        </AccordionItem>

        {/* INVERSION */}
        <AccordionItem
          title="Inversion"
          open={openItem === "inversion"}
          onToggle={() => toggle("inversion")}
        >
         
       <InversionPanel  {...props}  />
        </AccordionItem>

       

      </div>

    
    </div>
  );
}

