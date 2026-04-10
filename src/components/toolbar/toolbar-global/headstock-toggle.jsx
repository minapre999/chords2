

export default function HeadstockToggle({ 
    showHeadstockUI, 
    setShowHeadstockUI }) {
  

  return (
   <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="checkbox"
          checked={showHeadstockUI}
          onChange={(e) => setShowHeadstockUI(e.target.checked)}
        />
        Show headstock
      </label>
  );
}

