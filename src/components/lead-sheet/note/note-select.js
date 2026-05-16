import {vfNoteAddClass, vfNoteRemoveAllClass} from "./note-dom"

 export function selectVFNote( {container, noteId} ) {
  vfNoteAddClass({container, noteId, className: 'selected-note'})
}

 export function unselectVFNotes(container ){
  console.log("unselectVFNotes", (container))
  vfNoteRemoveAllClass({container, className: 'selected-note'})
}





