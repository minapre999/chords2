"use strict";
import jQuery from 'jquery';
import dc from '../globals.js'
import Note from '/src/harmony/note.js'
export class ChordGroup {
    constructor(  ) {
    this.id
    this._create_ts
    this._mod_ts
    this._quality
    this._name
    return this
}

get id() { return this._id }
copy( ) { 
    const copy = Object.assign(new ChordGroup(),  JSON.parse( JSON.stringify(this) ) ) // deep copy
    return copy
  }

get quality() { return this._quality }
set quality( q) { return this._quality = q }
get name() { 
    // most times, the name will just be the chord quality
    // however, where there are two chord groups with the same quality,
    // the name should be different
    if(typeof this._name == "undefined" || this._name == "") {
        return this.quality
        }
    return this._name
 }
set name( n) { return this._name = n }
get cat1() { return this._cat1 }
set cat1( c) { return this._cat1 = c }
get cat2() { return this._cat2 }
set cat2( c) { return this._cat2 = c }
} // ChordGroup

/*
A Chord is created without root or mode and is in 'C' 'major' or 'melodic minor'
Notes of the basic 'C' chord is stored in the _c_notes variable
A root and mode can be passed to the Chord
The chord can then return notes of the root
These notes are not in the '_r_notes_cache' variable
*/
class OldChord {
    constructor() {
        this._id
        this._cg_id // chord group id
        this._cd_id // chord dictionary id - unlike back end, which is many to many, these are unique to the loaded dictionary
   
        this._c_notes = [] // notes in C position


        // variable for functions that require a root 
        this._root;
        this._r_notes_cache; // notes in root position
        this._transpose = 0; // custom transpose - used for high fret position
        this._enharmonic_bias = "b"; // whether to make notes sharp or flat

        return this;
    }
    get id() {  return this._id  }
    get chord_group_id() {  return this._cg_id  }
    get chord_group() { 
        const cd = CD_MANAGER.getActiveDictionary()
        return cd.getChordGroup( this.chord_group_id )
    }

   // get chord_dictionary_id() {  return this._cd_id  } // this is not useful, as a chord could be in multiple  chord dictionaries
    get root()  { return this._root }
    set root(root  )  {
        if (this._root != root) {
            this._root = root;
            this._r_notes_cache = undefined; // reset cach for notes in root position
            this.getNotes(); // reacalculates the _r_notes_cache cache
        }
    }
get form () {  return this._form  }
set form(f) { this._form = f }
get form_ss () { return this.form + ":" + this.stringSet }

// string() lowest string of stringset
get string( ) {
    if( typeof this._string_cache !== "undefined") {
            return this._string_cache  }
    let string = 100
    $.each(this._c_notes, ( index, n ) => {
        if( n.stringNumber < string) {
            string = n.stringNumber
        }
     })
        
    if( string == 100){
        return 100 } // something has gone wrong 
        
    this._string_cache = string
    return string
}

get stringSet() {
    const sFirst = this._c_notes[0].stringNumber;
    const sLast = this._c_notes[this._c_notes.length - 1].stringNumber;
    return sFirst + "-" + sLast;

}

 /* there is no setQuality method, becuase quality is a separate chord */
 get quality() {
    //return this.Qual;
    return this.chord_group.quality
}
    get enharmonic_bias() { return this._enharmonic_bias    }
    set enharmonic_bias(bias) {
        this._enharmonic_bias = bias;
        this.getNoteNames(); // force update of note naming
    }
get inversion() {
        // notes are ordered from first string to sixth string
        // strings not used in chord are absent so inversion is found on last string
        let inversion = 1;
        if (this._c_notes.length > 1) { // should always be the case
            let note = this._c_notes[this._c_notes.length - 1];
            inversion = note.interval;
        }
        return inversion;
    }
get cat1() { return this.chord_group.cat1 }
get cat2() { return this.chord_group.cat1 }

 copy() {
        const copy = Object.assign(new Chord(), JSON.parse(JSON.stringify(this))); // deep copy
        copy._c_notes = [];
        $.each(this._c_notes, function (index, _c_note) {
            copy._c_notes.push(_c_note.copy());
        });
        copy._r_notes_cache = [];
        $.each(this._r_notes_cache, function (index, _r_note) {
            copy._r_notes_cache.push(_r_note.copy());
        });

        return copy;
    }
    /** chord url in following format:
      hostname/pageurl/root/quality/form-stringset/inversion-number
     **/
    url() {
        let urlPath = this.toString();
        if (urlPath.length > 0) {
            return window.location.protocol + "//"
                + window.location.host + "/"
                + window.location.pathname.split('/')[1] + "/"
                + urlPath;
        }
    }
    /** chord described as url friendly string in following format:
     root/quality/form-stringset/inversion-number
     **/
    toString() {
        let str = this.root
        if (str.length > 0) {
            const cQual = this.quality
            if (typeof cQual !== "undefined" && cQual.length > 0) {
                str = str + "/" + cQual;
                const cFormSS = this.form_ss
                if (typeof cFormSS !== "undefined" && cFormSS.length > 0) {
                    str = str + "/" + cFormSS;
                    const cInv = this.inversion;
                    if (typeof cInv !== "undefined") {
                        str = str + "/" + cInv;
                        return str;
                    }
                }
            }
        }
    }
  

// get all equivalent chords in an array
 getEquivalentChords() {
    try {
        let chords = []
        const chord_dict = CD_MANAGER.getActiveDictionary()
        let eq_chords = chord_dict._eq_chords
        const entries = eq_chords[ String(this.id) ]
        $.each(entries, (index, eqEntry) => {
            const chord = CD_MANAGER.getActiveDictionary().getChordWithId( eqEntry.id )
            chord.root = this.root.addSemitones( eqEntry.st );
            chords.push(chord)
            })
        return chords     
        }
    catch (err) {
        console.log(err.message);
        console.log(err.stack)
        }
 }


