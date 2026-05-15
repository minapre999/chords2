

 export function selectVexflowNote( {container, noteId} ) {
  if (!container) return;

  // 1. Remove selected-note from ALL stavenotes
  const allNotes = container.querySelectorAll('g.vf-stavenote');

    // console.log("select vex flow note", {noteId, allNotes})


  allNotes.forEach(g => g.classList.remove('selected-note'));

  // 2. Add selected-note to the one with matching id
  const target = container.querySelector(`g.vf-stavenote#${CSS.escape(noteId)}`);
  if (target) {
    console.log({target})
    target.classList.add('selected-note');
  }
}

 export function unselectVexflowNotes(container ){
  if (!container) return;

  // 1. Remove selected-note from ALL stavenotes
  const allNotes = container.querySelectorAll('g.vf-stavenote');
  allNotes.forEach(g => g.classList.remove('selected-note'));
}
