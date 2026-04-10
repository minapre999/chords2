import dc from '/src/globals.js' // need to import first as it sets up database
import Dexie from "dexie"
import Note from "/src/harmony/note.js"
import {transpose_lookup, 
      modeLookupIntervals, 
      MODE_LOOKUP_SEMITONES,
    MAJOR_INTERVALS,
    MM_INTERVALS,
    HM_INTERVALS,
    ARPEGGIO_INTERVALS,
    OTHER_INTERVALS
  }  from "/src/harmony/core.js";


      


/*

Scale Dictionary Manager

Structure of scale json file: array of objects that represent a note 
Form:  name of scale (default sclale has  1	1A	1B	1C	1D	2	3	4	4A	4B	4C	1D-4D )
S:  string
Fret: fret of major scale
Int: interval of major scale
Fing: fingering for major scale
MMFret:  fret for melodic minor 
MMInt:  interval of melodic minor
MMFinger:  fingering for melodic minor
AltInt: interval of alt scale

note  the AltScale is identical to the melodic minor that starts
on the 7th interval of the melodic minor.
To display an Alt Scale:
- find scale that is one semitone 
Use the MMFing and MMFret and AltInt for melodic minor.

e.g. to find Bb-alt scale:  
-  The default scale is the melodic minor at root plus one semitone (C)
-  Use the C MM scale for fret number and fingering (MMFret, MMFing)
-  Use the AltInt for the interval

*/



// standard intervals from rool



export default class Scale {
    constructor(id) {

        /* previously the id was Qual:Form combination e.g. Maj:4A
        this has been changed to the unique scale primary key
        */

        this._id = id // id = Qual:Form  e.g. Maj:4A, MM:1A, etc
        this._quality  = null
        this._form  = null
        this._c_notes = [] // notes in C position
        this.lowFret = 24
        this.highFret = 0

        this.position // position of unstretched finger 1, ** in 'C' coordinate **
        this.lowFret // position of lowest fret, ** in 'C' coordinate **
        this.highFret // position of highest fret,  ** in 'C' coordinate **



        // the following are temp variables used to transpose the scale to
        // a key and mode
        this.root = "C"
        this._mode = null
        /* for whole tone scale and diminished scales
        in which each note is effectively a root
        there are no modes
        however, keep track of where in the fretboard the form is played
        by this.translation - the number of semitones to translate
        */
        this.rootlessTranslation = 0
        this._r_notes_cache = null // notes in root position for mode
        return this
    }

get id() { return this._id }
get quality() { return this._quality } 
set quality( q ) { return this._quality = q } 
get form() { return this._form } 
set form( f ) { return this._form  = f } 
get qual_form() {return `${_quality}:${_form}` }

  /* return notes in the coordinate system of the root and the mode
    if not cached, will need to convert from 'C' coordinates
    */
get notes() {
  try {
    // reset cache if empty array
    if (this._r_notes_cache !== null &&
        this._r_notes_cache.length === 0) {
      this._r_notes_cache = null;
    }

    // return cached notes if available
    if (this._r_notes_cache !== null) {
      return this._r_notes_cache;
    }

    // required properties
    if (this.mode === undefined)
      throw "No mode set for scale: Scale.getNotes";
    if (this.root === undefined)
      throw "No root set for scale: Scale.getNotes";
    if (this._c_notes === undefined)
      throw "No 'C' notes found in scale: Scale.getNotes";

    // clone C-notes into result cache
    this._r_notes_cache = [];
    for (const cNote of this._c_notes) {
      const rNote = Object.assign(new Note(), cNote);
      this._r_notes_cache.push(rNote);
    }

    // compute transpose amount
    let fretTranspose =
      transpose_lookup[this.root] +
      MODE_LOOKUP_SEMITONES[this.mode] +
      this.rootlessTranslation;

    // open string rules
    let highestFret = 13;
    if (dc.SCALE_MANAGER.allowOpenStrings === true) {
      dc.LOWEST_ALLOWED_FRET = 0;
      highestFret = 12;
    }

    // adjust transpose to keep notes in range
    if (this.lowFret + fretTranspose < dc.LOWEST_ALLOWED_FRET) {
      fretTranspose += 12;
    } else if (this.lowFret + fretTranspose >= highestFret) {
      fretTranspose -= 12;
    }

    // interval transpose lookup
    const intervalTranspose = modeLookupIntervals[this.mode];

    // apply fret transposition
    for (const note of this._r_notes_cache) {
      const transposedFret = parseInt(note.fret) + fretTranspose;
      note.fret = transposedFret;
      // interval transposition was commented out in your original
      // note.interval = intervalTranspose[ intervalLookup.indexOf(note.interval) ];
    }

    return this._r_notes_cache;
  }

  catch (err) {
    console.log("%c" + err, "color: red;");
    console.log(err.stack);
  }
}


copy() {
  // Deep‑clone primitive fields and arrays
  const clone = Object.assign(new Scale(), JSON.parse(JSON.stringify(this)));

  // Rebuild _c_notes with real Note instances
  clone._c_notes = [];
  for (const cNote of this._c_notes) {
    clone._c_notes.push(cNote.copy());
  }

  // Rebuild _r_notes_cache with real Note instances
  if( this._r_notes_cache != null) {
  clone._r_notes_cache = [];
  for (const rNote of this._r_notes_cache) {  clone._r_notes_cache.push(rNote.copy())   }
  }

  return clone;
}



