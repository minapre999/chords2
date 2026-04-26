



const DURATIONS = ["s", "e", "q", "h", "w"]; // 16th, 8th, quarter, half, whole

export default function DurationControls({ onSelectDuration }) {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "8px" }}>
      {DURATIONS.map(d => (
        <button
          key={d}
          onClick={() => onSelectDuration(d)}
          style={{ padding: "6px 10px" }}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
