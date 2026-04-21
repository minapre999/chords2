
import { useToneEngine } from "/src/context/ToneEngineContext";



export function AudioStatusBanner() {
  const { audioStarted, samplerLoading, samplerReady, startAudio } = useToneEngine();

  if (!audioStarted) {
    return (
      <div className="audio-banner locked" onClick={startAudio}>
        🔒 Audio Locked — Click to Enable
      </div>
    );
  }

  if (samplerLoading) {
    return (
      <div className="audio-banner loading">
        ⏳ Loading audio samples…
      </div>
    );
  }

  if (samplerReady) {
    return (
      <div className="audio-banner ready">
        ✅ Audio Ready
      </div>
    );
  }

  return null;
}

