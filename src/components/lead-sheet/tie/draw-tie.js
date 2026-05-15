import "/node_modules/vexflow/releases/vexflow-debug.js";




    /* TIES
      Using the inbuilt StaveTie - it renders nice looking ties
      Build hit boxes built similar to the hit boxes for notes
      It is not possible to draw a smooth tie between measures, so only draw the tie from the first measure
      unless the second measure is on a new line
      */


export function drawTies( { ctx,
                            leadSheet,
                            measure,
                            measureIndex,
                            measureOfRowIndex,
                            noteInputModeRef,
                            onTieSelect,
                            svg,
                            tieElements,
                            vfCacheRef,
                             voice,
                            formatter,
                            }  ){
  
  
// console.log("drawTies", {leadSheet, measure, measureIndex, measureOfRowIndex, svg, vfCacheRef})

  const VF = window.Vex.Flow;

      //  { id: "slur1", startMeasure: 0, startIndex: 2, endMeasure: 0, endIndex: 3 },

      // first draw ties
      const vfNotes = vfCacheRef.current.get(measure.id)?.vfNotes

  const vfTies = []
  const measureTies=[]
  leadSheet.ties.forEach((tie)=>{

    if(tie.startMeasure === measureIndex || tie.endMeasure === measureIndex) {
      const m1 = leadSheet.measures[tie.startMeasure]
      const m2 = leadSheet.measures[tie.endMeasure]
      // console.log("stave tie for measure id: ",measure.id,  { m1, m2, rowIndex, measureIndex, measureOfRowIndex})

      let vfTie = null

      if( tie.startMeasure === tie.endMeasure) {
        
          // console.log("same measure: ", {tie, m1, m2, vfNotes, vf1: vfNotes[tie.startIndex], vf2:vfNotes[tie.endIndex]})

          vfTie = new VF.StaveTie({
          first_note: vfNotes[tie.startIndex],
          first_indices: [0],
          last_note: vfNotes[tie.endIndex],
          last_indices: [0],
          } )
          }

      else {

          if( m1.id === measure.id){ // start measure
                    // console.log("start tie: ", {tie, m1, m2, vfNotes, first_note: vfNotes[tie.startIndex], })

              vfTie = new VF.StaveTie({
              first_note: vfNotes[tie.startIndex],
              first_indices: [0],
              } )
          }
          else if( m2.id === measure.id) { // end measure

           const vfNotes = vfCacheRef.current.get(m1.id)?.vfNotes

                              // console.log("end tie: ", {tie, m1, m2, vfNotes, last_note: vfNotes[tie.endIndex], })

              vfTie = new VF.StaveTie({
              //   first_note: vf1Notes[tie.startIndex],
              // first_indices: [0],
              last_note: vfNotes[tie.endIndex],
              last_indices: [0],
              } )
          }
      }

      
    
      if( !(measureOfRowIndex !== 0 && tie.endMeasure === measureIndex) ) { // the second join does not match so dont draw
        const tieGroup  = ctx.openGroup("tie-group"); // vexflow will prefix the class name with vf, to retrie it use vf-tie-group
        vfTie?.setContext(ctx).draw()
        ctx.closeGroup();

        tieGroup.classList.add(`${tie.id}`)

      if( vfTie){
        vfTies.push({ vfTie, group: tieGroup });
        measureTies.push(tie)
        }

      }
  }
  })


  // this is testing for debbugging


// possible workaround for slurring into the next measure
// this is sort of working.  need to make the realNote as a new vfNote with 
// pitch same as the last note of slur.  Or about half-way between the first and last note of the slur
// can the x value be outside the bar? ie. the position of the last note + measure width? it appears so
// the problem is the next measure (and vfCacheRef) has not yet been created as measures are created from index 0

//   if(vfNotes.length > 1 ) {

// const realNote = vfNotes[1];
// const anchor = createTieAnchor(realNote);

// const tie = new VF.StaveTie({
//   first_note: realNote,
//   last_note: anchor,
//   first_indices: [0],
//   last_indices: [0],
// });

// console.log("test slur with fake anchor: ", {realNote, anchor, tie})

//         const slurGroup  = ctx.openGroup("slur-group"); // vexflow will prefix the class name with vf, to retrie it use vf-tie-group
//         tie.setContext(ctx).draw();
//         ctx.closeGroup();
//    slurGroup.classList.add(`testId-${measureIndex}`)

//   }



  
   // ======================================================
// ⭐ TIE HITBOXES + EVENT HANDLERS (per measure)
// ======================================================



// 2. Remove old hitboxes
 const old = svg.querySelector(".tie-hitboxes-group");
if (old) old.remove();

// 3. Create hitbox group (must NOT block events)
 const hitGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
hitGroup.classList.add("tie-hitboxes-group");
hitGroup.style.pointerEvents = "none"; // group ignores events
svg.appendChild(hitGroup);

// 5. Build hitboxes
vfTies.forEach(({vfTie, group}, idx) => {
  const tie = measureTies[idx]
  const tieId = tie.id

  // --- REAL VexFlow <g> for this note ---
  // const g = vfTie.attrs?.el;
  const g = group; // ← this is the real <g>
    // console.log("tie group", {measure, g, tie, vfTie, idx})



  if (!g) return;

  // Save for selection/highlighting
  tieElements.current.set(tieId, g);


  // --- Build hitbox from REAL <g> bbox ---
  const bbox = g.getBBox();
  // console.log("tie hit box", {bbox})
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

  rect.dataset.tieId = tieId;
  rect.dataset.measureIndex = measureIndex;
  rect.dataset.tieIndex = idx;

  hitGroup.appendChild(rect);


  // --- CLICK + DRAG LOGIC (your original code) ---
  rect.addEventListener("mousedown", (e) => {
    e.preventDefault();

    const tieId = rect.dataset.tieId;
    const measureIdx = Number(rect.dataset.measureIndex);
    const noteIdx = Number(rect.dataset.noteIndex);


    const onUp = () => {
      window.removeEventListener("mouseup", onUp);

  
        onTieSelect(tieId);
      
    };

    window.addEventListener("mouseup", onUp);
  });
});


}




function createTieAnchor(realNote) {
  const stave = realNote.getStave();
//   const ys = realNote.getYs();
const ys = [100];
  const x = realNote.getTieRightX() + 200; // add 12px or any spacing
  const stemDir = realNote.getStemDirection();

  return {
    getStave: () => stave,
    getYs: () => ys,
    getStemDirection: () => stemDir,
    getTieLeftX: () => x,
    getTieRightX: () => x,
    getModifierStartXY: () => ({ x, y: ys[0] }),
  };
}
