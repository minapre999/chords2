export function updateCursorLedgerLines(pos, stave, spacing) {
  if (!stave) return;

  const ledgers = document.getElementById("cursor-ledgers");
  if (!ledgers) return;

  // clear previous ledger lines
  ledgers.innerHTML = "";

  const topY = stave.getYForLine(0);
  const bottomY = stave.getYForLine(4);

  let ly;

  //
  // ABOVE
  //
  ly = topY - spacing;
  if (pos.y < topY) {
    while (ly > pos.y) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(pos.x - 24));
      line.setAttribute("x2", String(pos.x + 2));
      line.setAttribute("y1", String(ly));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke-width", "1.5");
      ledgers.appendChild(line);

      ly -= spacing;
    }
  }

  //
  // BELOW
  //
  ly = bottomY;
  if (pos.y > bottomY) {
    while (ly < pos.y) {
      const y = ly + spacing;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(pos.x - 24));
      line.setAttribute("x2", String(pos.x + 2));
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
      line.setAttribute("stroke-width", "1.5");
      ledgers.appendChild(line);

      ly += spacing;
    }
  }
}
