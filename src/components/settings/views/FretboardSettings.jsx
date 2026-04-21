import React, { useState, useEffect, useRef, useMemo } from "react"

import FretboardSVG from "/src/components/fretboard/FretboardSVG.jsx"
import Scale, {ScaleManager, ScaleDictionary} from "/src/harmony/scale-manager.js"
import "/src/globals.js"
import RenderData, {RenderNote} from "/src/render-notes.js"
import "./FretboardSettings.css"

export default function FretboardSettings(props){

      const {   showOpenStringsUI, setShowOpenStringsUI,
                showInlaysUI,setShowInlaysUI,
                stringColorUI, setStringColorUI, 
                bassStringColorUI, setBassStringColorUI,
                showHeadstockUI,setShowHeadstockUI, 
                arrFillColorUI,  setArrFillColorUI,
                arrStrokeColorUI, setArrStrokeColorUI,
                arrFontColorUI,arrFontSizeUI,  
                arrWidthUI, setArrWidthUI, 
                strokeWidthUI,
                activeFontSizeUI, setActiveFontSizeUI, activeFillColorUI, setActiveFillColorUI, 
                activeFontColorUI, setActiveFontColorUI, activeStrokeColorUI, setActiveStrokeColorUI, 
                activeStrokeWidthUI, setActiveStrokeWidthUI, activeWidthUI, setActiveWidthUI,
                showHarmonyNotesUI,
                setRenderDataUI,
                scaleModeUI, scaleQualityUI, scaleFormUI, scaleRootUI,
                rootFillColorUI, setRootFillColorUI,
                thirdFillColorUI, setThirdFillColorUI,
                fifthFillColorUI, setFifthFillColorUI,
                seventhFillColorUI, setSeventhFillColorUI,
                rootFontColorUI, setRootFontColorUI,
                thirdFontColorUI, setThirdFontColorUI,
                fifthFontColorUI, setFifthFontColorUI,
                seventhFontColorUI, setSeventhFontColorUI,

                setCurrentNote,
                 
                ...rest } = props


  const [ready, setReady] = useState(false);


  useEffect(() => {
 
    let cancelled = false;   // 1. Track whether the component is still mounted
    if( dc.SCALE_MANAGER == null) dc.SCALE_MANAGER = new ScaleManager() 
  
    async function init() {
      await dc.SCALE_MANAGER.load_scales();       // 2. Wait for the real load
      // console.log("AFTER AWAIT")
      // console.log(".load_scales complete. sDict", dc.SCALE_MANAGER.activeDict , "scales: ", dc.SCALE_MANAGER.activeDict.scales )
      if (!cancelled) setReady(true);             // 3. Only update state if mounted
    }
  
    init();                                       // 4. Kick off the async load
  
    return () => { cancelled = true };            // 5. Cleanup: mark as unmounted
  }, []);
  



   useEffect(() => {
                  
                     if (!ready) return;
                
                    const sDict = dc.SCALE_MANAGER.activeDict 
                    // console.log("dict scales: ", sDict.scales)
                
                    const scale = sDict.scaleWithQualityAndForm("Maj","1")
                    scale.mode = "Major"
                    scale.setRoot( "C")
                     
                
                  const rData = new RenderData(props)
                   
                    if (scale?.id !== undefined) {
                      rData.activeNote = null // for sequential playing
                
                      //  console.log("getting render data for scale ", scale, " with id: ", scale.id, 
                        // " root: ", scale.root , " form: ", scale.form)   
                      scale.notes.forEach((n, i)=>{
                 
                         
                  
                          let text = n.letter 
                
                          const rn = new RenderNote({note: n, text: text ,})
                          rData.add(rn, n.stringNumber)
                          if( i == 0){  setCurrentNote(rn.note) }
                          })
                  
                   // if this doesn't work may need to create a boolean primitive to flag needs rendering
                        // console.log("SCALE RENDER DATA: ", rData)
                       
                        setRenderDataUI( rData);
                      }      
                
                    }, [ready, scaleModeUI, scaleQualityUI, scaleFormUI, scaleRootUI]);
                  



  const   ChangeNoteColor=(sel)=>{
                const myArr = [...arrFillColorUI]
                myArr[0] = sel
                console.log("setting note color to: ", sel, myArr)
                setArrFillColorUI(myArr)
                }

  const   ChangeNoteStrokeColor=(sel)=>{
                const myArr = [...arrStrokeColorUI]
                myArr[0] = sel
                console.log("setting note color to: ", sel, myArr)
                setArrStrokeColorUI(myArr)
                }


return (
<div id="fb-set-wrapper">
      <div className="row g-3 scale-grid">
   
     <div className="col-12 col-md-4">   
    <div className="settings-group-title">Fretboard</div>
     {/* Headstock toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showHeadstockUI}
          onChange={(e) => setShowHeadstockUI(e.target.checked)}
        />
        Show headstock
      </label>


{/* Inlays */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showInlaysUI}
          onChange={(e) => {console.log("toolbox inlays"); 
            setShowInlaysUI(e.target.checked)}}
        />
        Show inlays
      </label>

 <div>


   <div className="col-12 col-md-4">   
    <div className="settings-group-title">Strings</div>

    {/* Open strings */}
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
            type="checkbox"
            checked={showOpenStringsUI}
            onChange={(e) => setShowOpenStringsUI(e.target.checked)}
            />
            Show open string names
        </label>
    </div>
 </div>

 
    
   

  
     {/* String colours  - toolbar sends update to the parent */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Treble strings colour:
        <input
          type="color"
          value={stringColorUI}

          onChange={(e) => setStringColorUI(e.target.value)}
    
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Bass strings colour:
        <input
          type="color"
          value={bassStringColorUI}
          onChange={(e) => setBassStringColorUI(e.target.value)}
        />
      </label>

     </div>





   <div className="col-12 col-md-4">   
    <div className="settings-group-title">Notes</div>
  {/* note colours  - toolbar sends update to the parent */}
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Colour:
        <input
          type="color"
          value={arrFillColorUI[0]}
          
           onChange={(e) => ChangeNoteColor(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Border colour:
        <input
          type="color"
          value={arrStrokeColorUI[0]}
           onChange={(e) => ChangeNoteStrokeColor(e.target.value)}
          
        />
      </label>

         

            <div className="control-group">
              <label>Circle Radius: {arrWidthUI[0]}</label>
              <input
                type="range"
                min="6"
                max="28"
                  value={arrWidthUI[0]}
                   onChange={(e)=>{
                    const arr = [...arrWidthUI]
                    arr[0] = (Number(e.target.value))
                    setArrWidthUI(arr)}
                } 
              />
            </div>
         


  

    <div className="settings-group-title">Active Note</div>

  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Colour:
        <input
          type="color"
          value={activeFillColorUI}
          
           onChange={(e) => setActiveFillColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Border colour:
        <input
          type="color"
          value={arrStrokeColorUI[0]}
           onChange={(e) => ChangeNoteStrokeColor(e.target.value)}
          
        />
      </label>

         

            <div className="circle-">
              <label>Circle Radius: {activeWidthUI}</label>
              <input
                type="range"
                min="9"
                max="42"
                  value={activeWidthUI}
                   onChange={(e)=>{ 
                    setActiveWidthUI( Number(e.target.value)) }
                } 
              />
            </div>


</div>


   <div className="col-12 col-md-4">   
    <div className="settings-group-title">Harmony Notes</div>
  {/* note colours  - toolbar sends update to the parent */}
  <div className="harmony-note-title">Root</div>
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Colour:
        <input
          type="color"
          value={rootFillColorUI}
           onChange={(e) => setRootFillColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Font colour:
        <input
          type="color"
          value={rootFontColorUI}
           onChange={(e) => setRootFontColorUI(e.target.value)}
        />
      </label>

        <div className="harmony-note-title">Third</div>
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Colour:
        <input
          type="color"
            value={thirdFillColorUI}
           onChange={(e) => setThirdFillColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Font colour:
        <input
          type="color"
          value={thirdFontColorUI}
           onChange={(e) => setThirdFontColorUI(e.target.value)}
        />
      </label>  


 <div className="harmony-note-title">Fifth</div>
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Colour:
        <input
          type="color"
               value={fifthFillColorUI}
           onChange={(e) => setFifthFillColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Font colour:
        <input
          type="color"
           value={fifthFontColorUI}
           onChange={(e) => setFifthFontColorUI(e.target.value)}
        />
      </label>

 <div className="harmony-note-title">Seventh</div>
     <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Colour:
        <input
          type="color"
               value={seventhFillColorUI}
           onChange={(e) => setSeventhFillColorUI(e.target.value)}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Font colour:
        <input
          type="color"
          value={seventhFontColorUI}
           onChange={(e) =>setSeventhFontColorUI(e.target.value)}
        />
      </label>

         
</div>







</div>


<div className="fb-wrapper">
 <FretboardSVG
        {...props}
        cfUI={null}
      chordRootUI={null}
      width={1800*.66}
      height={220*.66}
      zoomScope="fretboard-settings"

    
    />

</div>
</div>
)

}

