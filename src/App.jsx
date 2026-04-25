import { useState, useEffect,  } from "react"
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import * as Tone from "tone";
import HomePage from "/src/components/pages/HomePage.jsx";
import ScalePage from "/src/components/pages/ScalePage.jsx";
import ChordPage from "/src/components/pages/ChordPage.jsx";
import SettingsPage from "/src/components/pages/SettingsPage.jsx";
import LeadSheetPage from "/src/components/pages/LeadSheetPage.jsx";
import NavigationBar from "/src/components/navbar/NavigationBar.jsx";
import {ToneEngineProvider} from "/src/context/ToneEngineContext.jsx"
import "./globals.js"
import SettingsModule from "/src/components/settings/SettingsModule.jsx";
import LeadSheetModule from "/src/components/ls/LeadSheetModule.jsx";
import { loadSamples } from "./sound/GuitarSampler";
import "@fortawesome/fontawesome-free/css/all.min.css";
import TuningManager from "/src/harmony/tuning-manager.js"
import "./App.css"





// Component that listens for route changes
function RouteChangeListener(props) {

  const location = useLocation();
  // const [pageRenderData, setPageRenderData] = useState({scales: null, })

  useEffect(() => {
    // console.log("Page changed to:", location.pathname);
    if(location.pathname = "/scales" ) {
   
    }
    

    // You can trigger analytics, scroll to top, etc. here
    // window.scrollTo(0, 0);
  }, [location]); // Runs every time the location changes

  return null; // This component doesn't render anything
}




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
  
// const [scaleSampler, setScaleSampler] = useState(null);
const [showHarmonyNotesUI, setShowHarmonyNotesUI] = useState( true) // show root, third, etc in different colours

    /*                                        
    arrFillColorUI - five element array of fill colors for default, root, third, fifth, seventh notes
  arrFontColorUI - five element array of text colors for default, root, third, fifth, seventh notes
  arrstrokeolorUI - five element array of stroke colors for default, root, third, fifth, seventh notes
  arrWidthUI - five element array of note circle widths for default, root, third, fifth, seventh notes
*/


// useEffect(() => {

// const loadSampler = async () => {
//     await Tone.start();

//     const s = new Tone.Sampler(
//       {
//         E2: "/samples/guitar-acoustic/E2.ogg",
//         A2: "/samples/guitar-acoustic/A2.ogg",
//         D3: "/samples/guitar-acoustic/D3.ogg",
//         G3: "/samples/guitar-acoustic/G3.ogg",
//         B3: "/samples/guitar-acoustic/B3.ogg",
//         E4: "/samples/guitar-acoustic/E4.ogg",
//         A4: "/samples/guitar-acoustic/A4.ogg",
//         D5: "/samples/guitar-acoustic/D5.ogg",

//       },
//       () => console.log("Sampler loaded")
//     ).toDestination();

//     s.volume.value = +6;

//     setScaleSampler(s);
//   };

//  loadSampler()

// }, []);



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

        // each page must have it's own renderDataUI to avoid leakage of state from one page to another
// const [renderDataUI, setRenderDataUI] = useState(null);


const [arrWidthUI, setArrWidthUI] = useState(() => {
  const saved = localStorage.getItem("arrWidthUI");
  return saved ? JSON.parse(saved) : [15, 15, 15, 15, 15];
});

useEffect(() => {
  localStorage.setItem("arrWidthUI", JSON.stringify(arrWidthUI));
}, [arrWidthUI]);


const [arrFillColorUI, setArrFillColorUI] = useState(() => {
  const saved = localStorage.getItem("arrFillColorUI");
  return saved ? JSON.parse(saved) : [ 'gray', 'gray', 'gray', 'gray', 'gray'] ;
});
useEffect(() => {
  localStorage.setItem("arrFillColorUI", JSON.stringify(arrFillColorUI));
}, [arrFillColorUI]);

const [arrStrokeColorUI, setArrStrokeColorUI] = useState(() => {
  const saved = localStorage.getItem("arrStrokeColorUI");
  return saved ? JSON.parse(saved) : [ 'black', 'black', 'black', 'black', 'black'] ;
});
useEffect(() => {
  localStorage.setItem("arrStrokeColorUI", JSON.stringify(arrStrokeColorUI));
}, [arrStrokeColorUI]);

const [arrFontColorUI, setarrFontColorUI] = useState(() => {
  const saved = localStorage.getItem("arrFontColorUI");
  return saved ? JSON.parse(saved) : [ 'white', 'white', 'white', 'white', 'white'] ;
});
useEffect(() => {
  localStorage.setItem("arrFontColorUI", JSON.stringify(arrFontColorUI));
}, [arrFontColorUI]);


