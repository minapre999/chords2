

import OpenPicker from "/src/components/toolbar/chord-tools/open-picker.jsx";
import InversionNavigator from "/src/components/toolbar/chord-tools/inv-navigator.jsx";
import FormSSNavigator from "/src/components/toolbar/chord-tools/form-ss-navigator.jsx";
import NoteModeWidget from "/src/components/toolbar/chord-tools/note-mode.jsx";

export default function ChordTools(props) {
  return (
    <>
        <OpenPicker {...props} />
        <InversionNavigator {...props} />
        <FormSSNavigator {...props} />
        <NoteModeWidget {...props} />
    </>
  );
}

