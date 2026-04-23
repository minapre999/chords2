import React, { useState, useCallback } from "react";
import { TransportBar } from "./TransportBar";
import  LeadSheetRenderer  from "./LeadSheetRenderer";
import { InspectorPanel } from "./InspectorPanel";
import { FretboardPreview } from "./FretboardPreview";
import { autumnLeaves } from "/src/data/autumnLeaves";


const initialLeadSheet = autumnLeaves 
// console.log("initialLeadSheet: ",initialLeadSheet )

export default function LeadSheet() {
  const [leadSheet, setLeadSheet] = useState(initialLeadSheet);
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback((payload) => {
    setSelected(payload);
  }, []);

  const updateLeadSheet = useCallback((update) => {
    setLeadSheet((prev) => {
      const next = structuredClone(prev);

      if (update.type === "note") {
        const bar = next.bars.find((b) => b.id === update.barId);
        if (!bar) return prev;
        const note = bar.melody.find((n) => n.id === update.id);
        if (!note) return prev;
        Object.assign(note, update.patch);
      }

      if (update.type === "chord") {
        const bar = next.bars.find((b) => b.id === update.barId);
        if (!bar || !bar.chord) return prev;
        if (bar.chord.id !== update.id) return prev;
        Object.assign(bar.chord, update.patch);
      }

      return next;
    });
  }, []);

  return (
    <div
      className="lead-sheet-page"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100vh",   // full viewport
        minHeight: 0
      }}
    >
      <TransportBar leadSheet={leadSheet} />

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0
        }}
      >
        {/* LEFT: scrollable lead sheet */}
        <div
          style={{
            flex: 2,
            minHeight: 0,
            overflowY: "auto",   // this MUST scroll
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: 8,
            boxSizing: "border-box"
          }}
        >
          <LeadSheetRenderer
            leadSheet={leadSheet}
            onSelect={handleSelect}
          />
        </div>

        {/* RIGHT: inspector + fretboard */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 0
          }}
        >
          <InspectorPanel
            selected={selected}
            leadSheet={leadSheet}
            onChange={updateLeadSheet}
          />
          <FretboardPreview
            selected={selected}
            leadSheet={leadSheet}
            onChange={updateLeadSheet}
          />
        </div>
      </div>
    </div>
  );
}
