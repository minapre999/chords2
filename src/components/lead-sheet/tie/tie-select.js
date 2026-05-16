

import "/node_modules/vexflow/releases/vexflow-debug.js";


export function selectVexflowTie( {tieId, container} ) {
//   const container = lsContainerRef.current;

// console.log("selectVexflowTie", tieId, container)
  if (!container) return;

  // 1. Remove selected-tie from ALL ties
  const allTies = container.querySelectorAll('g.vf-tie-group');
  allTies.forEach(g => g.classList.remove('selected-tie'));

  // 2. Add selected-tie to the one with matching tieId
  const target = container.querySelector(`g.vf-tie-group.${CSS.escape(tieId)}`);
  // console.log("target tie for selection: ", target, tieId)
  if (target) {
    target.classList.add('selected-tie');
  }
}



export function unselectVFTies(container) {
  if (!container) return;

  // Remove selected-tie from ALL ties
  console.log("unselectVFTies", container)
  const allTies = container.querySelectorAll('g.vf-tie-group');
  allTies.forEach(g => g.classList.remove('selected-tie'));
}