const [arrFontSizeUI, setArrFontSizeUI] = useState(() => {
  const saved = localStorage.getItem("arrFontSizeUI");
  return saved ? JSON.parse(saved) : [ 12, 12, 12, 12, 12]  ;
});
useEffect(() => {
  localStorage.setItem("arrFontSizeUI", JSON.stringify(arrFontSizeUI));
}, [arrFontSizeUI]);



const [activeFillColorUI, setActiveFillColorUI] = useState(() => {
  const saved = localStorage.getItem("activeFillColorUI");
  return saved ? saved : 'red';
});
useEffect(() => {
  localStorage.setItem("activeFillColorUI", activeFillColorUI);
}, [activeFillColorUI]);


const [activeFontColorUI, setActiveFontColorUI] = useState(() => {
  const saved = localStorage.getItem("activeFontColorUI");
  return saved ? saved : 'black';
});
useEffect(() => {
  localStorage.setItem("activeFontColorUI", activeFontColorUI);
}, [activeFontColorUI]);


const [activeFontSizeUI, setActiveFontSizeUI] = useState(() => {
  const saved = localStorage.getItem("activeFontSizeUI");
  return saved ? saved : 18;
});
useEffect(() => {
  localStorage.setItem("activeFontSizeUI", activeFontSizeUI);
}, [activeFontSizeUI]);


const [strokeWidthUI, setStrokeWidthUI] = useState(() => {
  const saved = localStorage.getItem("strokeWidthUI");
  return saved ? saved : 2;
});
useEffect(() => {
  localStorage.setItem("strokeWidthUI", strokeWidthUI);
}, [strokeWidthUI]);


const [activeStrokeColorUI, setActiveStrokeColorUI] = useState(() => {
  const saved = localStorage.getItem("activeStrokeColorUI");
  return saved ? saved : 'black';
});
useEffect(() => {
  localStorage.setItem("activeStrokeColorUI", activeStrokeColorUI);
}, [activeStrokeColorUI]);


const [activeStrokeWidthUI, setActiveStrokeWidthUI] = useState(() => {
  const saved = localStorage.getItem("activeStrokeWidthUI");
  return saved ? saved : 3;
});
useEffect(() => {
  localStorage.setItem("activeStrokeWidthUI", activeStrokeWidthUI);
}, [activeStrokeWidthUI]);


const [activeWidthUI, setActiveWidthUI] = useState(() => {
  const saved = localStorage.getItem("activeWidthUI");
  return saved ? saved : 22;
});
useEffect(() => {
  localStorage.setItem("activeWidthUI", activeWidthUI);
}, [activeWidthUI]);




const [rootFillColorUI, setRootFillColorUI] = useState(() => {
  const saved = localStorage.getItem("rootFillColorUI");
  return saved ? saved : 'black';
});
useEffect(() => {
  localStorage.setItem("rootFillColorUI", rootFillColorUI);
}, [rootFillColorUI]);

const [rootFontColorUI, setRootFontColorUI] = useState(() => {
  const saved = localStorage.getItem("rootFontColorUI");
  return saved ? saved : 'white';
});
useEffect(() => {
  localStorage.setItem("rootFontColorUI", rootFontColorUI);
}, [rootFontColorUI]);


const [thirdFillColorUI, setThirdFillColorUI] = useState(() => {
  const saved = localStorage.getItem("thirdFillColorUI");
  return saved ? saved : 'red';
});
useEffect(() => {
  localStorage.setItem("thirdFillColorUI", thirdFillColorUI);
}, [thirdFillColorUI]);

const [thirdFontColorUI, setThirdFontColorUI] = useState(() => {
  const saved = localStorage.getItem("thirdFontColorUI");
  return saved ? saved : 'white';
});
useEffect(() => {
  localStorage.setItem("thirdFontColorUI", thirdFontColorUI);
}, [thirdFontColorUI]);




const [fifthFillColorUI, setFifthFillColorUI] = useState(() => {
  const saved = localStorage.getItem("fifthFillColorUI");
  return saved ? saved : 'black';
});
useEffect(() => {
  localStorage.setItem("fifthFillColorUI", fifthFillColorUI);
}, [fifthFillColorUI]);

const [fifthFontColorUI, setFifthFontColorUI] = useState(() => {
  const saved = localStorage.getItem("fifthFontColorUI");
  return saved ? saved : 'white';
});
useEffect(() => {
  localStorage.setItem("fifthFontColorUI", fifthFontColorUI);
}, [fifthFontColorUI]);



const [seventhFillColorUI, setSeventhFillColorUI] = useState(() => {
  const saved = localStorage.getItem("seventhFillColorUI");
  return saved ? saved : 'green';
});
useEffect(() => {
  localStorage.setItem("seventhFillColorUI", seventhFillColorUI);
}, [seventhFillColorUI]);

