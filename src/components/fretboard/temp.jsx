import  Note  from "../../harmony/note.js";
import  PlayNote  from "../../sound/Play.js";

export default function StringLane({
   renderDataUI,
  stringIndex,
  openMidi,
  cf,
  showOpenStringsUI,
  bassStringColorUI,
  stringColorUI,
  showNoteNamesUI,
  openMarkers,

   cfUI,
  interactive,
  handleNoteClick,
  preferSharps,
  width,
  numFrets,
  nutX,
  getFretX,
  stringY,
  getStringWidth,
  noteNameFromMidi,
  showAllNotesUI,
  noteMode
}) {

    if(renderDataUI == null || renderDataUI == undefined) return null

  const stringData = renderDataUI.string(stringIndex+1)


  const y = stringY(stringIndex);
  const stringThickness = getStringWidth(stringIndex);
  const isWound = stringIndex > 2; // 0,1,2 = wound; 3+ = plain
  const strokeCol = stringIndex > 2 ? bassStringColorUI : stringColorUI;
  const openNoteName = noteNameFromMidi(openMidi, { preferSharps });
  // The chordform note for this string (if any)
  const chNote = cf?.getNoteForString(stringIndex+1) || null;

  return (
    <g>

         <defs>
        <filter id="stringShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="1.5"
            floodColor="black"
            floodOpacity="0.35"
        />
        </filter>
    </defs>

    <defs>
        <pattern id="woundPattern" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="white" />
        <line x1="0" y1="6" x2="6" y2="0" stroke="black" strokeWidth="1" />
        </pattern>

        <mask id="woundMask">
        <rect width="100%" height="100%" fill="url(#woundPattern)" />
        </mask>

        <linearGradient id="stringSheen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="10%" stopColor="rgba(0,0,0,0.1)" />
        <stop offset="15%" stopColor="rgba(255,255,255,0.25)" />
        <stop offset="30%" stopColor="rgba(255,255,255,0.8)" />
        <stop offset="45%" stopColor="rgba(255,255,255,0.25)" />
        <stop offset="90%" stopColor="rgba(0,0,0,0.6)" />
        </linearGradient>
    </defs>


         {/* === STRING GRAPHICS === 
<g>
    {/* winding */}
       <rect
        x={0}
        y={y - stringThickness / 2}
        width={width}
        height={stringThickness}
        fill={strokeCol}
        {...(isWound ? { mask: "url(#woundMask)" } : {})}
      />

      {/* Sheen on top, no mask */}
      <rect
        x={0}
        y={y - stringThickness / 2}
        width={width}
        height={stringThickness}
        fill="url(#stringSheen)"
      />


      
      {/* === OPEN STRING CIRCLE === */}
      {showOpenStringsUI && (
        <g
          onClick={() => interactive && handleNoteClick(stringIndex, 0)}
          style={{ cursor: interactive ? "pointer" : "default" }}
        >
          <circle cx={nutX - 18} cy={y} r={10} fill="#fff" stroke="#333" />
           (
            <text
              x={nutX - 18}
              y={y + 4}
              fontSize={10}
              textAnchor="middle"
              fill="#000"
            >
              {openNoteName}
            </text>
          )
        </g>
      )}

      {/* === OPEN / MUTED MARKERS (O / X) === */}
      {openMarkers && cfUI && (
        <g className="open-muted-markers">
          {(() => {
            if (!chNote) return null;

            const x = getFretX(0) - 40;

            if (chNote.fret === 0) {
              return (
                <text
                  x={x}
                  y={y + 5}
                  fontSize={20}
                  fill="white"
                  textAnchor="middle"
                >
                  O
                </text>
              );
            }

            if (chNote.fret === null) {
              return (
                <text
                  x={x}
                  y={y + 5}
                  fontSize={20}
                  fill="white"
                  textAnchor="middle"
                >
                  X
                </text>
              );
            }

            return null;
          })()}
        </g>
      )}

      {/* === FRETTED NOTES === */}

        { stringData.map((note_data)=>{
         const fret = note_data.note.fret
         const fretIndex = fret-1 

      
      // Array.from({ length: numFrets }).map((_, fretIndex) => {
         if (!chNote) return null;
         
        // const fret = fretIndex + 1;
        const midi = openMidi + fret;

        // console.log("StringLine: noteMode: ", noteMode)
        const noteName = note_data.text
       const color = note_data.color


        const left = getFretX(fret - 1);
        const right = Math.min(getFretX(fret), width);
        const x = (left + right) / 2;
        
const isChordNote =true
        // const isChordNote =
        //   cfUI &&
        //   chNote &&
        //   chNote.fret === fret;

          // console.log("isChordNote: ", isChordNote, "noteName; ", noteName)
        return (
          <g
            key={fretIndex}
            onClick={() =>
              interactive && handleNoteClick(stringIndex, fret)
            }
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
          
            {(isChordNote || showAllNotesUI) && (
              <circle
                cx={x}
                cy={y}
                r={note_data.width}
                fill={note_data.fillColor}
                stroke={note_data.strokeColor}
                strokeWidth={note_data.strokeWidth}
              />
            )}

            {(isChordNote || showAllNotesUI) && (
              <text
                x={x}
                y={y + 4}
                fontSize={note_data.fontSize}
                textAnchor="middle"
                fill={note_data.color}
              >
                {noteName}
              </text>
            )}
          </g>
        );
      })} 




     
    </g>
  );
}