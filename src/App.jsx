import { useState, useEffect,  } from "react"
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import * as Tone from "tone";
import HomePage from "/src/components/pages/HomePage.jsx";
import ScalePage from "/src/components/pages/ScalePage.jsx";
import ChordPage from "/src/components/pages/ChordPage.jsx";
import SettingsPage from "/src/components/pages/SettingsPage.jsx";
import LeadSheetPage from "/src/components/pages/LeadSheetPage.jsx";
import NavigationBar from "/src/components/navbar/NavigationBar.jsx";

import "./globals.js"
import SettingsModule from "/src/components/settings/SettingsModule.jsx";
import LeadSheetModule from "/src/components/ls/LeadSheetModule.jsx";
import { loadSamples } from "./sound/GuitarSampler";
import "@fortawesome/fontawesome-free/css/all.min.css";
import TuningManager from "/src/harmony/tuning-manager.js"
import "./App.css"




 function AppLayout() {

  return (
    <div className="app-layout">
      <NavigationBar />
      <Outlet />
    </div>
  );
}



function App() {



// ut the key is understanding that React always renders something first.
//  What you control is what it renders while you’re waiting.
// React cannot block rendering until data arrives.
// But you can control what it renders until the data is ready.
//So the real question becomes:
//“What should the UI show while the data loads?”



  const [ready, setReady] = useState(false);
  
  const [scaleSampler, setScaleSampler] = useState(null);


useEffect(() => {


const loadSampler = async () => {
    await Tone.start();

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
      () => console.log("Sampler loaded")
    ).toDestination();

    s.volume.value = +6;

    setScaleSampler(s);
  };

 loadSampler()

}, []);



//     const [page, setPage] = useState("chords");
// /*
// Lazy initialization

// useState(() => { ... }) means:
//   React calls the function only on the first render
//   The returned value becomes the initial state
//   On later renders, React does not call the function again  
// This is more efficient than: useState(localStorage.getItem("showOpenStringsUI")) 
// because that version reads from localStorage every render.
// const saved = localStorage.getItem("showOpenStringsUI");
// This returns:
//     "true"
//     "false"
//     or null (if nothing saved yet)
// localStorage always stores strings, never booleans.
// return saved === null ? true : saved === "true";
// Converts the stored string into a real boolean, with a default of true
// */ 
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

const [renderDataUI, setRenderDataUI] = useState(null);

//   /*
//   setRenderNotes: eact requires you to create a new array when updating state. Never mutate the existing one.
// adding an item: setRenderNotes(prev => [...prev, newRN]);
// removing an item: setRenderNotes(prev => prev.filter(n => n.id !== idToRemove));
// updating an item: setRenderNotes(prev => prev.map(n => n.id === updated.id ? updated : n)
// replace entire array: setRenderNotes(newArray);
// );
//   */




useEffect(() => {
      let cancelled = false;   // 1. Track whether the component is still mounted
    
      async function init() {
        await dc.TUNING_MANAGER.load_tuning();  // 2. Wait for the real load
        if (!cancelled) setReady(true);             // 3. Only update state if mounted
      }
    
      init();                                       // 4. Kick off the async load
      return () => { cancelled = true };            // 5. Cleanup: mark as unmounted
    }, []);
      


const fbProps = {
  renderDataUI: renderDataUI,
  setRenderDataUI: setRenderDataUI,
  showOpenStringsUI: showOpenStringsUI,
  setShowOpenStringsUI: setShowOpenStringsUI,
  showInlaysUI: showInlaysUI,
 setShowInlaysUI: setShowInlaysUI,
  stringColorUI:stringColorUI,
  setStringColorUI:setStringColorUI,
bassStringColorUI:bassStringColorUI,
   setBassStringColorUI:setBassStringColorUI,
showHeadstockUI:        showHeadstockUI,
  setShowHeadstockUI: setShowHeadstockUI,
                 
}

const audioProps = {
  scaleSampler: scaleSampler, setScaleSampler: setScaleSampler
}



  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/chords"
            element={
              <ChordPage
              {...fbProps} {...audioProps}
                />
            }
          />

          <Route
            path="/scales"
            element={
              <ScalePage
                {...fbProps} {...audioProps}
                  />
            }
          />

          <Route path="/lead-sheet" element={<LeadSheetPage />} />

          <Route
            path="/settings"
            element={
              <SettingsPage
              {...fbProps} {...audioProps}
               
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );

  
}

export default App;





  