
import dc from '../globals.js'
import Dexie from "dexie"
import  installStringPrototypes  from "./core.js";

installStringPrototypes();   


/* 
only one tuning loaded at a time 
for tuning, as only one object loaded, it is not more efficient to check the timestamp in localstorage
for persistence, the tuning id is stored in cookie
*/

// prepend all keys with an underscore, in preparation for converting to a javascript class
const transformKeys = (obj) => {
  const result = {};

  for (const key of Object.keys(obj)) {
    result["_" + key] = obj[key];
  }

  return result;
};



export class Harmony{
constructor() {
    this._name
    this._symbols
    this._intervals
    this._cat1
    this._cat2
    this._comments
    this._id
    }    
init() {
        
    }
// parent() - for the jstree interface
get parent(){ return "#" }
get text() { return this._text }
set text( t) { this._text = t }
get id() {return this._id }
get name(){ return this._name }
set name(n){ this._name = n }
get symbols(){ return this._symbols }
set symbols( s ){  this._symbols = s }
get intervals(){ return this._intervals }
set intervals( i ){  this._intervals = i }
get cat1(){ return this._cat1 }
set cat1(c){  this._cat1 = c }
get cat2(){ return this._cat2 }
set cat2(c){  this._cat2 = c }
get comments(){ return this._comments }
set comments(c){  this._comments = c }
numberOfChords() {

}


} // Harmony


export class HarmonyManager {
constructor() {
    
        this._dict;
    }

    
get dict() { return this._dict }
set  dict(d ) {this._dict  = d }
get name (){  return this.dict.name }
get genre (){return this.dict.name }
get harmonies() { return this.dict.harmonies
}
get chords() {  return this.dict.chords  }
get chordforms() { return this.dict.chordforms  }

harmonyWithId(my_id) {
  return this.harmonies.find(h => h.id === my_id);
}




chordsWithHarmonyId(my_id) {
  return this.chords.filter(c => c.harmony_id === my_id);
}



chordsWithSymbol(symbol) {
  const stripped = symbol.replace('</sup>', '').replace('<sup>', '').toUpperCase();

  const found_harmony = this.harmonies.find(h =>
    h.symbols.some(s =>
      s.replace('</sup>', '').replace('<sup>', '').toUpperCase() === stripped
    )
  );

  return found_harmony
    ? this.chordsWithHarmonyId(found_harmony.id)
    : undefined;
}





chordformsWithChordId(my_id) {
  return this.chordforms.filter(cf => cf.chord_id === my_id);
}





chordWithId(my_id) {
  console.log("HarmonyManager chordWithId: ", my_id)
  console.log("this.dict: ", this.dict)
  return this.dict.chords.find(c => c.id === my_id);
}



chordformWithId(my_id) {
  return this.dict.chordforms.find(cf => cf.id === my_id);
}





// get all available form id's for this chord e.g. "D2", "D3"
// this is identical to the chord function of the same name, except it traverses all chord forms 

get availableFS() {
  const unique = new Map();

  for (const cf of this.chordforms) {
    const key = `${cf.form}:${cf.string}`;
    if (!unique.has(key)) {
      unique.set(key, { form: cf.form, string: cf.string });
    }
  }

  return [...unique.values()].sort((a, b) => {
    const fa = a.form.toLowerCase();
    const fb = b.form.toLowerCase();
    if (fa !== fb) return fa < fb ? -1 : 1;
    return a.string - b.string;
  });
}









// console.log("fetched data: ",data)
// }
// get harmonies from the server
async ajax_retrieve() {
  console.log("ajax_retrieve for harmony data on the server ...");

  const token = dc.CSRF_TOKEN;
  console.log("ajax-harmonies token:", token);

  const url = "http://127.0.0.1:8000/ajax-harmonies/";

  const prom = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token
    },
    body: JSON.stringify({
      harmony_dict_id: 1
    })
  });

  const response = await prom.json();

  //console.log("ajax_retrieve returning data:", response.harmony_dict);

  return response.harmony_dict;
}



    /*
note: it is usually not necessary to check if database exists
see https://dexie.org/docs/Dexie/Dexie.exists()
If database does not exist, Dexie will create it automatically.
If database exists but on a previous version, Dexie will upgrade it for you.
If database exists on the declared version, Dexie will just open it for you.

however ... as we are using existence of the database to check whether to load
data from the server, the first thing here will be to check this
    */

