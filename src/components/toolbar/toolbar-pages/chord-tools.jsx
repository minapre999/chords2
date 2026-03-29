

import OpenPicker from "/src/components/toolbar/chord-tools/OpenPicker.jsx";
import InversionNavigator from "/src/components/toolbar/chord-tools/InversionNavigator.jsx";
import FormSSNavigator from "/src/components/toolbar/chord-tools/FormSSNavigator.jsx";
import NoteMode from "/src/components/toolbar/chord-tools/NoteMode.jsx";

export default function ChordTools(props) {
  return (
    <>
     
        <InversionNavigator {...props} />
        <FormSSNavigator {...props} />

              <div className="toolbar-divider" />

           <OpenPicker {...props} />
           
        <div className="toolbar-divider" />

        <NoteMode {...props} />
    </>
  );
}