    addNote(note) {

        this._c_notes.push(note)

        if (note.finger == 1) { this.position = parseInt(note.fret)} 
        else if (note.finger == "1s") { this.position = parseInt(note.fret) + 1} 
        else if (note.finger == 2) { this.position = parseInt(note.fret) - 1} 

        if (note.fret > this.highFret) { this.highFret = parseInt(note.fret)} 
        if (note.fret < this.lowFret) { this.lowFret = parseInt(note.fret)} 
        return this
    }
    // recalculate lowFret, highFret, position of the c notes
   recalcPositions() {
  this.lowFret = 100;
  this.highFret = 0;

  for (const note of this._c_notes) {

    if (note.finger === 1) {
      this.position = Number(note.fret);
    } else if (note.finger === "1s") {
      this.position = Number(note.fret) + 1;
    } else if (note.finger === 2) {
      this.position = Number(note.fret) - 1;
    }

    if (this.lowFret > note.fret) {
      this.lowFret = note.fret;
    }

    if (this.highFret < note.fret) {
      this.highFret = note.fret;
    }
  }
}

    /** chord url in following format:
      hostname/scales/root/mode/form
      note: the mode may have spaces so will need to be converted to
      url safe format
      use encodeURIComponent and decodeURIComponent on the mode
     **/
    url() {

        let urlPath = this.getRoot()
        if (urlPath.length > 0) {
            let urlMode = encodeURIComponent(this.mode)

            if (typeof urlMode !== "undefined" && urlMode.length > 0) {
                urlPath = urlPath + "/" + urlMode
                const urlForm = this.form
                if (typeof urlForm !== "undefined" && urlForm.length > 0) {
                    urlPath = urlPath + "/" + urlForm

                    return window.location.protocol + "//"
                        + window.location.host + "/"
                        + window.location.pathname.split('/')[1] + "/"
                        + urlPath


                }
            }
        }

    }
    getRoot() {
        return this.root
    }
    setRoot(root) {

        if (this.root != root) {
            this.clearCache()
        }

        this.root = root
        return this
    }
 get    mode() { return this._mode  }
  set mode(m) {  if (this._mode != m) {
                  this.clearCache() }

                this._mode = m
                return this
            } 

    


    clearCache() {
        this._r_notes_cache = null
        return this
    }
    /* get the lowest fret of the current form
    in transformed position */
    lowestFret() {

        const notes = this.notes
        let lowestFret = 24
        for (const note of notes) {
          const fret = note.fret;
          if (fret < lowestFret) {
            lowestFret = fret;
          }
        }


    }
  

    /* return note letters in the coordinate system of the root and the mode
    */
   getNoteLetters() {
  try {
    this.notes // refresh cache if needed

    const letters = [];
    const notes = this.notes

    for (const note of notes) {
      letters.push(note.letter);
    }

    return letters;
  }

  catch (err) {
    console.log("%c" + err, "color: red;");
    console.log(err.stack);
  }
}

    // return all the available intervals in the scale
    // only return unique intervals
   getIntervals() {
  const intervals = [];

  for (const note of this._c_notes) {
    const interval = note.interval;
    if (!intervals.includes(interval)) {
      intervals.push(interval);
    }
  }

  return intervals;
}

    

/*
transformedPosition - transformed to take into account root and mode
*/

transformedPosition() {

        let fretTranspose = transpose_lookup[this.root]
            + MODE_LOOKUP_SEMITONES[this.mode]
            + this.rootlessTranslation

        let highestFret = 13
        if (dc.SCALE_MANAGER.allowOpenStrings === true) {
            dc.LOWEST_ALLOWED_FRET = 0
            highestFret = 12
        }
        if (this.lowFret + fretTranspose < dc.LOWEST_ALLOWED_FRET) { fretTranspose += 12} 
        else if (this.lowFret + fretTranspose >= highestFret) { fretTranspose -= 12} 

        return this.position + fretTranspose
    }
} // scale 

















/*
ScaleDictionary stores the scale data
Ultimately want to allow users to be able to make and share their own scale dictionaries
Proably best to store as files, with metadata in a Postrgres db
Due to size, could be overkill to use AWS to store the scale json files ?
*/

