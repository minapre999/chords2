// sound/playNote.js
import { getAudioContext } from "../sound/AudioEngine.js";
import { getClosestSample, getSampleBuffer } from "../sound/GuitarSampler.js";

/**
 * Core note playback — immediate or scheduled.
 * startTime = null → plays immediately
 * startTime = number → scheduled playback
 */

 export function playNote(midi) {
  const audioCtx = getAudioContext();   // ← MUST be the first thing

  console.log("playNote called:", midi);
  console.log("AudioContext state:", audioCtx.state);

  if (audioCtx.state !== "running") {
    audioCtx.resume();
  }

  const closest = getClosestSample(midi);


  const buffer = getSampleBuffer(closest);

  console.log("Closest sample:", closest);
  console.log("Buffer from sampler:", buffer);

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

  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
console.log("Playback rate:", source.playbackRate.value);
  source.start();
}



/**
 * Alias for scheduled playback.
 * EXACT signature preserved.
 */
// export function playNoteAtTime(midi, startTime) {
//   return playNote(midi, startTime);
// }



 export function playNoteAtTime(midi, startTime) {
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

export function playChord(chord) {
  
  const audioCtx = audioCtxRef.current;
  if (!audioCtx) return;

  const shape = chord
  // activeChord = shape
  const startTime = audioCtx.currentTime + 0.02; // small scheduling buffer

  // 1. Create all sources FIRST
  const voices = shape.map((fret, stringIndex) => {
    if (fret === null) return null;

    const midi = tuning[stringIndex] + fret;

    const closest = getClosestSample(midi);
    const buffer = getSampleBuffer(closest);
    if (!buffer) return null;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const semitones = midi - closest;
    source.playbackRate.value = Math.pow(2, semitones / 12);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2);

    source.connect(gain);
    gain.connect(audioCtx.destination);

    return source;
  });

  // 2. Start ALL sources in a separate pass
  voices.forEach((source) => {
    if (source) source.start(startTime);
  });
}

/**
 * Strum a chord with a delay between notes.
 * direction = "down" (low→high) or "up" (high→low)
 * speed = seconds between notes (e.g., 0.02 for fast strum)
 */


export function playChordStrum(name, direction = "down") {
  const shape = CHORDS[name];
  const order =
    direction === "down"
      ? [...shape.keys()]            // 0 → 5
      : [...shape.keys()].reverse(); // 5 → 0

  order.forEach((stringIndex, i) => {
    const fret = shape[stringIndex];
    if (fret !== null) {
      const midi = tuning[stringIndex] + fret;
      setTimeout(() => playNote(midi), i * 40);
    }
  });
}