    getNotes() {

        if (typeof this._r_notes_cache !== "undefined") {
            return this._r_notes_cache;
        }

        const self = this;
        this._r_notes_cache = [];
        $.each(this._c_notes, function (index, note) {
            let rNote = Object.assign(new Note(), note);
            self._r_notes_cache.push(rNote);
        });
        // fret transformation for chord root relevat to "C"
        let transpose_st = transpose_lookup[this.root];
        // transpose
        let lowFret = 30;
        $.each(this._r_notes_cache, function (index, note) {
            note.fret += transpose_st;
            if (note.fret < lowFret) {
                lowFret = note.fret;
            }
        });
        const highestAllowedFret = 18;
        if (lowFret < dc.LOWEST_ALLOWED_FRET) {
            $.each(this._r_notes_cache, function (index, note) {
                note.fret += 12;
            });
        }
        else if (lowFret > highestAllowedFret) {
            $.each(this._r_notes_cache, function (index, note) {
                note.fret -= 12;
            });
        }

        // custom transpose - used to record high fret positions
        // this transpose is done after setting of root and associated transposes
        $.each(this._r_notes_cache, function (index, note) {
            note.fret += self._transpose;

        });
        /* getNoteNames() this will populate the note names for each _r_notes_cache
        using the current enharmonic bias   */
        this.getNoteNames();

        return this._r_notes_cache;
    }
    getNoteForInterval(interval) {
        let notes = this.getNotes();
        let foundNote = undefined;
        $.each(notes, function (index, note) {
            if (note.interval === interval) {
                foundNote = note;
                return false;
            }
        });
        return foundNote;
    }
    getNoteLetters(options) {
        let notes = this.getNotes();
        let noteLetters = [];
        $.each(notes, function (index, note) {
            let letter = note.letter;
            noteLetters.push(letter);
        });
        if (typeof options !== "undefined" && options.order_by_letter === true) {
            noteLetters.sort(function (a, b) {
                if (a === b) { return 0; }
                if (a.length === 1 && b.length === 1) { return a.localeCompare(b); }
                if (a[0] != b[0]) { return a[0].localeCompare(b[0]); }
                // the same base note - the only difference is accidentals
                if (a.length > 1 && a[1] === 'b') { return -1; } // a is less than b
                if (a.length > 1 && a[1] === '#') { return 1; }
                if (b.length > 1 && b[1] === 'b') { return 1; }
                if (b.length > 1 && b[1] === '#') { return -1; }
                return a - b;
            });
        }
        return noteLetters;
    }
    // note names are note letters with octave e.g. A3, D#4
    // all chords are in C
    // return array of notes for the passed root
    // returned notes are in note name-octave format e.g. D3, E1, etc
    // will return the lowest position possible
    getNoteNames() {
        const self = this;
        const notes = this.getNotes();
        let noteNames = [];
        $.each(notes, function (index, note) {
            let name = note.noteName(self.enharmonic_bias);
            noteNames.push(name);
        });
        return noteNames;
    }
    isSharp() {
        if (this.enharmonic_bias === "#") {
            return true;
        }
        return false;
    }
    enharmonicFlat() {
        this.enharmonic_bias = "b";
        $.each(this.getNotes(), function (i, note) {
            note.name = note.name.enharmonicFlat();
        });
        return this;
    }
    enharmonicSharp() {
        this.enharmonic_bias = "#";
        $.each(this.getNotes(), function (i, note) {
            note.name = note.name.enharmonicSharp();
        });
        return this;
    }

    // define position for fret where first finger is fretted
    getPosition() {
        let position = undefined;
        let noteArr = this.getNotes();
        $.each(noteArr, function (index, note) {
            if (note.finger == 1) { position = +note.fret; return false; }
            else if (note.finger == "1s") { position = +note.fret + 1; }
            else if (note.finger == 2) { position = +note.fret - 1; }
            else if (note.finger == 3) { position = +note.fret - 2; }
        });
        return position;
    }
    // define position for fret where first finger is fretted
    getHighFret() {
        let highFret = -1;
        let noteArr = this.getNotes();
        $.each(noteArr, function (index, note) {
            if (note.fret > highFret) {
                highFret = note.fret;
            }
        });
        return highFret;
    }
    // define position for fret where first finger is fretted
    getLowFret() {
        let lowFret = 100;
        let noteArr = this.getNotes();
        $.each(noteArr, function (index, note) {
            if (note.fret < lowFret) {
                lowFret = note.fret;
            }
        });
        return lowFret;
    }

    
 
   

   
    isDominant() {
        return this.chord_group.cat1 === "dom";
    }
    isAlteredDominant() {
        return this.chord_group.cat1 === "min";
    }
    isMajor() {
        return this.chord_group.cat1 === "maj";
    }
    isMinor() {
        return this.chord_group.cat1 === "min";
    }

