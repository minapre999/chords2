



export default function ScaleInfo(props) {

const{scaleChoiceUI, ...rest} = props

  if(!scaleChoiceUI ) return( <></> )


// console.log("ChordInfo Chord root: ", chordRootUI, "strCF: ", strCF)

  return ( scaleChoiceUI && (
        <>
            <div className="mb-4">&nbsp;</div>

            <div>
                {scaleChoiceUI.root}&nbsp;{scaleChoiceUI.mode}
            </div>
          <div>Form: {scaleChoiceUI.form}</div>
          <div>position: {scaleChoiceUI.position}</div>
           <div>id: {scaleChoiceUI.id}</div>
 
      </>
      )
  );
}


