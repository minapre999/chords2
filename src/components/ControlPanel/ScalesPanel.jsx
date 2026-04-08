
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
    
    <div className={`accordion scales-panel ${className}`}>
      {/* OPEN/CLOSE ALL */}
      <div className="accordion-controls">
        <button className="accordion-btn" onClick={openAll} title="Open all">▾</button>
        <button className="accordion-btn" onClick={closeAll} title="Close all">▴</button>
      </div>

      {/* ROOT */}
      <AccordionItem
        title="Root"
        open={openItems.has("root")}
        onToggle={() => toggle("root")}
      >
        <div className="control-group">
          {/* your root controls here */}
          Root content…
        </div>
      </AccordionItem>

      {/* SCALE */}
      <AccordionItem
        title="Scale"
        open={openItems.has("scale")}
        onToggle={() => toggle("scale")}
      >
        <div className="control-group">
          {/* your scale controls here */}
          Scale content…
        </div>
      </AccordionItem>

      {/* FORM */}
      <AccordionItem
        title="Form"
        open={openItems.has("form")}
        onToggle={() => toggle("form")}
      >
        <div className="control-group">
          {/* your form controls here */}
          Form content…
        </div>
      </AccordionItem>

      {/* FRET */}
      <AccordionItem
        title="Fret"
        open={openItems.has("fret")}
        onToggle={() => toggle("fret")}
      >
        <div className="control-group">
          {/* your fret controls here */}
          Fret content…
        </div>
      </AccordionItem>

    </div>
  );
}

