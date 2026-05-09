
    // NOTE HITBOXES
    const hitGroup = ctx.openGroup();
    const bbox = vfNote.getBoundingBox();
    if (bbox) {
      console.log("bbox for note", id,bbox);

      const padding = 6;
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", bbox.getX() - padding);
      rect.setAttribute("y", bbox.getY() - padding);
      rect.setAttribute("width", bbox.getW() + padding * 2);
      rect.setAttribute("height", bbox.getH() + padding * 2);
      rect.setAttribute("fill", "transparent");

         // debugging
      // rect.setAttribute("fill", "rgba(186, 39, 164, 0.2)");
      // rect.setAttribute("stroke", "rgba(166, 18, 192, 0.32)");

      rect.setAttribute("pointer-events", "all");
      hitGroup.appendChild(rect);
    }
    ctx.closeGroup();

    // SELECTION
    if (selection?.type === "note" && selection.id === id) {
      g.classList.add("selected-note");
    }

    hitGroup.style.cursor = "pointer";


    
    // NOTE HITBOXES
    const hitGroup = ctx.openGroup();
    const bbox = vfNote.getBoundingBox();
    if (bbox) {
      console.log("bbox for note", id,bbox);

      const padding = 6;
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", bbox.getX() - padding);
      rect.setAttribute("y", bbox.getY() - padding);
      rect.setAttribute("width", bbox.getW() + padding * 2);
      rect.setAttribute("height", bbox.getH() + padding * 2);
      rect.setAttribute("fill", "transparent");

         // debugging
      // rect.setAttribute("fill", "rgba(186, 39, 164, 0.2)");
      // rect.setAttribute("stroke", "rgba(166, 18, 192, 0.32)");

      rect.setAttribute("pointer-events", "all");
      hitGroup.appendChild(rect);
    }
    ctx.closeGroup();

    // SELECTION
    if (selection?.type === "note" && selection.id === id) {
      g.classList.add("selected-note");
    }

    hitGroup.style.cursor = "pointer";


    // DRAG + CLICK HANDLER
    hitGroup.addEventListener("mousedown", e => {
      console.log("draw called", Date.now());
      e.preventDefault();

      if (noteInputMode) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setCaret({ measure: measureIdx, index: idx });
        return;
      }

      g.style.pointerEvents = "none";
      hitGroup.style.pointerEvents = "all";

      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;

      const onMove = ev => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!moved && Math.hypot(dx, dy) > 3) {
          moved = true;
          // onNoteSelect?.(id);
          onNoteDragStart(id, startX, startY, g);
        }
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        if (!moved) {
          onNoteSelect?.(id);
           moveCaretToNote(vfNote, measureIdx, idx); 
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });

    if (id) {
      noteElements.current.set(id, g);
    }

    g.style.pointerEvents = "none";
    hitGroup.style.pointerEvents = "all";
  });
