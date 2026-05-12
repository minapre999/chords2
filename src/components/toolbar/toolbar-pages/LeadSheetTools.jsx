import { useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";
import  DurationControls  from "/src/components/toolbar/ls-tools/DurationControls.jsx";
import "/src/components/toolbar/toolbar.css"

// import ScalePicker from "/src/components/toolbar/scale-tools/ScalePicker.jsx";

/*
Bravura codes
E032: light/thick barline
E034: thick barline
E035: double thick barline
E040: right repeat barline
E041: left repeat barline
E042: double repeat barline
E045: DS symbol
E046: DC symbol
E262: #
E269: ##
E264: bb
E266: bbb

EB1C:   play
EB1D:  stop play
EB1E:  pause play

EB26:  sound muted
EB27:  sound not muted

F5EE:  2/4
F5F3:  4/4
F5F1:  3/4
F5F2:  3/8
F5F7:  6/8

E4E5: quarter note rest

E1E7:  augmentation dot
*/
export default function LeadSheetTools(props) {

const{  isPlaying, setIsPlaying, 
            isPaused, setIsPaused,
            showPalette, setShowPalette,
            noteInputMode, setNoteInputMode,
            noteInputModeRef,
            handleAccidentalClick,
            onToolbarTieClick,
            onToolbarSlurClick,
            inputDuration,
            setInputDuration,
            selRest, 
            setSelRest,
            selDotted,
            setSelDotted,
            noteToDotted,
            noteToRest,
            selection
           }=props

const { startAudio, samplerReady, scaleSampler } = useToneEngine();

// debugging
useEffect(() => {
  window.noteInputMode = noteInputMode;
  window.noteInputModeRef = noteInputModeRef
}, [ noteInputMode]);



const onRest =  () => {

// // ***** debugging block *****
// console.log("CALLING NOTE TO REST")
//    noteToRest()
//    return;
// // ***** end debug block *****


// console.log("CLICKED ON REST" , "\nselRest: ", selRest)
if(noteInputMode) {
    selRest === true ? setSelRest(false) : setSelRest(true) 
    }
else{
 if( selection?.type === "note") {
      noteToRest()
       setSelRest(true) 
      }
}

};



const onDotted =  () => {
// console.log("CLICKED ON DOTTED", "   \nselDotted: ", selDotted)

let newSelDotted = (selDotted === true) ? false : true

if( selection?.type === "note") {
      noteToDotted(newSelDotted)
      }

setSelDotted(newSelDotted)
}










const handlePlay = async () => {
  await startAudio();     // unlock audio + begin sampler loading
  setIsPlaying(true);     // sequencing effect will handle the rest
  setIsPaused(false);
};
// const handlePlay = () => {
//   if (!scaleSampler?.loaded) return;

//   seqRef.current.start(0);
//   Tone.Transport.start("+0.01"); // ⭐ prevents race condition
// };




const handlePause = () => {
    const transport = Tone.getTransport()
  transport.pause();
    setIsPaused(true);
  setIsPlaying(false);

};

const handleStop = () => {
const transport = Tone.getTransport()
  transport.stop();
  transport.position = 0;
    // seqRef.current.stop();   // ⭐ Only here
    setIsPaused(false);
  setIsPlaying(false);

};




const quarterRest = "\uE4E5"
const dottedCrotchet = "\uECA5 \uE1E7"
 


  return (
   <>

        <div className="toolbar-group">
              <button
            onClick={()=>{
                  setNoteInputMode( (prev) => {
                  console.log(" /click input not button", {prev})
                    return prev === true ? false : true } )
                  }}
            style={{ background: noteInputMode ? "#88f" : "#eee" }}
          >
            Note Input
          </button>
      </div>


        <div className="toolbar-group">
          <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
        </div>

        <div className="toolbar-group">
        <DurationControls 
              {...props} 
              />

        </div>
        
              <div className="toolbar-divider" />

      <div className="toolbar-group" >
          <button
              className={`btn-bravura btn-rest${selRest ? " selected" : ""}`}

              onClick={onRest}
            >
              {quarterRest}
           </button>
    

            <button
              className={`btn-bravura btn-dotted${selDotted ? " selected" : ""}`}
              onClick={onDotted}
            >
              {dottedCrotchet}
           </button>
   
        </div>

              <div className="toolbar-divider" />


           <div className="toolbar-group">

            <button onClick={() => setShowPalette(s => !s)}>
            {showPalette ? "Hide Palette" : "Show Palette"}
          </button>
        </div>

          <div className="toolbar-group toolbar-accidentals">
        <button onClick={() => handleAccidentalClick("sharp")}>♯</button>
        <button onClick={() => handleAccidentalClick("flat")}>♭</button>
        <button onClick={() => handleAccidentalClick("natural")}>♮</button>
        {/* <button onClick={() => handleAccidentalClick("double-sharp")}>𝄪</button>
        <button onClick={() => handleAccidentalClick("double-flat")}>𝄫</button> */}
      </div>

 <div className="toolbar-group">
<button onClick={onToolbarTieClick}>Tie</button>
</div>

 <div className="toolbar-group">
<button onClick={onToolbarSlurClick}>Slur</button>
</div>




        {/* <ScalePicker {...props} /> */}
        {/* <InversionNavigator {...props} />
        <FormSSNavigator {...props} />
        <NoteMode {...props} /> */}
        {/* <div>More scale tools coming ...</div> */}
    </>
  );
}



