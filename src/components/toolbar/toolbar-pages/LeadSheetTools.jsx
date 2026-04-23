import { useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";

// import ScalePicker from "/src/components/toolbar/scale-tools/ScalePicker.jsx";


export default function LeadSheetTools(props) {

const{isPlaying, setIsPlaying, isPaused, setIsPaused }=props
const { startAudio, samplerReady } = useToneEngine();


const handlePlay = async () => {
  await startAudio();     // unlock audio + begin sampler loading
  setIsPlaying(true);     // sequencing effect will handle the rest
  setIsPaused(false);
};


const handlePause = () => {
  Tone.Transport.pause();
  setIsPlaying(false);
  setIsPaused(true);
};

const handleStop = () => {
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  setIsPlaying(false);
  setIsPaused(false);
};






  return (
    <div>
        <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleStop}>Stop</button>
      {/* <ScalePicker {...props} /> */}
      {/* <InversionNavigator {...props} />
      <FormSSNavigator {...props} />
       <NoteMode {...props} /> */}
       {/* <div>More scale tools coming ...</div> */}
    </div>
  );
}



