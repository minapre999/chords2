



const DURATIONS = ["s", "e", "q", "h", "w"]; // 16th, 8th, quarter, half, whole

export default function DurationControls(props ) {
  const { onSelectDuration, // for input mode
          changeDuration // for non-input mode
          } = props

  return (
    <div style={{ display: "flex", gap: "8px", padding: "8px" }}>
      {DURATIONS.map(d => (
        <button
          key={d}
          onClick={()=>{
          changeDuration(d)
          onEditDuration(d)}}
          style={{ padding: "6px 10px" }}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
