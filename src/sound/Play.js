// sound/PlayNote.js
import { getAudioContext } from "./AudioEngine.js";
import { getClosestSample, getSampleBuffer } from "./GuitarSampler.js";
import ChordForm from "../harmony/harmony-manager.js"
import Note from "/src/harmony/note.js"
 import dc from "../globals.js"
import {midiLookup} from "/src/harmony/core.js"
import  {RenderNote, RenderData} from "/src/render-notes.js"
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";


/**
 * Core note playback — immediate or scheduled.
 * startTime = null → plays immediately
 * startTime = number → scheduled playback
 */




   export function PlayNote(props) {

  const {sampler, noteName, duration="2n", time="+0.1"} = props

   if (!sampler || !sampler.loaded) {
    console.log("Sampler not ready — skipping note", noteName);
    return;
  }

  
  console.log("PlayNote: ",  {noteName, duration: duration, sampler: sampler, time})

        // sampler.triggerAttackRelease("A4", "2n", time);

        sampler.triggerAttackRelease(noteName, duration, time);


  // const closest = getClosestSample(midi);

}




/**
PlayNotes - takes either notes (Note objects) or noteNames object
 */

export function PlayNotes(props) {
  
  const {sampler, chordform: cf, duration} = props
    //  console.log("PlayChord: ", cf, sampler)
if(!notes && !nn) return;
let noteNames = nn
  if( !noteNames ) {
    noteNames = notes.map((n)=>n.noteNameWithBias("b"))
  }

    
    console.log("note names", {noteNames, samplerLoaded: sampler.loaded},)
    noteNames.forEach((noteName, i)=>{
          const time = `+${0.5 * i}`; // tiny stagger
                      const now = Tone.now()

          console.log("play note of chord: ", { noteName,duration, now })
         PlayNote({sampler, noteName, duration, time: now})
         Tone.Transport.start()
    })
    
}



/**
 * Play multiple notes at the same moment.
 * chord = array of MIDI numbers
 */

export function PlayChord(props) {
  
  const {sampler, chordform: cf, duration} = props
    //  console.log("PlayChord: ", cf, sampler)


    if( !cf) return
    const noteNames = cf.notes.map((n)=>n.noteNameWithBias("b"))
    console.log("chord notes", {noteNames, samplerLoaded: sampler.loaded},)
    noteNames.forEach((noteName, i)=>{
          const time = `+${0.5 * i}`; // tiny stagger
                      const now = Tone.now()

          console.log("play note of chord: ", { noteName,duration, now })
         PlayNote({sampler, noteName, duration, time: now})
         Tone.Transport.start()
    })
    
}

/**
 * Strum a chord with a delay between notes.
 * direction = "down" (low→high) or "up" (high→low)
 * speed = seconds between notes (e.g., 0.02 for fast strum)
 */


export function PlayChordStrum(name, direction = "down") {
  const shape = CHORDS[name];
  const order =
    direction === "down"
      ? [...shape.keys()]            // 0 → 5
      : [...shape.keys()].reverse(); // 5 → 0

  order.forEach((stringIndex, i) => {
    const fret = shape[stringIndex];
    if (fret !== null) {
      const midi = tuning[stringIndex] + fret;
      setTimeout(() => PlayNote(midi), i * 40);
    }
  });
}