    // getNoteNameAfter is not limited to the 4 or 6 notes 
    // it simply returns the next note name of the chord
    // returns -1 if the note letter for nn is not found
    getNoteNameAfter(options) {
        try {
            const nn = options.afterNote;
            const targetInterval = options.targetInterval;
            const nnOctave = parseInt(nn.substr(nn.length - 1, 1));
            const nnLetter = nn.substr(0, nn.length - 1);

            if (typeof targetInterval !== "undefined") {
                let foundNote = undefined;
                $.each(this.getNotes(), function (index, note) {
                    if (note.interval == targetInterval) {
                        // found note
                        const foundLetter = note.letter;
                        foundNote = foundLetter + nnOctave;
                        if (foundLetter < nnLetter) { foundNote = foundLetter + (+nnOctave + 1); }
                        return foundNote;
                    }
                });
                if (typeof foundNote === "undefined")
                    throw "Chord.getNoteNameAfter:  could not find target interval";
                return foundNote;

            } // targetInterval options

            const letters = this.getNoteLetters({ order_by_letter: true });
            if (letters.includes(nnLetter)) {
                // nn is a chord tone
                const index = letters.indexOf(nnLetter);
                if (index === -1) { return -1; }
                let nextLetter = letters[0];
                if (index < letters.length - 1) {
                    nextLetter = letters[index + 1];
                }
                let noteName = nextLetter + nnOctave;
                if (nextLetter < nnLetter) { noteName = nextLetter + (nnOctave + 1); }
                return noteName;
            }
            else {
                // nn is not a chord tone - return the next letter that is a chord tone
                const flatLetter = nnLetter.enharmonicFlat();
                const flatIndex = note_transpose.flats.indexOf(flatLetter);
                const flatOctave = note_transpose.relative_octave[flatIndex];
                let closestSt = 12;
                let closestLetter = undefined;
                let closestRelOctave = undefined;
                $.each(letters, function (index, letter) {
                    let chordLetter = letter.enharmonicFlat();
                    let chordIndex = note_transpose.flats.indexOf(chordLetter);
                    let chordRelOctave = note_transpose.relative_octave[chordIndex];
                    if (chordIndex - flatIndex < 0) { chordIndex += 12; chordRelOctave += 1; } // want next hightest
                    if (chordIndex - flatIndex < closestSt) {
                        closestSt = chordIndex - flatIndex;
                        closestLetter = letter;
                        closestRelOctave = chordRelOctave;
                    }
                });
                // +flatOctive - unary + operator converts to a number
                // see http://xkr.us/articles/javascript/unary-add/
                return closestLetter + (+nnOctave + +closestRelOctave);
            } // nn not chord tone
        } // try
        catch (err) {
            console.log("%c" + err, "color: red;");
            console.log(err.stack)
        }
    }
    getNoteNameBefore(options) {
        try {
            const nn = options.beforeNote;
            const targetInterval = options.targetInterval;
            const nnOctave = parseInt(nn.substr(nn.length - 1, 1));
            const nnLetter = nn.substr(0, nn.length - 1);

            if (typeof targetInterval !== "undefined") {
                let foundNote = undefined;
                $.each(this.getNotes(), function (index, note) {
                    if (note.interval == targetInterval) {
                        // found note
                        const foundLetter = note.letter;
                        foundNote = foundLetter + nnOctave;
                        if (foundLetter > nnLetter) { foundNote = foundLetter + (+nnOctave - 1); }
                        return false;
                    }
                });
                if (typeof foundNote === "undefined")
                    throw "Chord.getNoteNameBefore:  could not find target interval";
                return foundNote;
            } // targetInterval options

            const letters = this.getNoteLetters({ order_by_letter: true }).reverse();
            if (letters.includes(nnLetter)) {
                // nn is a chord tone
                const index = letters.indexOf(nnLetter);
                if (index === -1) { return -1; }
                let nextLetter = letters[0];
                if (index < letters.length - 1) {
                    nextLetter = letters[index + 1];
                }
                let noteName = nextLetter + nnOctave;
                if (nextLetter > nnLetter) { noteName = nextLetter + (nnOctave - 1); }
                return noteName;
            }
            else {
                // nn is not a chord tone - return the next letter that is a chord tone       
                const flatLetter = nnLetter.enharmonicFlat();
                const flatIndex = note_transpose.flats.indexOf(flatLetter);
                const flatOctave = note_transpose.relative_octave[flatIndex];
                let closestSt = -12;
                let closestLetter = undefined;
                let closestRelOctave = undefined;
                $.each(letters, function (index, letter) {
                    let chordLetter = letter.enharmonicFlat();
                    let chordIndex = note_transpose.flats.indexOf(chordLetter);
                    let chordRelOctave = note_transpose.relative_octave[chordIndex];
                    if (chordIndex - flatIndex > 0) { chordIndex -= 12; chordRelOctave -= 1; } // want next hightest
                    if (chordIndex - flatIndex > closestSt) {
                        closestSt = chordIndex - flatIndex;
                        closestLetter = letter;
                        closestRelOctave = chordRelOctave;
                    }
                });
                return closestLetter + (+nnOctave + +closestRelOctave);
            } // nn not chord tone
        } // try
        catch (err) {
            console.log("%c" + err, "color: red;");
            console.log(err.stack)
        }
    }
    // chord transpose
    // only afects _r_notes_cache
    // it is responsibility of calling function to ensure that 
    // the transposed chord is in fretboard range
    // this method simply throws an error if out of range
    transpose(st) {

        const self = this;
        this._transpose = st; // record the transpose for any future _r_notes_cache cache updates
        $.each(this._r_notes_cache, function (index, note) {
            note.fret += self._transpose;
            if (note.fret < 0 || note.fret > 18)
                throw "Chord.transpose:  transposed fret is out of range";
        });
        return this;


    }
    // given the root of a chord, convert to fretboard JS format
    toFBJSFormat() {
        const self = this;
        let root = this.root;


        // fret transformation for chord root relevat to "C"
        let jsfbArr = [];
        $.each(this._c_notes, function (index, note) {
            let cssClass = dc.DEFAULT_NOTE_COLOR;
            if (note.interval == 1) { cssClass = dc.ROOT_NOTE_COLOR; }
            if (note.interval == 3 || note.interval == 'b3') { cssClass = dc.THIRD_NOTE_COLOR; }
            if (note.interval == 5 || note.interval == '5') { cssClass = dc.FIFTH_NOTE_COLOR; }
            if (note.interval == 7 || note.interval == 'b7') { cssClass = dc.SEVENTH_NOTE_COLOR; }

            const r_note = self._r_notes_cache[index];
            const jsfbNote = {
                string: {
                    letter: note.stringName[0],
                    octave: parseInt(note.stringName[1]),
                },
                notes: [{
                    fret: r_note.fret,
                    cssClass: cssClass,
                    interval: note.interval,
                    fingering: note.finger,
                }]
            };
            jsfbArr.push(jsfbNote);
        });

        var has_negative = false;
        $.each(jsfbArr, function (key, value) {
            if (value.notes[0].fret < dc.LOWEST_ALLOWED_FRET) {
                has_negative = true;
            } // set this to "< 0" if want to allow open strings
        });
        if (has_negative) {
            $.each(jsfbArr, function (index, value) {
                jsfbArr[index].notes[0].fret += 12;
            });
        }

        return jsfbArr;
    }
}








    




    


















































