export default function SettingsSidebar( props) {

  const {view, setView, ...rest} = props
  const items = [
    { id: "general", label: "General" },
    { id: "fretboard", label: "Fretboard" },
    { id: "audio", label: "Audio" },
    { id: "theme", label: "Theme" },
    { id: "advanced", label: "Advanced" }
  ];

  return (
    <aside className="settings-sidebar">
      {items.map(item => (
        <button
          key={item.id}
          className={view === item.id ? "active" : ""}
          onClick={() => setView(item.id)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