export class ScaleDictionary {
    constructor(name, allowOpen = false) {
        this._loadingPromise = null;

        this._id = null
        this.name = name // required - name is like an id - unique to dictionaries in the cd manager
        this.allowsOpenStrings = allowOpen
        this.description = null
        this.author = null
        this.category = null// jazz, folk, etc.  categories to be determined
        this.create_ts = null
        this.scales = []

        // active scale
        this._activeScaleId = 6 // Maj form 2
        // this.activeScaleName // name of active scale
        // this.root     // root note of scale
        // this.activeForm // for of the active scale
        return this
    }

    /*
    For the default scale dictionary, there are no pentatonic scales
    Major pentatonic:  these  are simply the scale intervals 1:2:3:5:6 of the
    major scale.  So, copy each of the major scales and delte the 4th and seventh
    intervals.
    
    Minor pentatonic:  these are the 1:b3:4:5:b7 of the natural minor scale.
    So, copy each of the melodic scales and delete the 2nd and 6th.  Then
    flatten the seventh.  All forms are within the range of the fingering when flatter the seventh.
    
    Blues scale:  These are the same as minor pentatonic with added #11 (blue note)
    Copy each of the minor pentatonics, and add the blue note
    */

get id() {return this._id}
set id( dictId) {this._id = dictId}

get activeScale() {
  let scale = undefined;

  for (const s of this.scales) {
    if (s.id === this._activeScaleId) {
      scale = s;
      break;
    }
  }

  return scale;
}


set activeScale( s ) { this._activeScaleId = s.id }

createScaleId() {
  let maxId = 0;

  for (const s of this.scales) {
    if (s.id > maxId) {
      maxId = s.id;
    }
  }

  return maxId + 1;
}



hydrateScales(jsonScales) {

  try{
    this.scales = [];

  // Load base scales
  for (const json_scale of jsonScales) {
    const scale = new Scale(json_scale._id);
    scale._form = json_scale._form;
    scale._quality = json_scale._quality;
    scale._isArpeggio = json_scale._isArpeggio;
    this.scales.push(scale);

    for (const json_note of json_scale.notes) {
      const note = new Note({
        stringNumber: parseInt(json_note.string),
        fret: parseInt(json_note.fret),
        interval: json_note.interval,
        finger: json_note.finger
      });
      scale.addNote(note);
    }
  }

  // // Pentatonic scales
  // for (const scale of this.scales) {
  //   if (scale.quality === "Maj") {

  //     const pentScale = scale.copy();
  //     this.scales.push(pentScale);

  //     pentScale._id = this.createScaleId();
  //     pentScale.quality = "PMAJ";
  //     pentScale.form = scale.form;

  //     pentScale._c_notes = [];
  //     for (const note of scale._c_notes) {
  //       if (note.interval !== "7" && note.interval !== "4") {
  //         pentScale._c_notes.push(note.copy());
  //       }
  //     }

  //     pentScale._r_notes_cache = [];
  //     pentScale.setMode("Pentatonic Major");
  //   }

  //   else if (scale.quality === "MM") {

  //     const pmScale = scale.copy();
  //     this.scales.push(pmScale);

  //     pmScale._id = this.createScaleId();
  //     pmScale.quality = "PMIN";
  //     pmScale.form = scale.form;

  //     pmScale._c_notes = [];

  //     for (const note of scale._c_notes) {

  //       if (note.interval !== "2" && note.interval !== "6" && note.interval !== "7") {
  //         pmScale._c_notes.push(note.copy());
  //       }

  //       if (note.interval === "7") {
  //         const b7Note = note.copy();
  //         b7Note.fret = +b7Note.fret - 1;
  //         b7Note.interval = "b7";

  //         if (b7Note.finger === "1") b7Note.finger = "1s";
  //         else if (b7Note.finger === "4s") b7Note.finger = "4";
  //         else b7Note.finger = +b7Note.finger - 1;

  //         pmScale._c_notes.push(b7Note);
  //       }
  //     }

  //     pmScale._r_notes_cache = [];
  //     pmScale.setMode("Pentatonic Minor");
  //   }
  // }

  // // Diminished scale expansions
  // for (const scale of this.scales) {
  //   if (scale.quality === "DIM") {

  //     scale.form = "c";
  //     scale.setMode("Diminished");

  //     for (const letter of ["a", "b", "d"]) {

  //       const dimScale = scale.copy();
  //       dimScale._id = this.createScaleId();
  //       dimScale.form = letter;
  //       this.scales.push(dimScale);

  //       const intervals = dimScale.getIntervals();

  //       for (const note of dimScale._c_notes) {

  //         if (letter === "a") {
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.fret -= 6;
  //         }

  //         if (letter === "b") {
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.fret -= 3;
  //         }

  //         if (letter === "d") {
  //           note.interval = intervals.next(note.interval);
  //           note.interval = intervals.next(note.interval);
  //           note.fret += 3;
  //         }
  //       }

  //       dimScale._r_notes_cache = [];
  //       dimScale.recalcPositions();
  //     }
  //   }
  // }

  // // Whole tone scale expansions
  // for (const scale of this.scales) {
  //   if (scale.quality === "WT") {

  //     scale.form = "d";
  //     scale.setMode("Diminished");

  //     for (const letter of ["a", "b", "c", "e", "f"]) {

  //       const wtScale = scale.copy();
  //       wtScale._id = this.createScaleId();
  //       wtScale.form = letter;
  //       this.scales.push(wtScale);

  //       const intervals = wtScale.getIntervals();

  //       for (const note of wtScale._c_notes) {

  //         if (letter === "a") {
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.fret -= 6;
  //         }

  //         if (letter === "b") {
  //           note.interval = intervals.previous(note.interval);
  //           note.interval = intervals.previous(note.interval);
  //           note.fret -= 4;
  //         }

  //         if (letter === "c") {
  //           note.interval = intervals.previous(note.interval);
  //           note.fret -= 2;
  //         }

  //         if (letter === "e") {
  //           note.interval = intervals.next(note.interval);
  //           note.fret += 2;
  //         }

  //         if (letter === "f") {
  //           note.interval = intervals.next(note.interval);
  //           note.interval = intervals.next(note.interval);
  //           note.fret += 4;
  //         }
  //       }

  //       wtScale._r_notes_cache = [];
  //       wtScale.recalcPositions();
  //     }
  //   }
  // }

  // // Set default active scale
  // this.activeScale = this.scaleWithId(6);
  // this.activeScale.setRoot("C");
  // this.activeScale.setMode("Major");

  return this;

}
catch(e){
console.log("hydrate scales error: ", e)
}
}



scaleWithId(id) {
  for (const nextScale of this.scales) {
    if (nextScale.id === id) {
      return nextScale;   
    }
  }
  return undefined;
}