/*
ChordDictionary stores the chord data
Ultimately want to allow users to be able to make and share their own chord dictionaries
Proably best to store as files, with metadata in a Postrgres db
Due to size, could be overkill to use AWS to store the chord json files ?
*/

export default class ChordDictionary {
    constructor(id, name) {
        this._id = id
        this._name = name // required - name is like an id - unique to dictionaries in the cd manager
        this._chord_groups
        this.description
        this.author
        this.category // jazz, folk, etc.  categories to be determined
        this.chords // chords from jason

        // the following are calculated after chord data are loaded
        this.majorQualities
        this.minorQualities
        this.alteredDominantQualities
        this.colorDominantQualities
        return this
    }
 get id() { return Number(this._id) }
 get name() {  return this._name }
 set name( name ) {  this._name = name }
    // getId() {
    //     return Number(this.cd_id);
    // }
    // getName() {
    //     return this.name;
    // }
    // setName(name) {
    //     this.name = name;
    // }
 get chord_groups() {  return this._chord_groups }


    getChordWithId(id) {
        return this.getMasterChordWithId(id).copy();
    }
    
    /*
    getMasterChordWithId returns the ORIGINAL chord, not a copy
    Only to be used for chord editing
    */
    getMasterChordWithId(id) {
        const chords = this.chords.filter(function (nextChord) {
            return nextChord.id == id
        });
        return chords[0]
    }
    // updated so only mandatory option is quality
    // updated to return a copy of the chord - this means the  chord can
    // be used in multiple circumstances without fear of changing the original or 
    // a chord in another context
    getChords(options) {

        try {
            if (typeof options === "undefined") { return this.chords; }

            let chords = [];
            let form = options.form // form: D2 , D3 
            let quality = options.quality // chord quality: Maj7, Maj7#11, 7, m7, etc
            // if (typeof options.quality !== undefined ) throw "'quality' argument to ChordDictionary:getChords is obsolete"
            // if (typeof options.cg_id === undefined ) throw "no 'cg_id' argument to ChordDictionary:getChords is obsolete"

            let stringNumber = options.stringNumber
            let inversion = options.inversion
            // the chord filter should return about 4 chords if all options are filled out
            chords = this.chords.filter(function (currentValue, index, arr) {

                if (typeof stringNumber === "undefined" || currentValue.string == stringNumber) {
                    if (typeof form === "undefined" || currentValue.form === form) {
                        if (currentValue.quality=== quality) {
                            if (typeof inversion === "undefined" || currentValue.inversion == inversion) {
                                return true
                            }
                        }
                    }
                }
                return false

            }) // filter function

            // if root is defined, set the chord root, which also updates the chord's note cache
            if (typeof options.root !== "undefined") {
                $.each(chords, function (index, chord) {
                    chord.root = options.root
                })
            }

            let chords_copy = [];
            let return_chords = [];
            $.each(chords, function (index, chord) {
                const chordCopy = chord.copy()
                chords_copy.push(chordCopy)
                return_chords.push(chordCopy) // this can safely be modified when interating over chords_copy below
            });

            /*
            Currently have 4 chords for each inversion
            These are between fret 0 and fret 12
            Copy the lower chords and transpose them an octive
            for the high fret chords
            */
            if (options.fullFretboard === true) {
                $.each(chords_copy, function (index, chord) {
                    let pos = chord.getPosition();
                    if (pos <= 6) { // not practical to have notes higher than 18th fret or so
                        const chordTrans = chord.copy()
                        try { // transpose will fail if fret is larger than fretboard size 
                            chordTrans.transpose(12)
                            return_chords.push(chordTrans)
                        }
                        catch (e) {
                            "ChordDictionary.getChords could not transpose chord";
                        }
                    }
                });
            }

            // sort chords by position
            return_chords.sort(function (a, b) {
                return a.getPosition() - b.getPosition();
            });

            return return_chords;
        }
        catch (err) {
            console.log("%c" + err, "color: red;")
            console.log(err.stack)
        }
    }
    getChordFromString(str) {
        // root/qual/formSS/Inversion
        // e.g. C/Maj7/D2:1-4/3
        const components = str.split("/");
        const options = {};
        if (components.length >= 4) { options.inversion = components[3]; }

        if (components.length >= 3) {
            const arr = components[2].split(":");
            options.form = arr[0];
            options.stringNumber = arr[1][0];
        }
        if (components.length >= 2) { options.quality = components[1]; }
        if (components.length >= 1) { options.root = components[0]; }
        return this.getChord(options);
    }

