import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef,   useLayoutEffect, } from "react";
import LeadSheetAutoFlow from "./LeadSheetAutoFlow";
import "./LeadSheetRenderer.css"
import {cursorPosRef} from "/src/components/lead-sheet/cursor/cursorRefs";
import { updateCursorOverlay } from "/src/components/lead-sheet/cursor/updateCursorOverlay";



export const measureRectsRef = { current: {} };




export default function LeadSheetRenderer(props) {
 const {
  cursorVisible, setCursorVisible, 
  cursorOverlayRef,
  dragPreview,
  dragRef,
          } = props

 
const [rowWidth, setRowWidth] = useState(800); // default
const lsContainerRef = useRef(null);






  // Preview transform effect stays as‑is
  useEffect(() => {
    if (!dragRef.current) {
      noteElements.current.forEach(g => g.removeAttribute("transform"));
      return;
    }

    if (!dragPreview) {
      isDragging.current = false;
      return;
    }

    const { noteId, semitones, durationSteps } = dragPreview;
    const g = noteElements.current.get(noteId);
    if (!g) return;

    const dy = semitones * -5;
    const dx = durationSteps * 30;

    g.setAttribute("transform", `translate(${dx}, ${dy})`);
  }, [dragPreview, dragRef]);











useEffect(() => {
  const container = lsContainerRef.current;
  if (!container) return;

  const onEnter = () => {
    // console.log("ENTER CONTAINER");
    setCursorVisible(true);
  };

  const onLeave = () => {
    // console.log("LEAVE CONTAINER");
    setCursorVisible(false);
  };



  container.addEventListener("mouseenter", onEnter);
  container.addEventListener("mouseleave", onLeave);

  return () => {
    container.removeEventListener("mouseenter", onEnter);
    container.removeEventListener("mouseleave", onLeave);
  };
}, []);




useLayoutEffect(() => {
  function updateWidth() {
    if (!lsContainerRef.current) return;
    const w = lsContainerRef.current.clientWidth;
    setRowWidth(Math.floor(w * 0.8) )
  }

  // run once immediately
  updateWidth();

  // listen for window resize
  window.addEventListener("resize", updateWidth);

  return () => {
    window.removeEventListener("resize", updateWidth);
  };
}, []);






  
  return (
   <>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <LeadSheetAutoFlow
      {...props}
      rowWidth={rowWidth}
        className="ls-container"
        ref={lsContainerRef}
        style={{ width: "100%", minHeight: "600px" }}
      
      />
    </div>

  <div id="note-input-cursor" ref={cursorOverlayRef} ></div>


 </>   
  );
}