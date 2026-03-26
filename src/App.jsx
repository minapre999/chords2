import { useState, useEffect } from "react"
import "./globals.js"
import ChordModule from "/src/components/chord/ChordModule.jsx";
import ScaleModule from "/src/components/scale/ScaleModule.jsx";
import SettingsModule from "/src/components/settings/SettingsModule.jsx";
import LeadSheetModule from "/src/components/ls/LeadSheetModule.jsx";
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
/*
Lazy initialization

useState(() => { ... }) means:
  React calls the function only on the first render
  The returned value becomes the initial state
  On later renders, React does not call the function again  
This is more efficient than: useState(localStorage.getItem("showOpenStringsUI")) 
because that version reads from localStorage every render.
const saved = localStorage.getItem("showOpenStringsUI");
This returns:
    "true"
    "false"
    or null (if nothing saved yet)
localStorage always stores strings, never booleans.
return saved === null ? true : saved === "true";
Converts the stored string into a real boolean, with a default of true
*/ 
      const [showOpenStringsUI, setShowOpenStringsUI] = useState(() => {
              const saved = localStorage.getItem("showOpenStringsUI");
              return saved === null ? true : saved === "true";
            });
    useEffect(() => {  localStorage.setItem("showOpenStringsUI", showOpenStringsUI);
                   }, [showOpenStringsUI]);

                     // Headstock persistence
    const [showHeadstockUI, setShowHeadstockUI] = useState(() => {
      const saved = localStorage.getItem("showHeadstockUI");
      return saved === null ? false : saved === "true";
    });
    useEffect(() => {  localStorage.setItem("showHeadstockUI", showHeadstockUI);
        }, [showHeadstockUI]);


      const [stringColorUI, setStringColorUI] = useState(() => {
      const saved = localStorage.getItem("stringColorUI")
      return saved === null ? "silver" : saved 
    });
    useEffect(() => {  localStorage.setItem("stringColorUI", stringColorUI);
        }, [stringColorUI]);

  const [bassStringColorUI, setBassStringColorUI] = useState(() => {
      const saved = localStorage.getItem("bassStringColorUI")
      return saved === null ? "#e6d685" : saved 
    });
    useEffect(() => {  localStorage.setItem("bassStringColorUI", bassStringColorUI);
        }, [bassStringColorUI]);



    const [showInlaysUI, setShowInlaysUI] = useState(() => {
        const saved = localStorage.getItem("showInlaysUI");
        return saved === null ? true : saved === "true";
      });
    useEffect(() => {
          localStorage.setItem("showInlaysUI", showInlaysUI);
        }, [showInlaysUI]);


  return (

      <div className="app-container">
      <NavigationBar currentPage={page} setPage={setPage} />
      {/* <Toolbar /> */}

      {page === "chords" &&  
      <ChordModule  
        showOpenStringsUI={showOpenStringsUI}  setShowOpenStringsUI={setShowOpenStringsUI}
        showInlaysUI={showInlaysUI}  setShowInlaysUI={setShowInlaysUI}
        stringColorUI={stringColorUI} setStringColorUI={setStringColorUI}
        bassStringColorUI={bassStringColorUI} setBassStringColorUI={setBassStringColorUI}
        showHeadstockUI={showHeadstockUI} setShowHeadstockUI={setShowHeadstockUI}
        />}
      {page === "scales" && <ScaleModule />}
      {page === "lead-sheet" && <LeadSheetModule />}
      {page === "settings" && 
      <SettingsModule 
          showOpenStringsUI={showOpenStringsUI}  setShowOpenStringsUI={setShowOpenStringsUI}
          showInlaysUI={showInlaysUI}  setShowInlaysUI={setShowInlaysUI}
          stringColorUI={stringColorUI} setStringColorUI={setStringColorUI}
          bassStringColorUI={bassStringColorUI} setBassStringColorUI={setBassStringColorUI}
          showHeadstockUI={showHeadstockUI} setShowHeadstockUI={setShowHeadstockUI}
      />}
    </div>
  );


    // <div style={{ padding: 20 }}>
     
    // </div>
  
}
