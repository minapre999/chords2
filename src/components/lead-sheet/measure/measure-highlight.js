





 export function highlightVFMeasure( { container, measureId} ) {


   if (!container) return;

   const svg = container.querySelector(`svg.${measureId}`);
//    console.log("highlightVFMeasure", {measureId, container, svg})
if (!svg) return;

const target = svg.querySelector("rect.min-staff");
if (!target) return;


  if (target) {
    // console.log({target})
    target.classList.add("highlight-measure");
  }
}


 export function unhighlightVFMeasure( {container, measureId} ) {
  if (!container) return;

    const svg = container.querySelector(`svg.${measureId}`);
if (!svg) return;

const target = svg.querySelector("rect.min-staff.highlight-measure");
if (!target) return;

  if (target) {
    // console.log({target})
    target.classList.remove("highlight-measure");
  }
 
}



 export function unhighlightAllVFMeasures( container ){
    // console.log("unhighlightAllVFMeasures", {container})

  if (!container) return;
  const allNotes = container.querySelectorAll('rect.min-staff.highlight-measure');
  allNotes.forEach(g => g.classList.remove("highlight-measure"));
}





