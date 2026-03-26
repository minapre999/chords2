import GeneralSettings from "./views/GeneralSettings.jsx";
import FretboardSettings from "./views/FretboardSettings.jsx";
import AudioSettings from "./views/AudioSettings.jsx";
import ThemeSettings from "./views/ThemeSettings.jsx";
import AdvancedSettings from "./views/AdvancedSettings.jsx";

export default function SettingsContent( props ) {
  const {view, ...rest} = props
  return (
    <main className="settings-content">
      {view === "general" && <GeneralSettings {...props} />}
      {view === "fretboard" && <FretboardSettings  {...props}  />}
      {view === "audio" && <AudioSettings {...props}  />}
      {view === "theme" && <ThemeSettings {...props}  />}
      {view === "advanced" && <AdvancedSettings {...props}  />}
    </main>
  );
}
