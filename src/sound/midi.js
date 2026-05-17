
// convention
// name or noteName = C4, B3, etc
// letter or noteLetter = C, B, etc
// octave or noteOctave = 4, 3, etc


// Helpers
export const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const ENHARMONIC_EQUIV = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb"
};



export function midiToNoteName(midi, preferFlats = true) {
  const noteIndex = midi % 12;              // 60 -> 0 (C), 61 -> 1 (C#), ...
  const octave = Math.floor(midi / 12) - 1; // 60 -> 4, 69 -> 4, etc.

  let base = NOTE_NAMES_SHARP[noteIndex];

  if (preferFlats && ENHARMONIC_EQUIV[base]) {
    base = ENHARMONIC_EQUIV[base];
  }

  return { name: `${base}${octave}`, base, octave };
}