    // return all scales with quality i.e. the part of the identifier before the ":"
scalesWithQuality(q) {
  const scales = [];

  for (const nextScale of this.scales) {
    if (nextScale.quality === q) {
      scales.push(nextScale);
    }
  }

  return scales;
}

    // assume only one scale with a quality and form
scaleWithQualityAndForm(q, f) {
  for (const nextScale of this.scales) {
    // console.log(`nextScale.quality: ${nextScale.quality} q: ${q} nextScale.form ${nextScale.form } f: ${f}`)
    if (nextScale.quality == q && nextScale.form == f) {
      return nextScale;   // early exit
    }
  }
  return undefined;
}

    /*
     http://hostname/scales/root/mode/form
        */
    setActiveScaleFromURL(url) {

        let correctURL = url
        if (correctURL.slice(-1) === "#") {
            correctURL = correctURL.slice(0, -1)
        }

        /* there is a bug where sometimes the url is postfixed with #
        and can't figure out why.
        for now, remove it if it exists
        */
        // alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
        const href = correctURL.split("//")[1] // ignore http:// and https://
        const components = href.split("/") // hostname/scales/root/mode/form

        let urlRoot = "C"
        let urlForm = "2"
        let urlMode = "Major"

        if (components.length >= 5) {
            urlForm = components[4]
        }
        if (components.length >= 4) {
            urlMode = decodeURIComponent(components[3])
        }
        if (components.length >= 3) {
            urlRoot = components[2]
        }

        // this.setRoot(urlRoot)
        // this.setMode(urlMode)
        // this.setForm(urlForm)
        const scale = this.setActiveScale({
            root: urlRoot,
            mode: urlMode,
            form: urlForm,
        })

    }
    /*
    setActiveScale: if an option is missing, assume it is the same as the current active scale
    */
    setActiveScale(options) {

        try {


            let scale = this.getActiveScale(true) // true means create if needed
            let quality = scale.quality
            let mode = scale.mode
            let root = scale.getRoot()
            let form = scale.form

            /* with the mode need to be careful
            if the quality has changed, and the mode is not in the otpions
             se the mode to the default mode
             if neither mode nor quality are specified, or both are specified
             then it is not a problem
            */
            if (typeof options.quality === "undefined" && typeof options.mode !== "undefined") {
                quality = this.qualityFromMode(options.mode)
                const availableForms = this.scaleFormNames(quality)
                if (availableForms.indexOf(form) === -1) {
                    form = availableForms[0]
                }
            }

            else if (typeof options.quality !== "undefined" && typeof options.mode === "undefined") {
                quality = options.quality
                if (quality === "MM") { mode = 'Melodic Minor'} 
                else if (quality === "Maj") { mode = 'Major'} 
                else if (quality === "DIM") { mode = 'Diminished'} 
                else if (quality === "WT") { mode = 'Whole Tone'} 
                else if (quality === "PMAJ") { mode = 'Pentatonic Major'} 
                else if (quality === "PMIN") { mode = 'Pentatonic Minor'} 
                else if (quality === "MINORBLUE") { mode = 'Minor Blues'} 
                else if (quality === "MAJORBLUE") { mode = 'Major Blues'} 
                else if (quality === "PENT7b9") { mode = 'Pentatonic 7b9'} 
                else if (quality === "ARP7") { mode = '7 Arp'} 
                else if (quality === "ARPm7") { mode = 'm7 Arp'} 
                else if (quality === "ARPmaj7") { mode = 'maj7 Arp'} 
                else if (quality === "ARPm7b5") { mode = 'm7b5 Arp'} 

            }

            else if (typeof options.quality !== "undefined" && typeof options.mode !== "undefined") {
                quality = options.quality
                mode = options.mode
            }



            // throw "ScaleDictionary.setActiveScale: A mode must be specified when changing scale quality "
            if (typeof options.form !== "undefined") {
                form = options.form
            }

            // need to be careful here - form may not be directly transferrable to some scales
            // eg form for a major mode is not available in diminished scale
          
            scale = this.scaleWithQualityAndForm(quality, form)
            if (typeof scale === "undefined") {
                // likely form is not available so just take the first scale of the quality
                scale = this.scalesWithQuality(quality)[0]
            }
            this.activeScale = scale
        

            if (typeof scale === "undefined")
                throw "ScaleDictionary.setActiveScale: Could not find scale with scale id '" + scaleId + "'"

            if (typeof options.root !== "undefined") { root = options.root} 
            scale.setRoot(root)

            if (typeof options.mode !== "undefined") { mode = options.mode} 
            scale.setMode(mode)

            return this
        }


        catch (err) {
            console.log("%c" + err, "color: red;")
            console.log( err.stack)
        }

    }


