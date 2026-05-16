import {vfNoteAddClass, vfNoteRemoveAllClass} from "./note-dom"



 export function highlightVFNote( {container, noteId} ) {
  // console.log("highlight note: ", {container, noteId})
  vfNoteAddClass({container, noteId, className: 'highlight-note'})
}

 export function unhighlightVFNotes(container ){
    // console.log("unhighlightVFNotes: ", {container})
  vfNoteRemoveAllClass({container, className: 'highlight-note'})
}


