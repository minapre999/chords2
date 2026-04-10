
import  "./AccordionItem.css"


export default function AccordionItem({ title, children, open, onToggle }) {
  return (
    <div className={`accordion-item ${open ? "open" : ""}`}>
      <button className="accordion-header" onClick={onToggle}>
        <span>{title}</span>
        <span className="chevron">{open ? "▾" : "▸"}</span>
      </button>

      <div className="accordion-body">
        {children}
      </div>
    </div>
  );
}
