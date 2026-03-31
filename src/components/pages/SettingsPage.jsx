import React, { useState, useEffect, useMemo } from "react";
import "/src/components/settings/Settings.css"
import SettingsSidebar from "/src/components/settings/SettingsSidebar.jsx"
import SettingsContent from "/src/components/settings/SettingsContent.jsx"

export default function SettingsPage(props) {
  const [view, setView] = useState("general");

  return (
    <div className="settings-layout">
    
      <SettingsSidebar   {...props} view={view} setView={setView} />
      <SettingsContent   {...props} view={view} />
    </div>
  );
}
