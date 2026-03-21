import { useState, useEffect } from "react"
import "./globals.js"
import ChordModule from "./components/fretboard/ChordModule.jsx";


// ut the key is understanding that React always renders something first.
//  What you control is what it renders while you’re waiting.
// React cannot block rendering until data arrives.
// But you can control what it renders until the data is ready.
//So the real question becomes:
//“What should the UI show while the data loads?”

export default function App() {
  const [ready, setReady] = useState(false);


  useEffect(() => {
    async function init() {
      await window.dc.initialize();     
      setReady(true);
    }
    init();
  }, []);

    // if (!ready) return null;     // render nothing

    if (!ready) {
      return <div>Loading…</div>;   //Same idea, but more user‑friendly.
    }
  return (
    <div style={{ padding: 20 }}>
      <ChordModule/>
    </div>
  );
}
