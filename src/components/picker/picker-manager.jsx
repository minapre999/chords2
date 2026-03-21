import { useState, useEffect, useRef } from "react";
import { jsPanel } from "jspanel4";
import ReactDOM from "react-dom/client";
import "jspanel4/dist/jspanel.css";
import "./picker-manager.css"
import "../../globals.js";
 import {Chord}  from "../../harmony/harmony-manager.js"


function PianoPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "piano-sp";
  const spClass = "root-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Root</div>
          </div>

 {activeSubPanelUI === spId && (
          <div className="root-picker-container picker-container">
            <div className="keyboard">
              <div className="key white-key c selected"><span>C</span></div>
              <div className="key black-key c_sharp"><span>C#</span></div>
              <div className="key white-key d"><span>D</span></div>
              <div className="key black-key d_sharp"><span>D#</span></div>
              <div className="key white-key e"><span>E</span></div>
              <div className="key white-key f"><span>F</span></div>
              <div className="key black-key f_sharp"><span>F#</span></div>
              <div className="key white-key g"><span>G</span></div>
              <div className="key black-key g_sharp"><span>G#</span></div>
              <div className="key white-key a"><span>A</span></div>
              <div className="key black-key a_sharp"><span>A#</span></div>
              <div className="key white-key b"><span>B</span></div>
            </div>
          </div>
            )}
        </div>
    
    </>
  );
}


function QualityPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "quality-sp";
  const spClass = "chord-quality-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  const chords = dc.HARMONY_MANAGER.chords
  const major = chords.filter(function (ch) {
                return ch.isMajor() == true
            })
  const dominant = chords.filter(function (ch) {
                return ch.isDominant() == true
            })
  const minor = chords.filter(function (ch) {
                return ch.isMinor() === true
            })


  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Quality</div>
          </div>

 {activeSubPanelUI === spId && (
          <div className="quality-picker-container picker-container">
            <div id="major" className="chord-picker-group picker-group">
              
              {major.map(ch => (
                <div
                  key={ch.id}
                  className="chord-picker-group-item picker-group-item"
                  data-chord={ch.id}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>

             <div id="dominant" className="chord-picker-group picker-group">
              {dominant.map(ch => (
                <div
                  key={ch.id}
                  className="chord-picker-group-item picker-group-item"
                  data-chord={ch.id}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>

             <div id="minor" className="chord-picker-group picker-group">
              {minor.map(ch => (
                <div
                  key={ch.id}
                  className="chord-picker-group-item picker-group-item"
                  data-chord={ch.id}
                >
                  {ch.preferredSymbol(true)}
                </div>
              ))}
            </div>


          </div>
            )}
        </div>
    
    </>
  );
}


function FormSSPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "formSS-sp";
  const spClass = "chord-quality-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Form</div>
          </div>

 {activeSubPanelUI === spId && (
        <div className="chord-form-ss-container picker-container">
            <div id="major" className="chord-picker-group picker-group">
                <div class="chord-form-ss-item picker-group-item selected" data-id="D2:2">
                                    D2:2</div>
                <div class="chord-form-ss-item picker-group-item" data-id="D2:3">
                                    D2:3</div>
                <div class="chord-form-ss-item picker-group-item" data-id="D3:1">
                                    D3:1</div>
                <div class="chord-form-ss-item picker-group-item" data-id="D3:2">
                                    D3:2</div>
            </div>
        </div>
            )}
    </div>
  </>
  );
}



function InversionPanel({
  activeSubPanelUI,
  setActiveSubPanelUI,
  message,
  onKeyClick
}) {

  const spId = "inversion-sp";
  const spClass = "inversion-subpanel subpanel";

  const ToggleSubPanel = () => {
    // prev is the previous state value - the value that activeSubPanelUI had right before this update.
    //React gives you this automatically when you use the “functional update” form of setState.
    setActiveSubPanelUI(prev =>  prev === spId ? "" : spId );

  };

  return (
    <>
     
        <div id={spId} className={spClass}>
          <div className="title-bar" onClick={ToggleSubPanel}>
            <div className="title">Inversion</div>
          </div>

 {activeSubPanelUI === spId && (
        <div className="chord-form-ss-container picker-container">
            <div class="inversion-picker-group picker-group">
                  <div class="inversion-item picker-group-item selected" data-id="1">1</div>
                  <div class="inversion-item picker-group-item" data-id="3">3</div>
                  <div class="inversion-item picker-group-item" data-id="5">5</div>
                  <div class="inversion-item picker-group-item" data-id="7">7</div>
            </div>
        </div>
            )}
    </div>
  </>
  );
}





function PickerContent({ activeSubPanelUI, setActiveSubPanelUI }) {
  return (
    <div className="pm-container">
      <PianoPanel
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}
      />
      <QualityPanel 
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}/>
      <FormSSPanel 
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}/>
      <InversionPanel 
        activeSubPanelUI={activeSubPanelUI}
        setActiveSubPanelUI={setActiveSubPanelUI}/>
    </div>
  );
}

