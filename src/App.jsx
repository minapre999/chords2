import { useState, useEffect } from "react"
import "./globals.js"
import ChordModule from "/src/components/chord/ChordModule.jsx";
import ScaleModule from "/src/components/scale/ScaleModule.jsx";
import SettingsModule from "/src/components/settings/SettingsModule.jsx";
import NavigationBar from "/src/components/navbar/navigation-bar.jsx";
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

   const [page, setPage] = useState("chords");

  return (

      <div className="app-container">
      <NavigationBar currentPage={page} setPage={setPage} />
      {/* <Toolbar /> */}

      {page === "chords" &&  <ChordModule/>}
      {page === "scales" && <ScaleModule />}
      {page === "settings" && <SettingsModule />}
    </div>
  );


    // <div style={{ padding: 20 }}>
     
    // </div>
  
}
