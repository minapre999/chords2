import { useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { useToneEngine } from "/src/context/ToneEngineContext";

// import ScalePicker from "/src/components/toolbar/scale-tools/ScalePicker.jsx";


export default function ScaleTools(props) {

const [isPlaying, setIsPlaying] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const { startAudio, samplerReady } = useToneEngine();


const handlePlay = async () => {
  await startAudio();
  if (!samplerReady) return;   // ⭐ prevents early play
  Tone.Transport.start();
  setIsPlaying(true);
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



