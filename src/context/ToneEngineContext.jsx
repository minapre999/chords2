import { createContext, useContext, useState, useRef } from "react";
import * as Tone from "tone";

export const ToneEngineContext = createContext();

export function ToneEngineProvider({ children }) {
  const samplerRef = useRef(null);

  const [scaleSampler, setScaleSampler] = useState(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [samplerReady, setSamplerReady] = useState(false);

  const startAudio = async () => {
    // console.log("DIAG A — startAudio() called");

    await Tone.start();
    setAudioStarted(true);

    // console.log("DIAG B — Creating Tone.Sampler...");

    const s = new Tone.Sampler(
      {
        E2: "/samples/guitar-acoustic/E2.ogg",
        A2: "/samples/guitar-acoustic/A2.ogg",
        D3: "/samples/guitar-acoustic/D3.ogg",
        G3: "/samples/guitar-acoustic/G3.ogg",
        B3: "/samples/guitar-acoustic/B3.ogg",
        E4: "/samples/guitar-acoustic/E4.ogg",
        A4: "/samples/guitar-acoustic/A4.ogg",
        D5: "/samples/guitar-acoustic/D5.ogg",
      },
      () => {
        // console.log("DIAG C — Sampler loaded callback fired");
        setSamplerReady(true);
      }
    ).toDestination();

//     const poly = new Tone.PolySynth(Tone.Sampler, {
//   urls: {
//     E2: "/samples/guitar-acoustic/E2.ogg",
//     A2: "/samples/guitar-acoustic/A2.ogg",
//     D3: "/samples/guitar-acoustic/D3.ogg",
//     G3: "/samples/guitar-acoustic/G3.ogg",
//     B3: "/samples/guitar-acoustic/B3.ogg",
//     E4: "/samples/guitar-acoustic/E4.ogg",
//     A4: "/samples/guitar-acoustic/A4.ogg",
//     D5: "/samples/guitar-acoustic/D5.ogg",
//   },
//   volume: +6,
// }).toDestination();



    // console.log("DIAG D — Sampler instance created:", s);

    samplerRef.current = s;
    setScaleSampler(s);
  };

  return (
    <ToneEngineContext.Provider value={{
      scaleSampler,
      samplerReady,
      startAudio,
      audioStarted
    }}>
      {children}
    </ToneEngineContext.Provider>
  );
}




export function useToneEngine() {
  return useContext(ToneEngineContext);
}
