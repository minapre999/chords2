export function ensureCursorOverlay(renderer) {
  const ctx = renderer.getContext();
  const wrapperSvg = ctx.svg;

  // VexFlow's main translated group
  const systemGroup = wrapperSvg.querySelector("g");
  if (!systemGroup) return;

  let cursor = systemGroup.querySelector("#note-input-cursor");
  if (!cursor) {
    cursor = document.createElementNS("http://www.w3.org/2000/svg", "g");
    cursor.setAttribute("id", "note-input-cursor");
    cursor.setAttribute("pointer-events", "none");
    cursor.setAttribute("stroke", "#00aaff");
    cursor.setAttribute("fill", "#00aaff");

    const ledgers = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ledgers.setAttribute("id", "cursor-ledgers");
    ledgers.setAttribute("stroke", "#00aaff");
    ledgers.setAttribute("fill", "none");
    cursor.appendChild(ledgers);

    const glyph = document.createElementNS("http://www.w3.org/2000/svg", "g");
    glyph.setAttribute("id", "cursor-glyph");
    glyph.setAttribute("fill", "#00aaff");
    glyph.setAttribute("stroke", "#00aaff");
    cursor.appendChild(glyph);

    systemGroup.appendChild(cursor);
  }
}
