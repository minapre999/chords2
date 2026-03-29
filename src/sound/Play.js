// sound/PlayNote.js
import { getAudioContext } from "./AudioEngine.js";
import { getClosestSample, getSampleBuffer } from "./GuitarSampler.js";
import ChordForm from "../harmony/harmony-manager.js"
import Note from "/src/harmony/note.js"
 import dc from "../globals.js"
import {midiLookup} from "/src/harmony/core.js"
/**
 * Core note playback — immediate or scheduled.
 * startTime = null → plays immediately
 * startTime = number → scheduled playback
 */

 export default function PlayNote(midi, duration = 1.0) {

  // console.log("PlayNote: ", midi)

  const audioCtx = getAudioContext();   // ← MUST be the first thing

  //   console.log("PlayNote called:", midi);
  //   console.log("AudioContext state:", audioCtx.state);

  if (audioCtx.state !== "running") {
    audioCtx.resume();
  }

  const closest = getClosestSample(midi);

  const buffer = getSampleBuffer(closest);

  //   console.log("Closest sample:", closest);
  //   console.log("Buffer from sampler:", buffer);

  if (!buffer) {
    console.warn("No buffer found for", midi);
    return;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const semitones = midi - closest;
  source.playbackRate.value = Math.pow(2, semitones / 12);

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 1;

  // 🔥 Fade‑out envelope to avoid clicks
  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(1, now);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // console.log("Playback rate:", source.playbackRate.value);

  source.start();
  source.stop(now + duration);   // 🔥 Hard stop after duration
}




/**
 * Alias for scheduled playback.
 * EXACT signature preserved.
 */
// export function PlayNoteAtTime(midi, startTime) {
//   return PlayNote(midi, startTime);
// }



 export function PlayNoteAtTime(midi, startTime) {
  const audioCtx = audioCtxRef.current;
  if (!audioCtx) return;

  if (audioCtx.state !== "running") audioCtx.resume();

  const closest = getClosestSample(midi);
  const buffer = getSampleBuffer(closest);
  if (!buffer) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const semitones = midi - closest;
  source.playbackRate.value = Math.pow(2, semitones / 12);

  const gain = audioCtx.createGain();

  // ⭐ Use the SAME startTime for the envelope
  gain.gain.setValueAtTime(1, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2);

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start(startTime);
}



/**
 * Play multiple notes at the same moment.
 * chord = array of MIDI numbers
 */

export function PlayChord(cf) {
  
    //  console.log("PlayChord: ", cf)


    if( cf == null) return
    
    cf.notes.forEach((n)=>{
        const name = n.noteNameWithBias("b")
        const midi = midiLookup[name]
        //  console.log("PlayChord name: ", name, "midi: ", midi)
         PlayNote(midi)
    })
    
    
//   const audioCtx = audioCtxRef.current;
//   if (!audioCtx) return;

//   const shape = chord
//   // activeChord = shape
//   const startTime = audioCtx.currentTime + 0.02; // small scheduling buffer

//   // 1. Create all sources FIRST
//   const voices = shape.map((fret, stringIndex) => {
//     if (fret === null) return null;

//     const midi = tuning[stringIndex] + fret;

//     const closest = getClosestSample(midi);
//     const buffer = getSampleBuffer(closest);
//     if (!buffer) return null;

//     const source = audioCtx.createBufferSource();
//     source.buffer = buffer;

//     const semitones = midi - closest;
//     source.playbackRate.value = Math.pow(2, semitones / 12);

//     const gain = audioCtx.createGain();
//     gain.gain.setValueAtTime(1, startTime);
//     gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2);

//     source.connect(gain);
//     gain.connect(audioCtx.destination);

//     return source;
//   });

//   // 2. Start ALL sources in a separate pass
//   voices.forEach((source) => {
//     if (source) source.start(startTime);
//   });
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