    getChordGroup (group_id) { 

       const arr = this.chord_groups.filter( (cg ) => {
            return cg.id == group_id
         })
      let cg = undefined
      if( arr.length > 0 ) { cg = arr[0] }
      return cg
    }


    /*
    get chord given the root, quality, form and string number and inversion
    */
    getChord(options) {
        try {
            if (typeof options.root === "undefined")
                throw "CDManager.getChord:  No root argument";
            const chords = this.getChords(options);
            if (chords.length === 0)
                throw "CDManager.getChord:  No chord found";
            let chord = chords[0];
            if (typeof options.nearestPosition !== "undefined") {
                let distance = 18;
                let closestIndex = 0;
                let highTrans = 0;
                if (options.highFret === true) { highTrans = 12; }
                $.each(chords, function (index, chord) {
                    const nextDistance = Math.abs(chord.getPosition() + highTrans - options.nearestPosition);
                    if (nextDistance < distance) { closestIndex = index; distance = nextDistance; }
                }); // .each
                return chords[closestIndex];
            } // options.nearestPosition
            else if (typeof options.inversion !== "undefined") {
                $.each(chords, function (index, nextChord) {
                    const nextInv = nextChord.inversion;
                    if (nextInv == options.inversion) {
                        chord = nextChord;
                        return false;
                    }
                }); // .each
            }

            // if( options.highFret === true &&  chords.length > 1 ) {
            //     chord  = chords[1]  }
            chord.root = options.root
            // return a deep copy as the same chord may be used with a different 
            // root several times
            // if( typeof options.inversion != "undefined") {
            //     chord.inversion(options.inversion)
            //  }
            chord = chord.copy();
            if (chord.enharmonic_bias !== options.enharmonicBias) {
                chord.enharmonic_bias = options.enharmonicBias;
                chord.getNoteNames(); // forces enharmonice note names into note cache
            }
            return chord;
        }
        catch (err) {
            console.log("%c" + err, "color: red;");
            console.log(err.stack)
        }
    }
    /*
    replaceChord
    this method is used for chord editing
    */
    replaceChord(newchord) {
        this.removeChordWithId(newchord.id);
        // get array of chords without the id and set it to the class chords storage
        const chords = this.chords.filter((nextChord) => {
            return nextChord.id != newchord.id;
        });
        this.chords.push(newchord.copy());
    }
       /*
    replaceChordGroup
    this method is used for chord editing
    */
    replaceChordGroup(newCG) {
        this.removeChordGroupWithId(newCG.id);
        // get array of chords without the id and set it to the class chords storage
        const chord_groups = this._chord_groups.filter((nextCG) => {
            return nextCG.id != newCG.id;
        });
        this._chord_groups.push(newCG.copy())
    }

