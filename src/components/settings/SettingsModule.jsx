import React, { useState, useEffect, useMemo } from "react";
import "./SettingsModule.css"
import SettingsSidebar from "./SettingsSidebar.jsx"
import SettingsContent from "./SettingsContent.jsx"

export default function SettingsModule(props) {
  const [view, setView] = useState("general");

  return (
    <div className="settings-layout">
    
      <SettingsSidebar   {...props} view={view} setView={setView} />
      <SettingsContent   {...props} view={view} />
    </div>
  );
}
