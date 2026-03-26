



export default function ChordInfo({
    cfUI

}) {
  if(!cfUI ) return( <></> )


  // let cf = dc.HARMONY_MANAGER.chordformWithId(cfUI);
  // cf.root=chordRootUI
  // let chord = dc.HARMONY_MANAGER.chordformWithId( cfUI );
  let chord = cfUI.chord
    // let chordforms = chord.getChordforms({ root: "C", form: "D2", string: "1" });
  // chord.root=cfUI.root

    // console.log("cf: ", cf)

    // Map form → label
    const formLabels = {
      D2: "Drop 2",
      D3: "Drop 3",
      D4: "Drop 2+4",
    };

    // Get the label safely
    const formKey = cfUI.form;
    const formLabel = formLabels[formKey] || formKey;
    // Build the final string
     const strCF = `${formLabel}, strings ${cfUI.stringset}, inversion ${cfUI.inversion}`;

// console.log("ChordInfo Chord root: ", chordRootUI, "strCF: ", strCF)

  return ( cfUI && (
        <>
            <div className="mb-4">&nbsp;</div>

            <div>
            {cfUI.root}
            <span
              dangerouslySetInnerHTML={{
                __html: cfUI.chord.harmony.symbols[0]
              }}
            />
          </div>
          <div />
          <div>{strCF}</div>
      </>
      )
  );
}