 qualityFromMode(mode) {
        let quality = "Maj"
        if (Object.keys(MM_INTERVALS).indexOf(mode) !== -1) { quality = "MM"} 
        else if (Object.keys(HM_INTERVALS).indexOf(mode) !== -1) { quality = "HM"} 
        // Other - the quality is just the name
        else if (mode === "Pentatonic Major") { quality = "PMAJ"} 
        else if (mode === "Pentatonic Minor") { quality = "PMIN"} 
        else if (mode === "Diminished") { quality = "DIM"} 
        else if (mode === "Whole Tone") { quality = "WT"} 
        else if (mode === "Minor Blues") { quality = "MINORBLUE"} 
        else if (mode === "Major Blues") { quality = "MAJORBLUE"} 
        else if (mode === "Pentatonic 7b9") { quality = "PENT7b9"} 
        else if (mode === "7 Arp") { quality = "ARP7"} 
        else if (mode === "m7 Arp") { quality = "ARPm7"} 
        else if (mode === "maj7 Arp") { quality = "ARPmaj7"} 
        else if (mode == "m7b5 Arp") { quality = 'ARPm7b5'} 

        return quality
    }
    getName() {
        return this.name
    }
    setName(name) {
        this.name = name
    }
    /* return all scales that contain the chord tones in the chord
    as the scale modes are not in 'C'
    e.g. Dorian is in D
    they need to be transposed to C first
    for chords, use the non-transformed 'C' chords
    It is only necessary to check one scale form - make it the '2' form
    */
   
modeNamesForChord(chord) {

  const chordLetters = chord.getNoteLetters();
  const allModes = this.scaleNames();

  // Major scale template (form 2, quality Maj)
  const majScale = this.scales.filter(s =>
    s.form == 2 && s.quality === "Maj"
  )[0];

  const foundModes = [];

  // Major modes
  for (const modeName of allModes.major) {
    const scale = majScale.copy();
    scale.clearCache();
    scale.setRoot(chord.root);
    scale.setMode(modeName);
    scale.notes

    const scaleLetters = scale.getNoteLetters();
    let ok = true;

    for (const letter of chordLetters) {
      if (!scaleLetters.includes(letter)) {
        ok = false;
        break;
      }
    }

    if (ok) foundModes.push(modeName);
  }

  // Melodic minor template (form 2, quality MM)
  const mmScale = this.scales.filter(s =>
    s.form == 2 && s.quality === "MM"
  )[0];

  // Melodic minor modes
  for (const modeName of allModes.melodic_minor) {
    const scale = mmScale.copy();
    scale.setRoot(chord.root);
    scale.setMode(modeName);

    const scaleLetters = scale.getNoteLetters();
    let ok = true;

    for (const letter of chordLetters) {
      if (!scaleLetters.includes(letter)) {
        ok = false;
        break;
      }
    }

    if (ok) foundModes.push(modeName);
  }

  // Other scale qualities (WT, DIM, PMIN, PMAJ, BLUE, etc.)
  const foundQualities = [];

  for (const scale of this.scales) {
    const q = scale.quality;
    if (!foundQualities.includes(q) && q !== "Maj" && q !== "MM") {
      foundQualities.push(q);
    }
  }

  for (const quality of foundQualities) {

    let scale = this.scales.filter(s => s.quality === quality)[0];
    scale = scale.copy();

    scale.setRoot(chord.root);

    const modeName = QUALITIES[quality];
    scale.setMode(modeName);

    const scaleLetters = scale.getNoteLetters();
    let ok = true;

    for (const letter of chordLetters) {
      if (!scaleLetters.includes(letter)) {
        ok = false;
        break;
      }
    }

    if (ok) foundModes.push(modeName);
  }

  return foundModes;
}


