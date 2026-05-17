



import "/node_modules/vexflow/releases/vexflow-debug.js";


export function selectVexflowSlur( {slurId, container} ) {
//   const container = lsContainerRef.current;

// console.log("selectVexflowSlur", slurId, container)
  if (!container) return;

  // 1. Remove selected-slur from ALL slurs
  const allSlurs = container.querySelectorAll('g.vf-slur-group');
  allSlurs.forEach(g => g.classList.remove('selected-slur'));

  // 2. Add selected-slur to the one with matching slurId
  const target = container.querySelector(`g.vf-slur-group.${CSS.escape(slurId)}`);
  // console.log("target slur for selection: ", target, slurId)
  if (target) {
    target.classList.add('selected-slur');
  }
}



export function unselectVFSlurs(container) {
  if (!container) return;

  // Remove selected-slur from ALL slurs
  // console.log("unselectVFSlurs", container)
  const allSlurs = container.querySelectorAll('g.vf-slur-group');
  allSlurs.forEach(g => g.classList.remove('selected-slur'));
}