async load_harmonies() {
  return new Promise(async (resolve, reject) => {
    try {
      const exists = await Dexie.exists("DropChords");

      if (exists) {
        console.log("Dexie DB already exists — loading from IndexedDB");

        const db = new Dexie("DropChords");
        db.version(1).stores({
          harm_dicts: "id"
        });

        const stored = await db.harm_dicts.get({ id: 1 });

        this.dict = stored.harm_dict;

        // hydrate harmonies
        for (const [index, h] of Object.entries(this.dict.harmonies)) {
          this.dict.harmonies[index] = Object.assign(new Harmony(), h);
        }

        // hydrate chords
        for (const [index, c] of Object.entries(this.dict.chords)) {
          const chord = Object.assign(new Chord(), c);
          delete chord._cf_buffer;
          this.dict.chords[index] = chord;
        }

        // hydrate chordforms
        for (const [index, cf] of Object.entries(this.dict.chordforms)) {
          const chordform = Object.assign(new ChordForm(), cf);
          delete chordform._r_notes_cache;
          this.dict.chordforms[index] = chordform;
        }

        resolve();   // ⭐ IMPORTANT
        return;
      }

      // -------------------------
      // FETCH FROM SERVER BRANCH
      // -------------------------

      console.log("Retrieving harmony data from server...");

      const hDict = await this.ajax_retrieve();
      transformKeys(hDict);
      this._dict = hDict;

      // hydrate chords
      for (const [index, cRaw] of Object.entries(this.dict.chords)) {
        let c = transformKeys(cRaw);
        c = Object.assign(new Chord(), JSON.parse(JSON.stringify(c)));
        delete c._cf_buffer;
        this.dict.chords[index] = c;
      }

      // hydrate chordforms
      for (const [index, cfRaw] of Object.entries(this.dict.chordforms)) {
        let cf = transformKeys(cfRaw);
        cf = Object.assign(new ChordForm(), JSON.parse(JSON.stringify(cf)));
        delete cf._r_notes_cache;
        this.dict.chordforms[index] = cf;
      }

      // hydrate harmonies
      for (const [index, hRaw] of Object.entries(this.dict.harmonies)) {
        let h = transformKeys(hRaw);
        h = Object.assign(new Harmony(), JSON.parse(JSON.stringify(h)));
        this.dict.harmonies[index] = h;
      }

      // write to Dexie
      const db = new Dexie("DropChords");
      db.version(1).stores({ harm_dicts: "id" });
      await db.open();

      await db.harm_dicts.add({
        id: this._dict.id,
        harm_dict: this._dict
      });

      resolve();   // ⭐ IMPORTANT
    } catch (err) {
      reject(err);
    }
  });
}




} // HarmonyManager





dc.HARMONY_MANAGER = new HarmonyManager().load_harmonies()



