

import ChordPicker from "/src/components/toolbar/chord-tools/ChordPicker.jsx";
import InversionNavigator from "/src/components/toolbar/chord-tools/InversionNavigator.jsx";
import FormSSNavigator from "/src/components/toolbar/chord-tools/FormSSNavigator.jsx";
import NoteMode from "/src/components/toolbar/chord-tools/NoteMode.jsx";

export default function ChordTools(props) {
  return (
    <>
     
        <InversionNavigator {...props} />
        <FormSSNavigator {...props} />

              {/* <div className="toolbar-divider" /> */}


           {/* <ChordPicker {...props} /> */}
           
        <div className="toolbar-divider" />

        <NoteMode {...props} />
    </>
  );
}