// need a react component for the useStates
export default function OpenPicker() {
  const [activeSubPanelUI, setActiveSubPanelUI] = useState("piano-sp");
  const panelRootRef = useRef(null);

  const openPanel = () => {
    CreatePanel().then(root => {
      panelRootRef.current = root;

      root.render(
        <PickerContent
          activeSubPanelUI={activeSubPanelUI}
          setActiveSubPanelUI={setActiveSubPanelUI}
        />
      );
    });
  };

  // Re-render when state changes
  useEffect(() => {
    if (panelRootRef.current) {
      panelRootRef.current.render(
        <PickerContent
          activeSubPanelUI={activeSubPanelUI}
          setActiveSubPanelUI={setActiveSubPanelUI}
        />
      );
    }
  }, [activeSubPanelUI]);

  return (
    <button onClick={openPanel}>Open picker</button>
  );
}



function CreatePanel() {
  return new Promise(resolve => {
    const container = document.createElement("div");

    jsPanel.create({
      id: "chord-picker",
      panelClass: "pick-master",
      theme: "default",
      position: { my: "center", at: "center", offsetX: -112 },
      headerTitle: "Chord",
         resizeit: false,            // optional, prevents user resizing
      // contentSize: "400 250",
      contentSize: { width: 400, height: 'auto' }, // initial width fixed
  // contentSize: "auto",        // ⭐ auto height
      content: container,
    panelCSS: {
            zIndex: 9999 // Your desired z-index
        },
      callback: panel => {
        const root = ReactDOM.createRoot(container);
        panel.classList.add("pick-master")
    //      if (typeof panel.setStatus === "function") {
    //   panel.setStatus("ontop");
    // }
      console.log("panel z-index:", getComputedStyle(panel).zIndex);
     panel.style.zIndex = 999999;
       console.log("panel z-index after set:", getComputedStyle(panel).zIndex);
        window.__pickerRoot = root;
        resolve(root);   // ⭐ important

        // const contentEl = panel.content;

      //  function adjustHeight() {
      //     const contentHeight = contentEl.scrollHeight;
      //     const headerHeight = panel.header.offsetHeight;
      //     const newHeight = contentHeight + headerHeight;

      //     panel.resize({
      //       height: newHeight   // ⭐ only height changes
      //     });
      //   }

          // Initial adjust AFTER React renders
        // setTimeout(adjustHeight, 0);


      // Adjust when subpanels toggle
        // document.body.addEventListener("click", e => {
        //   if (!e.target.closest(".subpanel .title-bar")) return;
        //   setTimeout(adjustHeight, 0);
        // });

        // Optional: adjust on window resize
        // window.addEventListener("resize", () => {
        //   setTimeout(adjustHeight, 0);
        // });



      }
    });
  });
}