export class Chord{
constructor() {
    this._id
    this._harmony
    this._name
    this._interval_ex
    this._text = "test"
    this._comments
    this._cf_buffer
    }    
    init() {
            
        }
// parent() - for the jstree interface
get parent(){ return "#" }
get id() {return this._id }
get harmony_id() { return this._harmony}
get harmony() { return dc.HARMONY_MANAGER.harmonyWithId(this.harmony_id)}
get text() { return this._text }
set text( t) { this._text = t }

get name(){ 
    if( typeof this._name === "undefined"){
        return this.harmony.name  } 
    return this._name 
    }
set name(n){ this._name = n }
get interval_ex(){ return this._interval_ex }
set interval_ex(e){ this._interval_ex = e }
get comments(){ return this._comments }
set comments(c){  this._comments = c }

get chordforms() {
    const self = this
    /* to avoid repetitive call, buffer the chord forms
    .filter makes a shallow copy, so the buffer contains references to
    the chord forms in the harmony manager 
     */
    if( typeof this._cf_buffer !== "undefined") {
        return this._cf_buffer 
        }
    else{
        this._cf_buffer =  dc.HARMONY_MANAGER.chordforms.filter(function( cf) { return cf.chord_id == self.id })
        return Array.from(this._cf_buffer) // .from returns a new shallow copy of the array
     }
    }


/* return chordforms with form, inversion, string set */


getChordforms(options = {}) {
  const { inversion, form, string, root } = options;

  return this.chordforms
    .filter(cf =>
      (inversion === undefined || cf.inversion === inversion) &&
      (form === undefined || cf.form === form) &&
      (string === undefined || cf.string === string)
    )
    .map(cf => {
      if (root !== undefined) cf.root = root;
      return cf;
    });
}

// getChordform with the options
// if there are more than one, return the first


getChordform(options) {
  return this.getChordforms(options)[0];
}



// preferredSymbol: for now just return the first symbol
preferredSymbol(strip_formatting = false) {
    let symbol =  this.harmony.symbols[0] 
    if( strip_formatting == true) {
        symbol = symbol.replace('</sup>','').replace('<sup>','')
        }
    return symbol
    }


// get all available form id's for this chord e.g. "D2", "D3"
// remember that some chords may not have a full range of chordforms so cannot assume that all forms will be available
// this method returns the available forms
get availableFS() {
  const unique = new Map();

  for (const cf of this.chordforms) {
    const key = `${cf.form}:${cf.string}`;
    if (!unique.has(key)) {
      unique.set(key, { form: cf.form, string: cf.string });
    }
  }

  return [...unique.values()].sort((a, b) => {
    const fa = a.form.toLowerCase();
    const fb = b.form.toLowerCase();
    return fa === fb ? a.string - b.string : fa.localeCompare(fb);
  });
}




    





getNextFS(fs) {
  const arr = this.availableFS;
  const i = arr.findIndex(x => x.form === fs.form && x.string === fs.string);
  return arr[(i + 1 + arr.length) % arr.length];
} // getNextFormAndStringId

getPrevFS(fs) {
  const arr = this.availableFS;
  const i = arr.findIndex(x => x.form === fs.form && x.string === fs.string);
  return arr[(i - 1 + arr.length) % arr.length];
} // getPreviousFormAndStringId

        

get availableFormIds() {
  const set = new Set(this.chordforms.map(cf => cf.form));

  return [...set].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

    


getNextFormId( formId ){
let nextFormId
const arr = this.availableFormIds
const index =  arr.indexOf(formId)
if( index == arr.length - 1) 
    { nextFormId = arr[0] }
else { nextFormId = arr[index + 1] }

return nextFormId
} // getNextFormId

getPrevFormId( formId ){
    let nextFormId
    const arr = this.availableFormIds
    index =  arr.indexOf(formId)
    if( index == 0) 
        { nextFormId = arr[arr.length - 1] }
    else { nextFormId = arr[index - 1] }
    
    return nextFormId
    } // getPrevFormId


isDominant() { return this.harmony.cat1 === "dom"  }
isAlteredDominant() { return this.harmony.cat1 === "min"  }
isMajor() {  return this.harmony.cat1 === "maj"  }
isMinor() { return this.harmony.cat1 === "min"  }


} // Class Chord


export default class ChordForm{
constructor() {
    this._id
    this._tuning
    this._chord
    this._string
    this._inversion
    this._form
    /* _strings are an array of objects for each string in the chordform in the "C" position
        they are **not** note objects - they are the objects as loaded from the backend
    {
       [ string : string
        fret : integer
        finger :  string
         interval : integer
       ],

       ...

    */
    this._strings
    this._text = "test"
    this._comments

    // the following are for in-memory applications and buffering operations  
    this._root
    this._r_notes_cache
    this._transpose = 0; // custom transpose - used for high fret position
    this._enharmonic_bias = "b"; // whether to make notes sharp or flat
    }    
    init() {
            
        }
// parent() - for the jstree interface
get id() {return this._id }
get bassNote() {
  return this._r_notes_cache
    .map(n => n.copy())
    .sort((a, b) => b._stringNumber - a._stringNumber)[0]
    .noteLetter();
}

get chord_id(){return this._chord}
get chord() { return dc.HARMONY_MANAGER.chordWithId( this.chord_id)}
get tuning_id(){return this._tuning}
get parent(){ return "#" }

get text() { return this._text }
set text( t) { this._text = t }

get string(){ return this._string }
set string(s){ this._string = s }
get stringset() {
  const nums = this.strings.map(s => s.string);
  const low = Math.min(...nums);
  const high = Math.max(...nums);
  return `${low}:${high}`;
}

get form(){ return this._form }
set form(f){ this._form = s }
get form_ss () { return this.form + ":" + this.stringset }
get form_s () { return this.form + ":" + this.string }
get strings(){ return this._strings }
get c_strings() { return this._strings }
get inversion(){ return this._inversion }
set inversion(i){ this._inversion = i}
get comments(){ return this._comments }
set comments(c){  this._comments = c }
get enharmonic_bias() { return this._enharmonic_bias    }
set enharmonic_bias(bias) {
    this._enharmonic_bias = bias;
    if( bias == "#") 
        this._root = this._root.enharmonicSharp()
    else if( bias == "b" ) { this._root = this._root.enharmonicFlat() }
}

// V2:  url is much simply - the chordform id and the root /id/root
get url() {
    
    let urlPath =`${this.id}/${this.root}` 
    if (urlPath.length > 0) {
        return window.location.protocol + "//"
            + window.location.host + "/"
            + window.location.pathname.split('/')[1] + "/"
            + urlPath;
    }
}
get root()  { return this._root }

set root(root) {
    console.log("root: ", root)
  if (this._root === root) return;

  // Assign raw root
  this._root = root;

  // Apply enharmonic bias immediately
  if (this.enharmonic_bias === "#") {
    this._root = this._root.enharmonicSharp();
  } else if (this.enharmonic_bias === "b") {
    this._root = this._root.enharmonicFlat();
  }

  // Invalidate and rebuild cache
  this._r_notes_cache = undefined;
  this.notes;
}



