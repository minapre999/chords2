


export function drawSlurs({
  noteLookup,
  leadSheet,
  selection,
  setSelection,
  lsContainerRef,
  slurHitLayerRef,
  slurCurveLayerRef,
  
}) {
  const svgList = lsContainerRef.current?.querySelectorAll("svg");
  const svg = svgList?.[svgList.length - 1];
  if (!svg) return;

  //
  // --- CREATE OR ATTACH CURVE LAYER ---
  //
  let curveLayer = slurCurveLayerRef.current;
  if (!curveLayer || !curveLayer.isConnected) {
    curveLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    curveLayer.setAttribute("id", "slur-curve-layer");
    svg.appendChild(curveLayer);
    slurCurveLayerRef.current = curveLayer;
  }

  // Clear old curves
  while (curveLayer.firstChild) {
    curveLayer.removeChild(curveLayer.firstChild);
  }

  //
  // --- CREATE OR ATTACH HIT LAYER ---
  //
  let hitLayer = slurHitLayerRef.current;
  if (!hitLayer || !hitLayer.isConnected) {
    hitLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hitLayer.setAttribute("id", "slur-hit-layer");
    // hitLayer.style.pointerEvents = "all";
    hitLayer.style.pointerEvents = "none";

    svg.appendChild(hitLayer);
    slurHitLayerRef.current = hitLayer;
  }

  // Clear old hitboxes
  while (hitLayer.firstChild) {
    hitLayer.removeChild(hitLayer.firstChild);
  }

  //
  // --- DRAW EACH SLUR ---
  //
  leadSheet.slurs.forEach(slur => {
    const start = noteLookup.get(`${slur.startMeasure}:${slur.startIndex}`);
    const end   = noteLookup.get(`${slur.endMeasure}:${slur.endIndex}`);
    if (!start || !end) return;

    const isSelected = selection?.type === "slur" && selection.id === slur.id;

    const x1 = start.vfNote.getAbsoluteX();
    const y1 = start.vfNote.getYs()[0];

    const x2 = end.vfNote.getAbsoluteX();
    const y2 = end.vfNote.getYs()[0];

    // Horizontal curvature
    const c1x = x1 + (x2 - x1) * 0.33;
    const c2x = x1 + (x2 - x1) * 0.66;

    // Determine slur direction based on stems
    const stemUpStart = start.vfNote.getStemDirection() === 1;
    const stemUpEnd   = end.vfNote.getStemDirection() === 1;

    // If both stems up → slur above, else below
    const slurAbove = stemUpStart && stemUpEnd;

    // Vertical curvature
    const offset = 20;
    const c1y = slurAbove ? y1 + offset : y1 - offset;
    const c2y = slurAbove ? y2 + offset : y2 - offset;



    //
    // --- DRAW CURVE AS SVG PATH ---
    //
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
    );
    path.setAttribute("stroke", isSelected ? "dodgerblue" : "black");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", isSelected ? 2 : 1);

    curveLayer.appendChild(path);

    //
    // --- HITBOX ---
    //
const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect");

hit.setAttribute("x", Math.min(x1, x2));
hit.setAttribute("width", Math.abs(x2 - x1));

// thin strip below the curve
const hitHeight = 8;
const hitYOffset = 4;
const topLineY = Math.max(y1, y2);

hit.setAttribute("y", topLineY + hitYOffset);
hit.setAttribute("height", hitHeight);

hit.setAttribute("fill", "transparent");

// critical:
hit.style.pointerEvents = "all";
hit.style.cursor = "pointer";   // ← THIS restores the pointer cursor

hit.addEventListener("pointerdown", e => {
  e.stopPropagation();
  setSelection({ type: "slur", id: slur.id });
});

hitLayer.appendChild(hit);

  }); // slurs.forEach
} // DRAW SLURS
