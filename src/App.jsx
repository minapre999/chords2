import { useState, useEffect } from "react"
import "./globals.js"
import ChordModule from "./components/fretboard/ChordModule.jsx";

import { loadSamples } from "./sound/GuitarSampler";



// ut the key is understanding that React always renders something first.
//  What you control is what it renders while you’re waiting.
// React cannot block rendering until data arrives.
// But you can control what it renders until the data is ready.
//So the real question becomes:
//“What should the UI show while the data loads?”



export default function App() {
  const [ready, setReady] = useState(false);

useEffect(() => {
  loadSamples({
    40: "/samples/E2.wav",
    45: "/samples/A2.wav",
    50: "/samples/D3.wav",
    55: "/samples/G3.wav",
    59: "/samples/B3.wav",
    64: "/samples/E4.wav",
  });
}, []);

 
  return (
    <div style={{ padding: 20 }}>
      <ChordModule/>
    </div>
  );
}
