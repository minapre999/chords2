





 export function vfNoteAddClass( {container, noteId, className} ) {
  if (!container) return;

  const target = container.querySelector(`g.vf-stavenote#${CSS.escape(noteId)}`);
  if (target) {
    // console.log({target})
    target.classList.add(className);
  }
}


 export function vfNoteRemoveClass( {container, noteId, className} ) {
  if (!container) return;

  const target = container.querySelector(`g.vf-stavenote#${CSS.escape(noteId)}`);
  if (target) {
    // console.log({target})
    target.classList.remove(className);
  }
}



 export function vfNoteRemoveAllClass({ container, className} ){
  if (!container) return;
// console.log("vfNoteRemoveAllClass", {container, className})
  const allNotes = container.querySelectorAll('g.vf-stavenote');
  allNotes.forEach(g => g.classList.remove(className));
}




export function noteHitBoxWithId( {container, noteId, className} ) {
    return container.querySelector(`g.vf-stavenote#${CSS.escape( `hitbox-${noteId}` )}`);
    }



 export function noteHitBoxAddClass( {container, noteId, className} ) {
  if (!container) return;

  const id = `hitbox-${noteId}`
  const target = container.querySelector(`g.vf-stavenote#${CSS.escape(id)}`);
  if (target) {
    // console.log({target})
    target.classList.add(className);
  }
}

 export function noteHitBoxRemoveClass( {container, noteId, className} ) {
  if (!container) return;

  const id = `hitbox-${noteId}`
  const target = container.querySelector(`g.vf-stavenote#${CSS.escape(id)}`);
  if (target) {
    // console.log({target})
    target.classList.add(className);
  }
}

 export function noteHitBoxRemoveAllClass( {container, className} ) {
  if (!container) return;

  // 1. Remove classname from ALL hit boxes
  const allNotes = container.querySelectorAll('rect.note-hitbox');
  allNotes.forEach(g => g.classList.remove(className));
}