 // define position for fret where first finger is fretted

get position() {
  let pos = undefined;

  for (const n of this.notes) {
    if (n.finger === 1) return +n.fret;
    if (n.finger === "1s") pos = +n.fret + 1;
    if (n.finger === 2) pos = +n.fret - 1;
    if (n.finger === 3) pos = +n.fret - 2;
  }

  return pos;
}


// define position for fret where first finger is fretted

get highFret() {
  return Math.max(...this.notes.map(n => n.fret));
}



// define position for fret where first finger is fretted
get lowFret() {
  return Math.min(...this.notes.map(n => n.fret));
}

get namesWithInversion() {
    let names = []
    const notes = this.notes
    if( notes .length > 0) {
        const bassNote = this.notes[notes.length -1]
        if( this.inversion == 1){names.push( `${this.root}${this.chord.harmony.symbols[0]}` )}
        names.push(`${this.root}${this.chord.harmony.symbols[0]}/${this.inversion}`)
        names.push(`${this.root}${ this.chord.harmony.symbols[0] }/${ this.bassNote.noteLetter() }`)
        }
    return names
}


// getNotes() {
get notes() {
  try {
    if (this.root === undefined) {
      throw `ChordForm:getNotes: root is not defined.
             ${this.id}, ${this.chord.name} form: ${this.form} stringset: ${this.stringset} inversion: ${this.inversion}`;
    }

    // Return cached notes if available
    if (this._r_notes_cache && this._r_notes_cache.length > 0) {
      return this._r_notes_cache;
    }

    // Build fresh cache
    this._r_notes_cache = this.strings.map(s =>
      new Note({
        fret: s.fret,
        finger: s.finger,
        stringNumber: s.string,
        interval: s.interval
      })
    );

    // Root-based transpose
    const transpose_st = transpose_lookup[this.root];

    let lowFret = Infinity;

    for (const note of this._r_notes_cache) {
      note.fret += transpose_st;
      if (note.fret < lowFret) lowFret = note.fret;
    }

    const highestAllowedFret = 18;

    // Adjust for low/high fret boundaries
    if (lowFret < dc.LOWEST_ALLOWED_FRET) {
      for (const note of this._r_notes_cache) {
        note.fret += 12;
      }
    } else if (lowFret > highestAllowedFret) {
      for (const note of this._r_notes_cache) {
        note.fret -= 12;
      }
    }

    // Custom transpose
    for (const note of this._r_notes_cache) {
      note.fret += this._transpose;
    }

    // Populate note names
    this.getNoteNames();

    return this._r_notes_cache;
  } catch (err) {
    console.log("%c" + err, "color: red;");
    console.log(err.stack);
  }
}


getNoteLetters(options) {
  const noteLetters = this.notes.map(note => note.noteLetter());

  if (options?.order_by_letter === true) {
    noteLetters.sort((a, b) => {
      if (a === b) return 0;

      // Simple case: both natural notes
      if (a.length === 1 && b.length === 1) {
        return a.localeCompare(b);
      }

      // Compare base letters first
      if (a[0] !== b[0]) {
        return a[0].localeCompare(b[0]);
      }

      // Same base letter → compare accidentals
      if (a.length > 1 && a[1] === 'b') return -1;
      if (a.length > 1 && a[1] === '#') return 1;
      if (b.length > 1 && b[1] === 'b') return 1;
      if (b.length > 1 && b[1] === '#') return -1;

      return 0;
    });
  }

  return noteLetters;
}



// note names are note letters with octave e.g. A3, D#4
// return array of notes for the root
// returned notes are in note name-octave format e.g. D3, E1, etc
// will return the lowest position possible
getNoteNames() {
  return this.notes.map(note =>
    note.noteNameWithBias(this.enharmonic_bias)
  );
}