    /*
    remove a chord
    used for chord editing
     */
    removeChordWithId(id) {
        // get array of chords without the id and set it to the class chords storage
        const chords = this.chords.filter((nextChord) => {
            return nextChord.id != id;
        });
        this.chords = chords;

    }
   /*
    remove a chord
    used for chord editing
     */
    removeChordGroupWithId(id) {
        // get array of chords without the id and set it to the class chords storage
        const chord_groups = this._chord_groups.filter((nextCG) => {
            return nextCG.id != id;
        });
        this._chord_groups = chord_groups;

    }
    loadChords(chords) {

        const self = this;
        this.chords = [];
        /* strings updated and stored in JSON */
        $.each(chords, function (index, item) {
            let chord = JSON.parse(JSON.stringify(item));
            chord = Object.assign(new Chord(), chord);

            chord._c_notes = [];
            $.each( item.strings, (index, s) => {
                const   note = new Note({
                    fret: s.fret,
                    interval: s.interval,
                    finger: s.finger, // updated to array of fingering
                    stringNumber: s.string,
                    }, dc.FRETBOARD_MANAGER)
                chord._c_notes.push(note);
                })
        
            /** equivalent chords are now also stored as JSON **/



            const doomed = ['S6', 'S6Int', 'S6F', 'S5', 'S5Int', 'S5F', 'S4', 'S4Int', 'S4F', 'S3', 'S3Int',
            'S3F', 'S2', 'S2Int', 'S2F', 'S1', 'S1Int', 'S1F', 'bar', 'strings']
            $.each(doomed, (index, s) => {
                delete chord[s]
            })

            // ['S6', 'S6Int', 'S6F', 'S5', 'S5Int', 'S5F', 'S4', 'S4Int', 'S4F', 'S3', 'S3Int',
            //     'S3F', 'S2', 'S2Int', 'S2F', 'S1', 'S1Int', 'S1F', 'bar', 'strings']
            //     .forEach(function (e) { delete chord[e]; });

            self.chords.push(chord);
        });

        // now chord data has loaded, set the qualities variables
        this.majorQualities = [];
        this.minorQualities = [];
        this.alteredDominantQualities = [];
        this.colorDominantQualities = [];
        let chordsUnique = this.chords.filter(
            // dont really understand this function, but it works -  got formula online
            function (a) {
                if (!this[a.quality]) { this[a.quality] = 1; return a.quality }
            },
            {}
        );
        // major - repeat process for qual
        self.majorQualities = [];
        $.each(chordsUnique, function (index, item) {
            if (item.chord_group.cat1 === "maj") { self.majorQualities.push(item.quality); }
        });
        self.minorQualities = [];
        $.each(chordsUnique, function (index, item) {
            if (item.chord_group.cat1 === "min") { self.minorQualities.push(item.quality); }
        });
        self.colorDominantQualities = [];
        $.each(chordsUnique, function (index, item) {
            if (item.chord_group.cat1 === "dom" && item.chord_group.cat2 === "alt") { self.colorDominantQualities.push(item.quality); }
        });
        self.alteredDominantQualities = [];
        $.each(chordsUnique, function (index, item) {
            if (item.chord_group.cat1 === "dom" && item.chord_group.cat2 === "col") { self.alteredDominantQualities.push(item.quality); }
        });
    }
    /* load chord groups from json */
    loadChordGroups(chord_groups) {

        const self = this;
        this._chord_groups = [];
        $.each(chord_groups, (index, item) => {
            let cg = JSON.parse(JSON.stringify(item));
            cg = Object.assign(new ChordGroup(), cg);
            self._chord_groups.push(cg);
        })

    }
    getDominantQualities() {
        return [].concat(this.getColorDominantQualities(),
            this.getAlteredDominantQualities());
    }
    getColorDominantQualities() {
        return this.colorDominantQualities;
    }
    getAlteredDominantQualities() {
        return this.alteredDominantQualities;
    }
    getMinorQualities() {
        return this.minorQualities;
    }
    getMajorQualities() {
        return this.majorQualities;
    }
    // inversions are the actual numbers
    inversionNumbers(options) {

        const chords = this.getChords(options);
        // sort chords by position
        chords.sort(function (a, b) {
            return a.getPosition() - b.getPosition();
        });
        // map chords to numbers
        const inversionNumbers = chords.map(function (chord) {
            return chord.inversion;
        });
        return inversionNumbers;
    }
    // not returning a concat of the individual qualities as need the cat 1
    qualitiesList() {
        
        let chordData = this.getChords();
        let chordsUnique = chordData.filter(
            // dont really understand this function, but it works -  got formula online
            function (a) {
                if (!this[a.quality]) { this[a.quality] = 1; return a.quality; }
            },
            {}
        );
        let qualities = [];
        $.each(chordsUnique, function (index, chord) {
            qualities.push(chord);
        });
        return qualities;
    }