    scaleNames() {


        var majScales = []
        for (var scale in MAJOR_INTERVALS) {
            majScales.push(scale)

        }

        var mmScales = []
        for (var scale in MM_INTERVALS) {
            mmScales.push(scale)

        }

        var hmScales = []
        for (var scale in HM_INTERVALS) {
            hmScales.push(scale)

        }

        let arpScales = []
        for (var scale in ARPEGGIO_INTERVALS) {
            arpScales.push(scale)
        }



        let otherScales = []
        for (var scale in OTHER_INTERVALS) {
            otherScales.push(scale)

        }

        
    
        return {
            major: majScales,
            melodic_minor: mmScales,
            harmonic_minor: hmScales,
            arpeggio: arpScales,
            other: otherScales,

        }
    }

    arpeggioNames(){

     const aNames = []  
     this.scales.forEach((scale) => {
        if(scale._isArpeggio == "Y") {
            if( aNames.indexOf(scale.quality) == -1) {
              aNames.push(scale.quality)
            }
        }

     } )

     return aNames
    }    // arpeggioNames


    


    scaleFormNames(quality = "Maj") {

        let unique = []
       for (const scale of dc.SCALE_MANAGER.activeDict.scales) {
        const form = scale.form;

        if (!unique.includes(form)) {
          if (quality !== undefined) {
            if (scale.quality === quality) unique.push(form);
          } else {
            unique.push(form);
          }
        }
}


        return unique
    }
    /*
    position is defined as finger 1
    using the active scale root and scale quality
    find the scale closest to the postionls -l
    
    
    for major scales, this should be an exact match
    */
    // this is WRONG - do not need to transpose for node
    // only need to reset the ***intervals**** for the node
    getActiveScale(create = false) {
        if (typeof this.activeScale === "undefined" && create === true) {
            this.scale = this.scaleWithId(6) // 6 is Major scale, form 2
        }
        return this.activeScale
    }

// // strDir is "next" or "prev"
// setFormFromFret2( newFret, strDir, loop=true){
//         const self = this
//         let scale = this.getActiveScale()
//         let mode = scale.mode
//         let root = scale.getRoot()
//         let quality = scale.quality
//         let scales = []
//         let scaleQual = "Maj"
//         if (Object.keys(MAJOR_INTERVALS).indexOf(mode) !== -1) {
//             scaleQual = "Maj"
//         }
//         else if (Object.keys(MM_INTERVALS).indexOf(mode) !== -1) {
//             scaleQual = "MM"
//         }
//         else if (Object.keys(HM_INTERVALS).indexOf(mode) !== -1) {
//             scaleQual = "HM"
//         }

//         else if (mode == "Pentatonic Major") { scaleQual = "PMAJ"} 
//         else if (mode == "Pentatonic Minor") { scaleQual = "PMIN"} 
//         else if (mode == "Minor Blues") { scaleQual = "MINORBLUE"} 
//         else if (mode == "Major Blues") { scaleQual = "MAJORBLUE"} 
//         else if (mode == "Pentatonic 7b9") { scaleQual = 'PENT7b9'} 
//         else if (mode == "Diminished") { scaleQual = "DIM"; } 
//         else if (mode == "Whole Tone") { scaleQual = "WT"} 
//         else if (mode == "7 Arp") { scaleQual = 'ARP7'} 
//         else if (mode == "m7 Arp") { scaleQual = 'ARPm7'} 
//         else if (mode == "maj7 Arp") { scaleQual = 'ARPmaj7'} 
//         else if (mode == "m7b5 Arp") { scaleQual = 'ARPm7b5'} 

//         let forms = this.scaleFormNames(scaleQual)
//         for (const formName of forms) {
//           const scale = self.scaleWithQualityAndForm(scaleQual, formName);
//           scale.setRoot(root);
//           scale.setMode(mode);
//           scales.push(scale);
//         }



//         scales.sort( (a, b) => {
//             if(strDir == "next") {  return a.transformedPosition() - b.transformedPosition()  }
//             else { return b.transformedPosition() - a.transformedPosition()  }
            
//             })

//       for (let i = 0; i < scales.length; i++) {
//         const nextScale = scales[i];

//         if (strDir === "next" && nextScale.transformedPosition() >= newFret) {
//           self.setActiveScale(nextScale);
//           break; // jQuery's "return false"
//         }

//         if (strDir === "prev" && nextScale.transformedPosition() <= newFret) {
//           self.setActiveScale(nextScale);
//           break; // jQuery's "return false"
//         }

//         // If we reached the last scale and looping is enabled
//         if (i === scales.length - 1 && loop === true) {
//           self.setActiveScale(scales[0]);
//         }
//       }

   
//     }



// required args:  args.fret, args.root, args.quality, args.mode
getScaleNearestFret(args) {
// console.log("getScaleNearestFret args: ", args)
let scales = this.scalesWithQuality(args.quality )
const nearest = { fret: 100, scale: null };

for (let scale of scales) {
  scale.root=args.root
  scale.mode=args.mode
  const position = scale.transformedPosition();
  // console.log("transformedPosition: ", position)
  const diff = Math.abs(position - args.fret);
  // console.log("DIFF: ", diff)
  if( diff < nearest.fret ) {
    nearest.fret = diff
    nearest.scale = scale
    // console.log("setting nearest: ", nearest)
    }
  if (diff === 0) {
      // found it - return immediately
         return scale
        }

  }

return nearest.scale
}

//     // ignoreForm arg added which is flag to ingore the form when calculated nearest form
//   setFormFromFret(fret, ignoreActive = true) {

//   let scale = this.getActiveScale();
//   const mode = scale.mode
//   const root = scale.getRoot();

//   // Determine scale quality category from mode
//   let scaleQual = "Maj";

//   if (Object.keys(MAJOR_INTERVALS).includes(mode)) {
//     scaleQual = "Maj";
//   } else if (Object.keys(MM_INTERVALS).includes(mode)) {
//     scaleQual = "MM";
//   } else if (Object.keys(HM_INTERVALS).includes(mode)) {
//     scaleQual = "HM";
//   } else if (mode === "Pentatonic Major") {
//     scaleQual = "PMAJ";
//   } else if (mode === "Pentatonic Minor") {
//     scaleQual = "PMIN";
//   } else if (mode === "Minor Blues") {
//     scaleQual = "MINORBLUE";
//   } else if (mode === "Major Blues") {
//     scaleQual = "MAJORBLUE";
//   } else if (mode === "Pentatonic 7b9") {
//     scaleQual = "PENT7b9";
//   } else if (mode === "Diminished") {
//     scaleQual = "DIM";
//   } else if (mode === "Whole Tone") {
//     scaleQual = "WT";
//   } else if (mode === "7 Arp") {
//     scaleQual = "ARP7";
//   } else if (mode === "m7 Arp") {
//     scaleQual = "ARPm7";
//   } else if (mode === "maj7 Arp") {
//     scaleQual = "ARPmaj7";
//   } else if (mode === "m7b5 Arp") {
//     scaleQual = "ARPm7b5";
//   }

//   // Find nearest form by comparing transformed positions
//   const forms = this.scaleFormNames(scaleQual);
//   const nearest = { fret: 100, id: undefined };
//   const activeForm = this.activeScale.form;

//   for (const formName of forms) {

//     scale = this.scaleWithQualityAndForm(scaleQual, formName);
//     scale.setRoot(root);
//     scale.setMode(mode);

//     const position = scale.transformedPosition();
//     const diff = Math.abs(position - fret);

//     if (diff < nearest.fret) {
//       if (!(ignoreActive === true && activeForm === formName)) {
//         nearest.fret = diff;
//         nearest.id = scale.id;
//       }
//     }

//     if (position === fret) break;
//   }

//   // Apply the selected scale
//   const chosen = this.scaleWithId(nearest.id);
//   if (chosen) {
//     this.activeScale = chosen;
//   }

//   return this;
// }





// get scales from the server
async ajax_retrieve() {
  try{
  console.log("ajax_retrieve scales data on the server ...");

  const token = await dc.getCSRF_TOKEN() 
  console.log("scale ajax_retrieve token:", token);
// need to use localhost here to align with the backend 
// otherwise get cookie not being sent correctly
  const url = "http://localhost:8000/ajax-scale-dict/";

  // console.log("1: before fetch");
// using form makes it more likely Django will parse i, CSRF middleware accepts it
    // const form = new FormData();
    // form.append("csrfmiddlewaretoken", token);
    // form.append("scale_dict", 1);
    // form.append("sd_ts", 0);


  let response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token
        },
        // body: form
 
      })

  

      const text = await response.text();
      // console.log("ajax_retrieve: got text", text)
      const data = JSON.parse(text);
      // console.log("ajax_retrieve parsed json: ", data)


