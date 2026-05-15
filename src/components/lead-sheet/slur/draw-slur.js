import "/node_modules/vexflow/releases/vexflow-debug.js";


export function drawSlurs( { ctx,
                            leadSheet,
                            measure,
                            measureIndex,
                            measureOfRowIndex,
                            noteInputModeRef,
                            onSlurSelect,
                            svg,
                            slurElements,
                            vfCacheRef,
                            }  ){
  
  
// console.log("drawSlurs", {leadSheet, measure, measureIndex, measureOfRowIndex, svg, vfCacheRef})

  const VF = window.Vex.Flow;

      //  { id: "slur1", startMeasure: 0, startIndex: 2, endMeasure: 0, endIndex: 3 },

      // first draw slurs

  const vfSlurs = []
  const measureSlurs=[]
  leadSheet.slurs.forEach((slur)=>{

    if(slur.startMeasure === measureIndex || slur.endMeasure === measureIndex) {
      const m1 = leadSheet.measures[slur.startMeasure]
      const m2 = leadSheet.measures[slur.endMeasure]
      // console.log("stave slur for measure id: ",measure.id,  { m1, m2, rowIndex, measureIndex, measureOfRowIndex})
      const vfNotes = vfCacheRef.current.get(measure.id)?.vfNotes

      let vfSlur = null

      if( slur.startMeasure === slur.endMeasure) {
        
          // console.log("same measure: ", {slur, m1, m2, vfNotes, vf1: vfNotes[slur.startIndex], vf2:vfNotes[slur.endIndex]})

          vfSlur = new VF.StaveTie({
          first_note: vfNotes[slur.startIndex],
          first_indices: [0],
          last_note: vfNotes[slur.endIndex],
          last_indices: [0],
          } )
          }

      else {

          if( m1.id === measure.id){ // start measure
                    // console.log("start slur: ", {slur, m1, m2, vfNotes, first_note: vfNotes[slur.startIndex], })

              vfSlur = new VF.StaveTie({
              first_note: vfNotes[slur.startIndex],
              first_indices: [0],
              } )
          }
          else if( m2.id === measure.id) { // end measure

           const vfNotes = vfCacheRef.current.get(m1.id)?.vfNotes

                              // console.log("end slur: ", {slur, m1, m2, vfNotes, last_note: vfNotes[slur.endIndex], })

              vfSlur = new VF.StaveTie({
              //   first_note: vf1Notes[slur.startIndex],
              // first_indices: [0],
              last_note: vfNotes[slur.endIndex],
              last_indices: [0],
              } )
          }
      }

      
    
      if( !(measureOfRowIndex !== 0 && slur.endMeasure === measureIndex) ) { // the second join does not match so dont draw
        const slurGroup  = ctx.openGroup("slur-group"); // vexflow will prefix the class name with vf, to retrie it use vf-slur-group
        vfSlur?.setContext(ctx).draw()
        ctx.closeGroup();

        slurGroup.classList.add(`${slur.id}`)

      if( vfSlur){
        vfSlurs.push({ vfSlur, group: slurGroup });
        measureSlurs.push(slur)
        }

      }
  }
  })


  
   // ======================================================
// ⭐ TIE HITBOXES + EVENT HANDLERS (per measure)
// ======================================================



// 2. Remove old hitboxes
 const old = svg.querySelector(".slur-hitboxes-group");
if (old) old.remove();

// 3. Create hitbox group (must NOT block events)
 const hitGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
hitGroup.classList.add("slur-hitboxes-group");
hitGroup.style.pointerEvents = "none"; // group ignores events
svg.appendChild(hitGroup);

// 5. Build hitboxes
vfSlurs.forEach(({vfSlur, group}, idx) => {
  const slur = measureSlurs[idx]
  const slurId = slur.id

  // --- REAL VexFlow <g> for this note ---
  // const g = vfSlur.attrs?.el;
  const g = group; // ← this is the real <g>
    // console.log("slur group", {measure, g, slur, vfSlur, idx})



  if (!g) return;

  // Save for selection/highlighting
  slurElements.current.set(slurId, g);


  // --- Build hitbox from REAL <g> bbox ---
  const bbox = g.getBBox();
  // console.log("slur hit box", {bbox})
  if (!bbox) return;

  const padding = 2;
  const x = bbox.x - padding;
  const y = bbox.y - padding;
  const w = bbox.width + padding * 2;
  const h = bbox.height + padding * 2;

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);

  // Debug visibility — remove stroke later if you want
  rect.setAttribute("fill", "transparent");
  rect.setAttribute("stroke", "transparent");

 rect.setAttribute("stroke", "red");
 rect.setAttribute("fill", "pink");
rect.setAttribute("opacity", "0.4");
  // ⭐ IMPORTANT: rect must receive events
  rect.style.pointerEvents = "none";
  if(!noteInputModeRef.current) {
  rect.style.pointerEvents = "all";
  rect.style.cursor = "pointer";
  }

  rect.dataset.slurId = slurId;
  rect.dataset.measureIndex = measureIndex;
  rect.dataset.slurIndex = idx;

  hitGroup.appendChild(rect);


  // --- CLICK + DRAG LOGIC (your original code) ---
  rect.addEventListener("mousedown", (e) => {
    e.preventDefault();

    const slurId = rect.dataset.slurId;
    const measureIdx = Number(rect.dataset.measureIndex);
    const noteIdx = Number(rect.dataset.noteIndex);


    const onUp = () => {
      window.removeEventListener("mouseup", onUp);

  
        onSlurSelect(slurId);
      
    };

    window.addEventListener("mouseup", onUp);
  });
});


}