const [seventhFontColorUI, setSeventhFontColorUI] = useState(() => {
  const saved = localStorage.getItem("seventhFontColorUI");
  return saved ? saved : 'white';
});
useEffect(() => {
  localStorage.setItem("seventhFontColorUI", seventhFontColorUI);
}, [seventhFontColorUI]);



const [currentNote, setCurrentNote] = useState(null)




//   /*
//   setRenderNotes: eact requires you to create a new array when updating state. Never mutate the existing one.
// adding an item: setRenderNotes(prev => [...prev, newRN]);
// removing an item: setRenderNotes(prev => prev.filter(n => n.id !== idToRemove));
// updating an item: setRenderNotes(prev => prev.map(n => n.id === updated.id ? updated : n)
// replace entire array: setRenderNotes(newArray);
// );
//   */




  useEffect(() => {
    let cancelled = false;

    async function init() {
      await dc.TUNING_MANAGER.load_tuning();
      if (!cancelled) setReady(true);
    }

    init();
    return () => { cancelled = true };
  }, []);

  if (!ready) {
    return <div>Loading tuning…</div>;
  }




    

const fbProps = {
// renderDataUI: renderDataUI, setRenderDataUI: setRenderDataUI,
showOpenStringsUI: showOpenStringsUI, setShowOpenStringsUI: setShowOpenStringsUI,
showInlaysUI: showInlaysUI, setShowInlaysUI: setShowInlaysUI,
stringColorUI: stringColorUI, setStringColorUI:setStringColorUI,
bassStringColorUI: bassStringColorUI, setBassStringColorUI:setBassStringColorUI,
showHeadstockUI:  showHeadstockUI, setShowHeadstockUI: setShowHeadstockUI,
  // notes
arrFillColorUI: arrFillColorUI, setArrFillColorUI: setArrFillColorUI,
arrFontSizeUI: arrFontSizeUI, setArrFontSizeUI: setArrFontSizeUI,
arrFontColorUI: arrFontColorUI, setarrFontColorUI: setarrFontColorUI,
arrStrokeColorUI: arrStrokeColorUI, setArrStrokeColorUI: setArrStrokeColorUI,
strokeWidthUI: strokeWidthUI, setStrokeWidthUI: setStrokeWidthUI,
arrWidthUI: arrWidthUI, setArrWidthUI: setArrWidthUI,
activeFontSizeUI: activeFontSizeUI, setActiveFontSizeUI: setActiveFontSizeUI,
activeFillColorUI: activeFillColorUI, setActiveFillColorUI: setActiveFillColorUI,
activeFontColorUI: activeFontColorUI, setActiveFontColorUI: setActiveFontColorUI,
activeStrokeColorUI: activeStrokeColorUI, setActiveStrokeColorUI: setActiveStrokeColorUI,
activeStrokeWidthUI: activeStrokeWidthUI, setActiveStrokeWidthUI: setActiveStrokeWidthUI,
activeWidthUI: activeWidthUI, setActiveWidthUI: setActiveWidthUI,
showHarmonyNotesUI : showHarmonyNotesUI, setShowHarmonyNotesUI: setShowHarmonyNotesUI,
rootFillColorUI: rootFillColorUI, setRootFillColorUI: setRootFillColorUI,
rootFontColorUI: rootFontColorUI, setRootFontColorUI: setRootFontColorUI,
thirdFillColorUI: thirdFillColorUI, setThirdFillColorUI: setThirdFillColorUI,
thirdFontColorUI: thirdFontColorUI, setThirdFontColorUI: setThirdFontColorUI,
fifthFillColorUI: fifthFillColorUI, setFifthFillColorUI: setFifthFillColorUI,
fifthFontColorUI: fifthFontColorUI, setFifthFontColorUI: setFifthFontColorUI,
seventhFillColorUI: seventhFillColorUI, setSeventhFillColorUI: setSeventhFillColorUI,
seventhFontColorUI: seventhFontColorUI, setSeventhFontColorUI: setSeventhFontColorUI,
currentNote: currentNote, setCurrentNote: setCurrentNote,
}

// const audioProps = {
//   scaleSampler: scaleSampler, setScaleSampler: setScaleSampler
// }



  return (
  <ToneEngineProvider>
    <BrowserRouter>
       {/* This will listen for route changes globally */}
      {/* <RouteChangeListener 
       {...fbProps}   {...audioProps}/> */}


      <Routes>
        {/* Layout wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/chords"
            element={
              <ChordPage
              {...fbProps}
              //  {...audioProps}
                />
            }
          />

          <Route
            path="/scales"
            element={
              <ScalePage
                {...fbProps} 
                // {...audioProps}
                  />
            }
          />

          <Route path="/lead-sheet" 
            element={
              <LeadSheetPage 
               {...fbProps} 
              />} />

          <Route
            path="/settings"
            element={
              <SettingsPage
              {...fbProps} 
              // {...audioProps}
               
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
 </ToneEngineProvider>
  );

  
}

export default App;





  