import { useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";
import  DurationControls  from "/src/components/toolbar/ls-tools/DurationControls.jsx";
import "/src/components/toolbar/toolbar.css"

// import ScalePicker from "/src/components/toolbar/scale-tools/ScalePicker.jsx";


export default function LeadSheetTools(props) {

const{isPlaying, setIsPlaying, isPaused, setIsPaused }=props
const { startAudio, samplerReady, scaleSampler } = useToneEngine();


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



  return (
    <>
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
        
        {/* <ScalePicker {...props} /> */}
        {/* <InversionNavigator {...props} />
        <FormSSNavigator {...props} />
        <NoteMode {...props} /> */}
        {/* <div>More scale tools coming ...</div> */}
    </>
  );
}



