import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";



export default function FloatingPalette(props) {
  const {
    children,
    defaultX = 40,
    defaultY = 40,
    defaultWidth = 300,
    pos,
    setPos,
    onClose,   // ⭐ NEW
  } = props;

  if (!pos || !setPos) {
    console.error("FloatingPalette requires pos and setPos props");
    return null;
  }

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    // Prevent dragging when clicking the close button
    if (e.target.dataset.close === "true") return;

    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pos]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: defaultWidth,
        zIndex: 9999,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        userSelect: "none",
      }}
    >
      {/* HEADER WITH CLOSE BUTTON */}
      <div
        onMouseDown={onMouseDown}
        style={{
          cursor: "grab",
          padding: "4px 6px",
          background: "#eee",
          borderRadius: "4px",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Palette</span>

        <button
          data-close="true" // ⭐ prevents drag start
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          style={{
            cursor: "pointer",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            padding: "0 4px",
          }}
        >
          ✕
        </button>
      </div>

      {children}
    </div>,
    document.body
  );
}