    /**
         chordFormSSNames is for return informationabout the Form and String set for that form
         it returns the id (e.g. D2:1)
         the display (e.g. Drop 2:1-4)
         and the Form group (e.g. D2)
         this is mainly used by interface elements such as the picker-manager
         */
    chordFormSSNames() {



        let chordData = this.getChords();

        let chordsUnique = [];
        let formSS = [];
        $.each(chordData, function (index, chord) {
            let chSS = chord.Form + ":" + chord.string
            if (formSS.indexOf(chSS) === -1) {
                formSS.push(chSS);
                chordsUnique.push(chord);
            }
        });


        //chordsUnique = JSON.parse(JSON.stringify(chordsUnique));
        let returnArr = [];
        $.each(chordsUnique,  (index, chord) => {
            let id = chord.Form + ":" + chord.string
            let dIndex = formSSLookup.id.indexOf(id);
            let display = formSSLookup.display[dIndex];
            let group = chord.Form;
            returnArr.push({
                display: display,
                id: id,
                group: group
            });
        });

        return returnArr;

    }
    // update server with edited chords
    // need to fully implement this, and also the saveEditedChordGroups method
    saveEditedChords(id_array) {
        const self = this
        const to_save = [];
        $.each(id_array, (index, id) => {
            const chord = this.getChordWithId(id);
            to_save.push(chord);
        });

        if (to_save.length > 0) {
            const chords_json = JSON.stringify(to_save);

            const baseURL = window.location.protocol + "//" + window.location.host;
            const myURL = baseURL + "/save-chords/";
            $.post(myURL,
                {
                    csrfmiddlewaretoken: dc.CSRF_TOKEN,
                    'chords-json': chords_json,
                    'cd-id': self.id,
                }) // .post
                .done(function (response, status) {
                    //const cd_json = JSON.parse( response['data'] )
                    // there is either an updated version, or there was no cd_id supplied
                }) // .done

                .fail(function (xhr, status, error) {
                    console.log("-------- fail get chord data': " + status + " " + error + " " + xhr.status + " " + xhr.statusText + "----------");
                }); // load activity bar .fail





        }
        // post the changed chords
    }
}





































   