 // given the root of a chord, convert to fretboard JS format
 toFBJSFormat() {
  const jsfbArr = [];

  for (const note of this.notes) {
    let cssClass = dc.DEFAULT_NOTE_COLOR;

    if (note.interval === 1) cssClass = dc.ROOT_NOTE_COLOR;
    if (note.interval === 3 || note.interval === 'b3') cssClass = dc.THIRD_NOTE_COLOR;
    if (note.interval === 5) cssClass = dc.FIFTH_NOTE_COLOR;
    if (note.interval === 7 || note.interval === 'b7') cssClass = dc.SEVENTH_NOTE_COLOR;

    jsfbArr.push({
      string: {
        letter: note.stringName[0],
        octave: parseInt(note.stringName[1], 10),
      },
      notes: [{
        fret: note.fret,
        cssClass,
        interval: note.interval,
        fingering: note.finger,
      }]
    });
  }

  // Detect if any frets fall below the allowed minimum
  const hasNegative = jsfbArr.some(item =>
    item.notes[0].fret < dc.LOWEST_ALLOWED_FRET
  );

  // If so, shift all frets up by 12
  if (hasNegative) {
    for (const item of jsfbArr) {
      item.notes[0].fret += 12;
    }
  }

  return jsfbArr;
}


getEquivalentChordForms() {
  return this._eq_arr.map(eq => {
    const cf = dc.HARMONY_MANAGER.chordformWithId(eq.id);
    cf.root = this.root.addSemitones(-eq.transpose);
    return cf;
  });
}


// chordform transpose
// only afects _r_notes_cache
// it is responsibility of calling function to ensure that 
// the transposed chord is in fretboard range
// this method simply throws an error if out of range
transpose(st) {
  this._transpose = st;

  for (const note of this._r_notes_cache) {
    const newFret = note.fret + st;

    if (newFret < 0 || newFret > 18) {
      throw "Chord.transpose: transposed fret is out of range";
    }

    note.fret = newFret;
  }

  return this;
}



copy() {
  const clone = new ChordForm();

  // Copy only own enumerable properties
  Object.assign(clone, JSON.parse(JSON.stringify(this)));

  // Rebuild note cache properly
  clone._r_notes_cache = this._r_notes_cache.map(n => n.copy());

  return clone;
}


isSharp() {
        if (this.enharmonic_bias === "#") { return true }
        return false
        }
enharmonicFlat() {
  this.enharmonic_bias = "b";
  this.root = this.root.enharmonicFlat();

  this.notes.forEach(note => {
    note.name = note.name.enharmonicFlat();
  });

  return this;
}

enharmonicSharp() {
  this.enharmonic_bias = "#";
  this.root = this.root.enharmonicSharp();

  this.notes.forEach(note => {
    note.name = note.name.enharmonicSharp();
  });

  return this;
}



isDominant() { return this.chord.isDominant() === "dom"  }
isAlteredDominant() { return this.chord.isAlteredDominant() === "min"  }
isMajor() {  return this.chord.isMajor()  === "maj"  }
isMinor() { return this.chord.isMinor() === "min"  }






} // ChordForm




