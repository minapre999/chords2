
import PianoPanel from "./PianoPanel.jsx"
import InversionPanel from "./InversionPanel.jsx"
import FormSSPanel from "./FormSSPanel.jsx"
import ChordQualityPanel from "./ChordQualityPanel.jsx"


export default function ChordsPanel(props) {

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 chord-grid">

        <div className="col-12 col-md-6">   
          <div className="row">
            <PianoPanel {...props} />
            <InversionPanel {...props} />
            <FormSSPanel {...props} />
          </div>
        </div>

      <div className="col-12 col-md-6">
        <ChordQualityPanel {...props} />
      </div>

     </div>
  </div>
  );
}

