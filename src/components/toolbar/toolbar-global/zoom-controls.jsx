

export default function ZoomControls({ zoom, setZoom }) {
      zoom, 
    setZoom
  return (
  
    <>
       {/* Zoom controls */}
      <button onClick={() => setZoom(z => {

        const z2 = Math.max(0.1, Number(z) - 0.1)

        console.log("zooom controls - setting zoom to: ", z2)
                        console.log("z", z,"z2", z2 )

        return Math.max(0.1, Number(z) - 0.1)}
        )}>–</button>
      <span>{
        
      Math.round(zoom * 100)
      }%</span>
       <button onClick={() => setZoom(z => {
        const z2 = Math.min(3, Number(z) + 0.1)
                console.log("z", z,"z2", z2 )

        console.log("zooom controls - setting zoom to: ", z2)
        return Math.min(3, Number(z) + 0.1)}
        )}>+</button>
  </>
  );
}
