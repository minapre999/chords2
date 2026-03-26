

export default function ZoomControls({ zoom, setZoom }) {
      zoom, 
    setZoom
  return (
  
    <>
       {/* Zoom controls */}
      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>–</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>
  </>
  );
}
