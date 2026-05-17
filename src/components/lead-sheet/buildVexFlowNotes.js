import "/node_modules/vexflow/releases/vexflow-debug.js";

export const durationMap = {
  w: "1",
  h: "2",
  q: "4",
  "8": "8",
  "16": "16",
  "e": "8",
  "s": "16"
};




        function pitchToVexflowKey(pitch) {
    // pitch is like "C4", "Eb4", "F#3"
    // console.log("pitchToVexflowKey: ", pitch)
    const match = pitch.match(/^([A-Ga-g])(b|#)?(\d)$/);
    if (!match) throw new Error("Invalid pitch: " + pitch);

    let [, letter, accidental, octave] = match;

    letter = letter.toLowerCase(); // VexFlow requires lowercase
    accidental = accidental || "";

    return `${letter}${accidental}/${octave}`;
    }



    export function buildVexFlowNotes(measure) {
        const VF = window.Vex.Flow;
        // console.log("buildVexFlowNotes: ", melody)
        // for (const measure of leadSheet.measures) {

            const melody = measure.melody
            return melody.map(n => {
                const isRest = n.pitches.length === 0;
            
                const vfDur = durationMap[n.duration];
                const dur = isRest ? vfDur + "r" : vfDur;
            
                const keys = isRest
                    ? ["b/4"]
                    : n.pitches.map(p => pitchToVexflowKey(p.pitch));
            
                const vfNote = new VF.StaveNote({
                    keys,
                    duration: dur,
                    auto_stem: true
                });
            
                const dots = n.dots || 0;
                for (let i = 0; i < dots; i++) {
                    vfNote.addDotToAll();
                }
            
                // ⭐ Manually fix ticks for dots (so Voice strict works)
                if (dots > 0) {
                    const base = vfNote.getIntrinsicTicks(); // 4096 for quarter
                    const factor = Math.pow(1.5, dots);      // 1 dot → 1.5, 2 dots → 2.25, etc.
                    vfNote.setIntrinsicTicks(base * factor);
                }
            
                return vfNote;
            });
        // } 
    } // buildVexFlowNotes