import { getAudioContext } from "./AudioEngine.js";
console.log("AudioEngine import:", getAudioContext);


const sampleBuffers = new Map();
const SAMPLE_FILES = [
  "A2.wav", "A3.wav", "A4.wav",
  "C3.wav", "C4.wav", "C5.wav", "C6.wav",
  "D3.wav", "D4.wav", "D5.wav", "D6.wav",
  "E2.wav"
];

function midiFromFilename(filename) {
  const name = filename.replace(".wav", "");
  const match = name.match(/^([A-G][b#]?)(\d)$/);

  if (!match) return null;

  const [, pitch, octave] = match;

  const SEMITONES = {
    C: 0, "C#": 1, Db: 1,
    D: 2, "D#": 3, Eb: 3,
    E: 4,
    F: 5, "F#": 6, Gb: 6,
    G: 7, "G#": 8, Ab: 8,
    A: 9, "A#": 10, Bb: 10,
    B: 11
  };

  return SEMITONES[pitch] + 12 * (parseInt(octave) + 1);
}






export function storeSample(midi, buffer) {
  // console.log("Storing sample:", midi, buffer);
  sampleBuffers.set(midi, buffer);
}

export function getSampleBuffer(midi) {
  return sampleBuffers.get(midi);
}

export function getClosestSample(midi) {
  const available = [...sampleBuffers.keys()].sort(
    (a, b) => Math.abs(a - midi) - Math.abs(b - midi)
  );
  return available[0];
}


  /**
 * Load a single sample file and store it under its MIDI number.
 */

  export async function loadSample(midi, url) {
  const audioCtx = getAudioContext();

  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
// console.log("Fetched URL:", url, "ArrayBuffer size:", arrayBuffer.byteLength);
  const audioBuffer = await new Promise((resolve, reject) => {
    audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
  });

  storeSample(midi, audioBuffer);
}


// export async function loadSample(midi, url) {
//   const audioCtx = getAudioContext();

//   console.log("Fetching sample:", url);

//   const res = await fetch(url);
//   console.log("Fetch response:", res.status, res.ok);

//   const arrayBuffer = await res.arrayBuffer();

//   try {
//     console.log("Decoding sample:", url);
//     const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
//     storeSample(midi, audioBuffer);
//     console.log("Decoded OK:", midi);
//   } catch (err) {
//     console.error("Decode failed for", url, err); // ❌ no audioBuffer reference here
//   }
// }


/**
 * Load multiple samples at once.
 * samples = { midiNumber: "url", midiNumber: "url", ... }
 */


export async function loadSamples() {
  console.log("Loading samples using filename-based MIDI mapping");

  for (const file of SAMPLE_FILES) {
    const midi = midiFromFilename(file);
    const url = `/samples/${file}`;

    console.log("→", file, "→ MIDI", midi);

    await loadSample(midi, url);
  }
}

