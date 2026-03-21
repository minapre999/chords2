import React from "react";

export default function FretboardControls({
  fretboardColor,
  setFretboardColor,
  stringColor,
  setStringColor,
  fretboardImage,
  setFretboardImage,
}) {
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setFretboardImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetImage = () => setFretboardImage("");

  return (
    <div
      style={{
        width: 260,
        padding: 20,
        background: "#1e1e1e",
        color: "#eee",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>Fretboard Settings</h2>

      {/* ------------------ FRETBOARD COLOUR ------------------ */}
      <div>
        <h4 style={{ margin: "0 0 8px" }}>Fretboard Colour</h4>

        <input
          type="color"
          value={fretboardColor}
          onChange={(e) => setFretboardColor(e.target.value)}
          style={{
            width: "100%",
            height: 40,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        />

        <div
          style={{
            marginTop: 10,
            height: 40,
            borderRadius: 6,
            background: fretboardColor,
            border: "1px solid #444",
          }}
        />
      </div>

      {/* ------------------ STRING COLOUR ------------------ */}
      <div>
        <h4 style={{ margin: "0 0 8px" }}>String Colour</h4>

        <input
          type="color"
          value={stringColor}
          onChange={(e) => setStringColor(e.target.value)}
          style={{
            width: "100%",
            height: 40,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        />

        <div
          style={{
            marginTop: 10,
            height: 10,
            borderRadius: 4,
            background: stringColor,
            border: "1px solid #444",
          }}
        />
      </div>

      {/* ------------------ FRETBOARD PATTERN ------------------ */}
      <div>
        <h4 style={{ margin: "0 0 8px" }}>Fretboard Pattern</h4>

        {/* URL input */}
        <label style={{ fontSize: 13 }}>Image URL</label>
        <input
          type="text"
          placeholder="https://example.com/wood.jpg"
          value={fretboardImage}
          onChange={(e) => setFretboardImage(e.target.value)}
          style={{
            width: "100%",
            marginTop: 6,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #555",
            background: "#111",
            color: "#eee",
          }}
        />

        {/* File upload */}
        <label style={{ fontSize: 13, marginTop: 12, display: "block" }}>
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{
            width: "100%",
            marginTop: 6,
            padding: 4,
            background: "#111",
            color: "#ccc",
            borderRadius: 6,
          }}
        />

        {/* Preview */}
        {fretboardImage && (
          <div
            style={{
              marginTop: 12,
              height: 60,
              borderRadius: 6,
              backgroundImage: `url(${fretboardImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid #444",
            }}
          />
        )}

        {/* Reset */}
        {fretboardImage && (
          <button
            onClick={resetImage}
            style={{
              marginTop: 10,
              padding: "6px 10px",
              borderRadius: 6,
              border: "none",
              background: "#444",
              color: "#eee",
              cursor: "pointer",
            }}
          >
            Remove Pattern
          </button>
        )}
      </div>
    </div>
  );
}
