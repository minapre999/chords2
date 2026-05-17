import { createContext, useContext, useState, useRef , useEffect} from "react";
import * as Tone from "tone";

export const ToneEngineContext = createContext();

export function ToneEngineProvider({ children, samplerRef }) {



  const [scaleSampler, setScaleSampler] = useState(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [samplerReady, setSamplerReady] = useState(false);


// debugging

useEffect(() => {
  window.samplerRef = samplerRef
}, [scaleSampler]);



const startAudio = async () => {
  if (audioStarted && samplerReady && scaleSampler) {
    return; // ⭐ Prevent multiple sampler creations
  }

  await Tone.start();
  setAudioStarted(true);

  return new Promise(resolve => {
    const s = new Tone.Sampler({
      urls: {
        E2: "E2.ogg",
        A2: "A2.ogg",
        D3: "D3.ogg",
        G3: "G3.ogg",
        B3: "B3.ogg",
        E4: "E4.ogg",
        A4: "A4.ogg",
        D5: "D5.ogg",
      },
      baseUrl: "/samples/guitar-acoustic/",
      onload: () => {
        console.log("Sampler loaded");
        setSamplerReady(true);
        resolve();
      }
    }).toDestination();

    samplerRef.current = s;
    setScaleSampler(s);
  });
};





//     // console.log("DIAG B — Creating Tone.Sampler...");
// const s = new Tone.Sampler({
//   urls: {
//     E2: "E2.ogg",
//     A2: "A2.ogg",
//     D3: "D3.ogg",
//     G3: "G3.ogg",
//     B3: "B3.ogg",
//     E4: "E4.ogg",
//     A4: "A4.ogg",
//     D5: "D5.ogg",
//   },
//   baseUrl: "/samples/guitar-acoustic/",
//   onload: () => {
//     console.log("Sampler loaded");
//     setSamplerReady(true);
//   }
// }).toDestination();




    // const s = new Tone.Sampler(
    //   {
    //     E2: "/samples/guitar-acoustic/E2.ogg",
    //     A2: "/samples/guitar-acoustic/A2.ogg",
    //     D3: "/samples/guitar-acoustic/D3.ogg",
    //     G3: "/samples/guitar-acoustic/G3.ogg",
    //     B3: "/samples/guitar-acoustic/B3.ogg",
    //     E4: "/samples/guitar-acoustic/E4.ogg",
    //     A4: "/samples/guitar-acoustic/A4.ogg",
    //     D5: "/samples/guitar-acoustic/D5.ogg",
    //   },
    //   () => {
    //     // console.log("DIAG C — Sampler loaded callback fired");
    //     setSamplerReady(true);
    //   }
    // ).toDestination();

    // console.log("setting sampler ref", s)

  //    if (!s || !s.loaded) {
  //   console.log("Sampler not ready — skipping setting samplerRef", );
  //   return;
  // }

  //   samplerRef.current = s;
  //   setScaleSampler(s);

  //   console.log("s.get('A4')", s.get("A4"));

  // };



  return (
    <ToneEngineContext.Provider value={{
      scaleSampler,
      samplerRef,
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
