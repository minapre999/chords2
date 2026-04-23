import React from "react";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";

export function TransportBar({ leadSheet }) {
  const { startAudio, scaleSampler, samplerReady } = useToneEngine();

  const handlePlay = async () => {
    await startAudio();
    if (!samplerReady || !scaleSampler) return;

    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    let barIndex = 0;
    for (const bar of leadSheet.bars) {
      const barStart = barIndex * 4;

      // chords
      if (bar.chord?.voicing) {
        const t = barStart;
        bar.chord.voicing.forEach((pos) => {
          const pitch = stringFretToPitch(pos.string, pos.fret); // you implement
          scaleSampler.triggerAttackRelease(pitch, "2n", t);
        });
      }

      // melody
      for (const note of bar.melody) {
        const t = barStart + note.start;
        scaleSampler.triggerAttackRelease(note.pitch, note.duration, t);
      }

      barIndex++;
    }

    Tone.Transport.start();
  };

  const handleStop = () => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleStop}>Stop</button>
      <span style={{ marginLeft: 12 }}>
        {leadSheet.title} — {leadSheet.key} — {leadSheet.tempo} BPM
      </span>
    </div>
  );
}

// stub – replace with your real mapping
function stringFretToPitch(string, fret) {
  // e.g. standard tuning, quick hack
  const open = ["E2", "A2", "D3", "G3", "B3", "E4"];
  // you can map via a pitch library or your existing logic
  return open[6 - string]; // placeholder
}