// console.log("A: before JSON parse");
//     const data = await response.json();
// console.log("B: after JSON parse");


  if(  data) {
  console.log("ajax_retrieve returning data:", data);
  return data;
  }
    
  console.log("ajax_retrieve: something went wrong ... returning null")
  return null
  }

catch(err){
  console.log("error fetching scale data", err)
  return null
}
}




 async load_scales() {
  // console.log("load_scales()) called.")
    if (this._loadingPromise) return this._loadingPromise;
    this._loadingPromise =  this._loadInternal();
    return this._loadingPromise;
  }


async _loadInternal() {

// console.log("_loadInternal()) called. this._loaded", this._loaded)
  if (this._loaded) return;


    try {
      console.log("looking for scales in local db.")
       const db = dc.db// create or open
      //  console.log("dexie db: ", db)

      let stored = await db.scale_dict.orderBy('id').first();
      if( stored) { 
        console.log("Scales found in local db."); 
          // Object.assign(this, { id, name, description, category, author });
          this._id = stored.id
          this.name = stored.name
          this.description = stored.description
          this.category = stored.category
          this.author = stored.author

              // scales
          const storedScales = await db.scales
                                .filter(s => s.dict==this.id)
                                .toArray()
            // console.log("stored scales: ", storedScales)
          storedScales.forEach((s)=>{
          // console.log("creating scale from local db: ", s.id)
          const loaded = Object.assign(new Scale(),  JSON.parse( s.data ) ) 
          loaded._id = s.id
          loaded._quality = s.quality
          loaded._form = s.form
          const arr = []
          // hydrate the notes objects
          for(const n of loaded._c_notes){
            const obj = Object.assign(new Note({}), JSON.parse(JSON.stringify(n)));
            arr.push(obj)
          }
          loaded._c_notes = arr

          this.scales  = [...this.scales, loaded]             
                // scale.
            })
          } // stored


          /****** NOT STORED - GET FROM SERVER ***** */
          else { 
            // console.log("Scales tables does not exist.  Retrieving from server.");  
            //  console.log("calling ajax_retrieve")
          const data = await this.ajax_retrieve();
      // console.log("got data from ajax_retrieve: ", data)
           
      
          if (!data) {
              console.log("No data returned from server.");
              return;
            }

          Object.assign(this, {
                        id: data.scale_dict._id,
                        name: data.scale_dict._name,
                        create_ts: data.scale_dict._create_ts
                      });

          console.log("hydrating scales")
          this.hydrateScales(data.scale_dict.scales)
        
           // write to db
    
      // console.log("writing scale dict : ")
        await db.scale_dict.put({
              // id: this.id,
              // scales: JSON.stringify(this.scales)
              id: this.id,
              name: this.name,
              author: this.author,
              category: this.category,
              description: this.description
              // scales: "TEST2"
                });

      // console.log("writing scales: ",  data.scale_dict.scales)
          //  data.scale_dict.scales.forEach(async(s)=>{
                  // console.log("writing scale: ", s)
            
                 // forEach does not wait for async callbacks.
                 // replaced for for...of
                  for (const s of this.scales) {
              const copy = s.copy();
              delete copy._id;
              delete copy._quality;
              delete copy._form;
              delete copy.create_ts;

              await db.scales.put({
                id: s.id,
                quality: s.quality,
                form: s.form,
                data: JSON.stringify(copy),
                dict: this.id
              });
            }


    } // not stored 
this._loaded = true;
// console.log("BEFORE RETURN");
return
  } // try
  
  catch(e){
      console.log("ScaleDictionary load_scales error: ", e)
  
  }
// console.log("DONE")
} // _loadInternal


} // ScaleDictionary 
    



    
export class ScaleManager {
    constructor(allowOpen = false) {

        this.scaleDictionaries = []

        this.activeSDName= null// name of dictionary the user is currently usings
        this.showNotesTogether = null // dont show notes one at a time
        this.allowOpenStrings = allowOpen
        this.default_scale_dictionary_id = 1 // default scale dictionary, if there is none in local storage
        
        
        return this
    }

  get activeDict() {
    return this.activeSDName == null ? this.scaleDictionaries[0]: this.dictionaryWithName(this.activeSDName)
  
  }


  set activeDict(d){   this.activeSDName = d.name
                    return this
                  }
  
  getActiveQualitiesList() {
        let cDict = this.activeDict
        return cDict.qualitiesList()

    }
    addDictionary(sDict) {
        this.scaleDictionaries.push(sDict)
        /* must always have an active dictionary, if one exists
        if this is the first dictinary added, mark it as active */
        if (this.scaleDictionaries.length == 1) {
            this.activeDict=sDict
        }
        return this
    }
    defaultDictionary() {
        return this.dictionaryWithName("default-scales")
    }
   
    
    dictionaryWithName(name) {
  for (const sDict of this.scaleDictionaries) {
    if (sDict.getName() === name) {
      return sDict;   
    }
  }
  return undefined;
}

  

async load_scales() {
 if( this.scaleDictionaries.length > 0) return null

 const scaleDict = new ScaleDictionary()
 await scaleDict.load_scales() // load the default scales
 this.addDictionary(scaleDict)
}


} // ScaleManager

    

        
    
    
    


