"use strict";


export default class Note {
    constructor( values ) {

    this._fret = undefined
    this._finger = undefined
    this._interval = undefined // interval used for color coding notes on the fretboard
    this._stringNumber = undefined // string number from 1 .. 6
    this._name = undefined
   
    if( typeof values !== "undefined") {
        this._fret = values.fret
        this._finger = values.finger
        this._interval = values.interval
        this._stringNumber = values.stringNumber  // string number from 1-6 
        this._name = values.name  // note name e.g. E3, C4, etc

    }
    return this
}

init( values) { 
    return this
}

copy( values) { 
    const copy = Object.assign(new Note,  JSON.parse( JSON.stringify(this) ) ) // deep copy
    return copy
  }

get fret() { return this._fret }
set fret( f) { return this._fret = f }

get stringNumber() { return this._stringNumber }
set stringNumber(n){  this._stringNumber = n }
get name() { 
    if( typeof this._name == "undefined") {
        this._name =  this.stringName.addSemitones(this.fret)
    }
    return this._name 
}
set name(n){  this._name  = n}

get stringName ( ) {
    const s_names = dc.FRETBOARD_MANAGER.getTuning()
    return s_names[this.stringNumber - 1]
    }

 /* updating for multiple fingering options */

 /*
updated for multiple fingering options
the finger is an ojbect
{
id: fingeringID - id=1 is default, 
                    id=2 is for open position, 
                    id=3 for users that prefer thumb, 
                    id=4 for users that prefer thumb open
f: the finger (1, 2, 3, 4, )
}

it is same to assume the default fingering will always be available
 */

get finger( ) {
    //return this._finger
    // for now return the default fingering
    return this._finger[0].f
 }

set finger( f ) {  
    // for now assume setting the default fingering
    this._finger[0].f  = f
}

get interval( ) { return this._interval }
set interval( i ) {  this._interval  = i}

  /* frettednote name in letter/ocatave e.g. E1 B2 
   note: as general rule note 'name' will refer to the note + octave
   note 'letter' will refer to the note without the octoave */
noteNameWithBias (enharmonicBias ) {
    if( typeof enharmonicBias === "undefined" && typeof this.name !== "undefined"  ) {
         return this.name 
        }

    this.name = this.stringNumber.toString().noteNameFromFret( this.fret)
    if(enharmonicBias === "b" ) {  
        this.name =  this.name.enharmonicFlat() 
        } 
    else  if(enharmonicBias === "#" ){
        this.name =  this.name.enharmonicSharp()
        }

    return this.name
}


pitch () {
    return this.noteLetter()[0]  // remove accidentals
}

alter() {
const letter = this.noteLetter()
if(letter.indexOf("#") !== -1 ) { return 1 }
else if(letter.indexOf("b") !== -1 ) { return -1}
return 0
}

octave () {
try {
    const name = this.name
    return name[name.length - 1]
}
catch(err) {
    console.log("Error in Note.octave: " + "%c" + err,   "color: red;")
    }
}

noteLetter () {
    return this.name.replace(/[0-9]/g, '')  // remove numbers
}

enharmonicBias() {
    if( typeof this.name !== "undefined") {
        if(this.name.indexOf("#") != -1 ) {return "#" } 
        else if(this.name.indexOf("b") != -1 ) {return "b"} 
    }
return

}

/*
position is just where the first finger would be when unstretched
*/
position() {
    if(typeof this.finger  != "undefined" &&  typeof this.finger != "undefined")
        return this.fret - this.finger + 1
}

/* if there is only a note name, no fingering etc. then allocate a fret and finger
*/
autoPosition(args) {
  let preferredPosition = 3;


  if (args && typeof args.position !== "undefined") {
    preferredPosition = args.position;
  }

  const targ_note = this._name.enharmonicFlat();

  const frets = dc.FRETBOARD_MANAGER.getNumFrets();
  const tuning = dc.FRETBOARD_MANAGER.getTuning();
  const positions = [];

  // Iterate over tuning (strings)
  tuning.forEach((note_name, s) => {
    for (let i = 0; i < frets; i++) {
      const nextNote = note_name.addSemitones(i).enharmonicFlat();
      if (nextNote === targ_note) {
        positions.push({ string: s, fret: i });
      }
    }
  });

  // Choose the position closest to preferredPosition
  positions.forEach(position => {
    if (typeof this.fret === "undefined") {
      this.fret = position.fret;
      this.stringNumber = position.string + 1;
    } else {
      const currentDelta = this.fret - preferredPosition;
      const newDelta = position.fret - preferredPosition;

      if (newDelta < currentDelta && newDelta > 0) {
        this.fret = position.fret;
        this.stringNumber = position.string + 1;

        // Compute finger assignment
        this.finger = newDelta;
        if (this.finger < 1) this.finger = 1;
        else if (this.finger > 4) this.finger = 4;
      }
    }
  });
}

} //Note