export class CDManager {
    constructor() {

        this.chordDictionaries;
        this.active_cd_id;
        this.default_chord_dictionary_id = 1; // default chord dictionary, if there is none in local storage
    }
    init() {

        this.chordDictionaries = [];
    }
    getActiveDictionary() {
        if (typeof this.active_cd_id === "undefined") {
            this.active_cd_id = this.chordDictionaries[0].id;
        }
        return this.dictionaryWithId(this.active_cd_id);
    }
    setActiveDictionary(cDict) {
        this.active_cd_id = cDict.id;
        return this;
    }
    activeDictionaryChords() {
        let aDict = this.getActiveDictionary();
        return aDict.getChords();
    }
 
    
    addDictionary(cdDict) {
        this.chordDictionaries.push(cdDict);
        /* must always have an active dictionary, if one exists
        if this is the first dictinary added, mark it as active */
        if (this.chordDictionaries.length == 1) {
            this.setActiveDictionary(cdDict);
        }
    }
    defaultDictionary() {
        return this.dictionaryWithName("default-chords");
    }
    dictionaryWithId(id) {
        let foundDict = undefined;

        $.each(this.chordDictionaries, function (index, cdDict) {

            if (cdDict.id == id) {
                foundDict = cdDict;
                return false; // break out of loop
            }
        });

        return foundDict;

    }
    dictionaryWithName(name) {

        let foundDict = undefined;

        $.each(this.chordDictionaries, function (index, cdDict) {

            if (cdDict.getName() === name) {
                foundDict = cdDict;
                return false; // break out of loop
            }
        });

        return foundDict;
    }
    /*
    currently, drop chords json has length of 60,047 * 2 bytes = 120,094/1024 = 117 kb (0.12 MB)
    the standard restriction on local storage is 20MB
    this is about 0.6% (1/166) of the local storage capacity, so no fear at this stage
    of running out of local storage space
    
    this is the formula to put into console to get storage size:
            localStorage['chords'].length*2 / 1024 + " KB"
    
    note: the local storage length is multiplied by 2 becaus ethe char in javascript stores
     as UTF-16 (2 bytes)
    */
    loadDictionaries() {
        let self = this;
        /*
        updated July 2022
        only one dictionary at a time in local storage
        the local storage contains the last dictionary the user was working on
        "chord-dict-meta" contains the chord dictionary info
        After getting the metadata, need to check that it is the latest version of the dictionary
        */
        let cd_ts = 0;
        let cd_id = self.default_chord_dictionary_id;
        let should_update_storage = false;
        if (typeof (Storage) !== "undefined") { // browser support for storage, assume plenty of space for one dictinary
            const cd_metadata = JSON.parse(localStorage.getItem("chord-dict-meta"));
            if (cd_metadata !== null && cd_metadata.length !== 0) {
                // first check if there is already chord dictionary data in the local storage
                if (typeof cd_metadata._modified !== "undefined") { cd_ts = cd_metadata._modified; }
                if (typeof cd_metadata._id !== "undefined") { cd_id = cd_metadata._id; }
            }
        }

        const baseURL = window.location.protocol + "//" + window.location.host;
        const myURL = baseURL + "/ajax-chord-dict/";
        $.post(myURL,
            {
                csrfmiddlewaretoken: dc.CSRF_TOKEN,
                cd_id: cd_id,
                cd_ts: cd_ts,
            }) // .post
            .done(function (response, status) {
                //const cd_json = JSON.parse( response['data'] )
                if (response.cd_status === "no_updates") { // load from storage, no chords returned
                    const cd_json = JSON.parse(localStorage.getItem("chord-dict-meta"));
                    const chordDict = new ChordDictionary(cd_json._id, cd_json._name);
                    chordDict._eq_chords = cd_json._eq_chords
                    const chords_json = JSON.parse(localStorage.getItem("chords"));
                    const chord_groups_json = JSON.parse(localStorage.getItem("chord_groups"));
                    self.addDictionary(chordDict);
                    chordDict.loadChordGroups(chord_groups_json);
                    chordDict.loadChords(chords_json);
                    
                    $(".my-fretboard-js").trigger('dropchords:chords-loaded');
                }

                // there is either an updated version, or there was no cd_id supplied
                else {
                    should_update_storage = true;
                    const chordDict = new ChordDictionary(response.chord_dict._id, response.chord_dict._name);
                    chordDict._eq_chords = response.chord_dict._eq_chords
                    self.addDictionary(chordDict);
                    chordDict.loadChordGroups(response.chord_dict.chord_groups);
                    chordDict.loadChords(response.chord_dict.chords);
                    
                    $(".my-fretboard-js").trigger('dropchords:chords-loaded');

                }


                /* updated July 2022
                just storing the one, most recent chord dictionary in storage
                the chord dictionary metadata - id, name, modified timestamp - is
                stored in the "chord-dict-meta"  key
                the chords in the "chords" key
                */
                if (typeof (Storage) !== "undefined" && should_update_storage == true) { // browser support for storage

                    const cd_metadata = {
                        _id: response.chord_dict._id,
                        _modified: response.chord_dict._mod_ts,
                        _name: response.chord_dict._name,
                        _eq_chords: response.chord_dict._eq_chords,
                    };

                    localStorage.setItem("chords", JSON.stringify(response.chord_dict.chords));
                    localStorage.setItem("chord_groups", JSON.stringify(response.chord_dict.chord_groups));
                    localStorage.setItem("chord-dict-meta", JSON.stringify(cd_metadata));
                }
            }) // .done

            .fail(function (xhr, status, error) {
                console.log("-------- fail get chord data': " + status + " " + error + " " + xhr.status + " " + xhr.statusText + "----------");
            }); // load activity bar .fail


    }
    /*
    get chords in the format used by the Fretboard module
    */
    getFBChords(options) {

        let form = options.form; // form: D2 , D3 
        let quality = options.quality; // chord quality: Maj7, Maj7#11, 7, m7, etc
        let root = options.root; // root: C, B, , A#, Bb, A#Bb, etc.


        /* string - most top string
           for drop 2: S1 = string set 1-4
                       S2 = string set 2-5
                       S3 = string set 3-6
           for drop 3: S1 = string set 1-5 (string 4 unused)
                       S2 = string set 2-6 (string 5 unused)
       */
        let string = options.stringNumber;
        let fret = options.fret; // fret - approx location of form request
        let fingering = options.fingering;
        let chords = undefined;
        // the chord filter should return about 4 chords
        if (typeof options.inversion !== "undefined") {

            let chordData = this.activeDictionaryChords();
            chords = chordData.filter(function (currentValue, index, arr) {
                return currentValue.string == string &&
                    currentValue.Form === form &&
                    currentValue.quality === quality &&
                    currentValue.inversion == options.inversion;

            }); // filter function
        } // inversion passed to function 


        else { // inversion not passed - return array of all inversions
            let chordData = this.activeDictionaryChords();
            chords = chordData.filter(function (currentValue, index, arr) {

                return currentValue.string == string &&
                    currentValue.Form === form &&
                    currentValue.quality === quality;
            });
        }

        let fretboardChords = [];
        $.each(chords, function (key, chord) {
            chord.root = root
            fretboardChords.push(chord.toFBJSFormat());
        });

        // order FB chord by position on the neck
        fretboardChords.sort(function (ch1, ch2) {
            let ch1_string = ch1[ch1.length - 1];
            let ch2_string = ch2[ch2.length - 1];
            return ch1_string.fret - ch2_string.fret;
        });


        /*
        Currently have 4 chords for each inversion
        These are between fret 0 and fret 12
        Copy the lower chords and transpose them an octive
        for the high fret chords
        */
        var chordsFullFretboard = fretboardChords;
        $.each(fretboardChords, function (index, chord) {
            let fret = chord[0].notes[0].fret;
            if (fret <= 6) { // not practical to have notes higher than 18th fret or so
                let chordTrans = FBChordTranspose(chord, 12);
                chordsFullFretboard.push(chordTrans);
            }

        });


        return chordsFullFretboard;
    }
    /*
    given a form and string set in format D2:1-4, etc
    return an array of inversions available
    inversions are defined as the interval  e.g. 1, 3, 5, 7, 9, 11, 13, #11, b13, etc.
    */
    getInversions(options) {
        // inversions should be sorted by position
        return this.getActiveDictionary().inversionNumbers(options);

    }
}



// transform the fretboard chord up an octave

function FBChordTranspose( fbChord, semitones ) {


    let chordTrans = JSON.parse(JSON.stringify(fbChord)) // deep copy
    $.each(chordTrans, function(index, string_notes ){
        $.each(string_notes.notes, function(index2, note ){
            note.fret += semitones
            })
        })
    return chordTrans
}



// $(document).ready(function(){

// // create the global chord dictionary manager



// })