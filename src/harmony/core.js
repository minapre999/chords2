
   import jQuery from 'jquery';
   import '/src/globals.js'
/*
going forward, introduce several abstraction levels for working with musical notes
level 2:  C, C#, D, Eb, Fb, F, GbF#, G, G#, Bbb, Bb, B♮
May have multiple ways to describe a note including flat, shart, double flat, double sharp, natural

level 1: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B
Has one way to describe a note, which is the flat

level 0:    a,   b, 10,  11, 12,  13, 14, 15, 16,  17,  18, 19, 1a,  1b, 20,  21, 22, 23,  24, 25, 26,  27, 28,  29,  2a, 2b, 30, 31,  ...
maps to    Bb0, B0, C1, Db1, D1, Eb1, E1, F1, Gb1, G1, Ab1, A1, Bb1, B1, C2, Db2, D2, Eb2, E2, F2, Gb2, G2, Ab2, A2, Bb2, B2, C3, Db3, ...
Assigns a base 12 number to each note, starting with C1
As these are numbers, it is relatively straightforward to transpose keys, transpose notes, chords, etc

to convert from a string to a base12 number: parseInt(string, 12)
    e.g parseInt("20", 12) = 24,  parseInt("1a", 12) = 22, 
to convert from base12 number to string:  toString( 12 )
   e.g. d = 24; d.toString(12) = 10; d = 22; d.toString(12) = 1a; 

to convert from level 1 to level 0  e.g. Eb2, C3
firstly, find the number that corresponds to the letter (a and b are numbers in base 12):
e.g. C->0, B->b, D->2, Eb->3
secondly, multiply by the octave number
e.g C3 = 30, B3 = 3b, D4 = 42

To transpose a note by 3 semitones:  convert to base 12, add 3, convert back
e.g.  Bb3 + 4 semitones:  Bb3->3a, parseInt('3a', 12) + 4 = 50, parseInt(50).toString(12) = 42 -> D4

To find chord by intervals: e.g. G7  1:3:5:7
G1->17, 
major third is 4 semitones: parseInt('17', 12) + 4 = 23; parseInt(23).toString(12) = 1b -> B1
fifth  is 7 semitones: parseInt('17', 12) + 7 = 26; parseInt(26).toString(12) = 22 -> D2
seventh is 11 semitones: parseInt('17', 12) + 11 = 30; parseInt(30).toString(12) = 26 -> Gb2
Final Chord: G1:B1:D2:Gb2
If key is Gmaj, convert Gb2 to F#2 for leel 2
Drop 2 form: drop the second highest note by an octave, D2->D1: D1:G1:B1:F#2

keys
fifth:  -1 base 12:  a
fifth:  -2 base 12:  a, 3
fifth:  -3 base 12:  a, 3, 8
fifth:  -4 base 12:  a, 3, 8, 1
fifth:  -5 base 12:  a, 3, 8, 1,6
fifth:  -6 base 12:  a, 3, 8, 1, 6, b
fifth:  -7 base 12:  a, 3, 8, 1, 6, b, 4

fifth:  +1 base 12:  6
fifth:  +2 base 12:  6, 1
fifth:  +3 base 12:  6, 1, 8
fifth:  +4 base 12:  6, 1, 8, 3
fifth:  +5 base 12:  6, 1, 8, 3, a
fifth:  +6 base 12:  6, 1, 8, 3, a, 5
fifth:  +7 base 12:  6, 1, 8, 3, a, 5, 0 
*/


// const flats_by_fifths = [ { b12Note: 'a', scriptNote: 'B'}, // Bb -> B
//                         { b12Note: '3', scriptNote: 'E'},
//                         { b12Note: '8', scriptNote: 'A'},
//                         { b12Note: '1', scriptNote: 'D'},
//                         { b12Note: '6', scriptNote: 'G'},
//                         { b12Note: 'b', scriptNote: 'C'}, // Cb -> C
//                         { b12Note: '4', scriptNote: 'F'}, // Fb -> F
//                         ]
// const sharps_by_fifths = [ { b12Note: '6', scriptNote: 'F'}, // F# -> F
//                         { b12Note: '1', scriptNote: 'C'},
//                         { b12Note: '8', scriptNote: 'G'},
//                         { b12Note: '3', scriptNote: 'D'},
//                         { b12Note: 'a', scriptNote: 'A'},
//                         { b12Note: '5', scriptNote: 'E'}, // E# -> E
//                         { b12Note: '0', scriptNote: 'B'}, // B# -> B
//                         ]
 
function checkOS(n) {


    var Name = "Not known";
        if (navigator.appVersion.indexOf("Win") != -1) Name = 
          "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) Name = 
          "Mac";
        if (navigator.appVersion.indexOf("X11") != -1) Name = 
          "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) Name = 
          "Linux";


    // if (n.userAgentData) {
    //   const hints = ["architecture", "model", "platform", "platformVersion", "uaFullVersion"];
    //   n.userAgentData.getHighEntropyValues(hints)
    //     .then(ua => {
    //       console.log(ua);
    //     });
    // } else {
    //   console.log(n.userAgent);
    //   return "navigator.userAgentData is not supported!";
    // }
  }

  
export const midiLookup = {'B7': 107, 'Bb7': 106, 'A7': 105, 'Ab7': 104, 'G7': 103, 'Gb7': 102, 'F7': 101, 'E7': 100, 'Eb7': 99, 'D7': 98, 'Db7': 97, 'C7': 96, 'B6': 95, 'Bb6': 94, 'A6': 93, 'Ab6': 92, 'G6': 91, 'Gb6': 90, 'F6': 89, 'E6': 88, 'Eb6': 87, 'D6': 86, 'Db6': 85, 'C6': 84, 'B5': 83, 'Bb5': 82, 'A5': 81, 'Ab5': 80, 'G5': 79, 'Gb5': 78, 'F5': 77, 'E5': 76, 'Eb5': 75, 'D5': 74, 'Db5': 73, 'C5': 72, 'B4': 71, 'Bb4': 70, 'A4': 69, 'Ab4': 68, 'G4': 67, 'Gb4': 66, 'F4': 65, 'E4': 64, 'Eb4': 63, 'D4': 62, 'Db4': 61, 'C4': 60, 'B3': 59, 'Bb3': 58, 'A3': 57, 'Ab3': 56, 'G3': 55, 'Gb3': 54, 'F3': 53, 'E3': 52, 'Eb3': 51, 'D3': 50, 'Db3': 49, 'C3': 48, 'B2': 47, 'Bb2': 46, 'A2': 45, 'Ab2': 44, 'G2': 43, 'Gb2': 42, 'F2': 41, 'E2': 40, 'Eb2': 39, 'D2': 38, 'Db2': 37, 'C2': 36, 'B1': 35, 'Bb1': 34, 'A1': 33, 'Ab1': 32, 'G1': 31, 'Gb1': 30, 'F1': 29, 'E1': 28, 'Eb1': 27}

const flats_by_fifths = ['Bb', 'Eb','Ab', 'Db',  'Gb',  'Cb',  'Fb'  ]               
const sharps_by_fifths = [ 'F#', 'C#',  'G#', 'D#','A#',  'E#',  'B#' ]
// const flat_note_by_fifths = ['a', '3','8', '1',  '6',  'b',  '4'  ]
// const sharp_note_by_fifths = [ '6', '1',  '8', '3','a',  '5',  '0' ]

const accidentals = [
    {sharp: 'F#', flat: 'Gb'},
    {sharp: 'G#', flat: 'Ab'},
    {sharp: 'A#', flat: 'Bb'},
    {sharp: 'C#', flat: 'Db'},
    {sharp: 'D#', flat: 'Eb'},
]



const KEYS = {
    //(progressively each adds a sharp up to 7)
    sharp: [ 'G', 'D', 'A', 'E', 'B', 'F#', 'C#' ],
    //(progressively each adds a flat up to 7)
    flat:  ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb' ]
}


/* musicxml kind values, see https://w3c.github.io/musicxml/musicxml-reference/data-types/kind-value/
mxml_kind_value will allow lookup from muxic xml to get the family and notation

Each chord symbol has at least two elements: a <root> element to indicate the root of the chord, 
and a <kind> element to indicate the type of the chord. 
Here, we have a root of G and a kind of major-sixth. 
MusicXML 4.0 supports 33 different <kind> element values. 
The kind element has a text attribute that indicates that the chord is displayed as G6, not as Gmaj6, GM6, or other spelling
 that could represent the same chord. 


    <kind halign="center" text="6">major-sixth</kind>
        <bass>
          <bass-step>D</bass-step>
        </bass>
      </harmony>

*/
const mxml_kind_value = {
    augmented : {  // augmented 	Triad: major third, augmented fifth.
        family: "dominant",
        notation: "aug"
    }, 
    "augmented-seventh" :  { //augmented triad, minor seventh.
        family: "dominant",
        notation: "aug7"
    },
    diminished :  { // diminished 	Triad: minor third, diminished fifth.
        family: "dominant",
        notation: "dim"
    },
    "diminished-seventh" :  { // diminished-seventh  	diminished triad, diminished seventh.
        family: "dominant",
        notation: "dim"
    },
    "dominant" :  { // dominant 	Seventh: major triad, minor seventh.
        family: "dominant",
        notation: "7"
    },
    "dominant-11th" :  { // dominant-11th 	11th: dominant-ninth, perfect 11th.
        family: "dominant",
        notation: "11"
    },
    "dominant-13th" :  { // 13th: dominant-11th, major 13th.
        family: "dominant",
        notation: "13"
    },
    "dominant-ninth" :  { // dominant-ninth 	Ninth: dominant, major ninth.
        family: "dominant",
        notation: "9"
    },

    "half-diminished" :  { // half-diminished 	Seventh: diminished triad, minor seventh.
        family: "minor",
        notation: "m7b5"
    },
    "major" :  { // major 	Triad: major third, perfect fifth.
        family: "major",
        notation: "Maj"
    },
    "major-11th" :  { // 11th: major-ninth, perfect 11th.
        family: "major",
        notation: "Maj11"
    },
    "major-13th" :  { // 13th: major-11th, major 13th.
        family: "major",
        notation: "Maj13"
    },
    "major-minor" :  { // minor triad, major seventh.
        family: "minor",
        notation: "mMaj"
    },
    "major-ninth" :  { // major-seventh, major ninth.
        family: "major",
        notation: "Maj9"
    },
   
    "major-seventh" :  { // Seventh: major triad, major seventh.
        family: "major",
        notation: "Maj7"
    },
    "major-sixth" :  { // Sixth: major triad, added sixth.
        family: "major",
        notation: "Maj6"
    },
    "minor" :  { // Triad: minor third, perfect fifth.
        family: "minor",
        notation: "m"
    },
    "minor-11th" :  { // 11th: minor-ninth, perfect 11th.
        family: "minor",
        notation: "m11"
    },
    "minor-13th" :  { // 13th: minor-11th, major 13th.
        family: "minor",
        notation: "m13"
    },
    "minor-ninth" :  { // Ninth: minor-seventh, major ninth.
        family: "minor",
        notation: "m9"
    },
    "minor-seventh" :  { // Seventh: minor triad, minor seventh.
        family: "minor",
        notation: "m7"
    },
    "minor-sixth" :  { // Sixth: minor triad, added sixth.
        family: "minor",
        notation: "m6"
    },
    "suspended-fourth" :  { // Suspended: perfect fourth, perfect fifth.
        family: "suspended",
        notation: "sus4"
    },
    "suspended-second" :  { // Suspended: major second, perfect fifth.
        family: "suspended",
        notation: "sus2"
    },
    "other" :  { // Used when the harmony is entirely composed of add elements.
    // family unknown
    },
}
/* note:  these are excluded as they are not common in jazz voicing
French 	Functional French sixth.
German 	Functional German sixth.
Italian 	Functional Italian sixth.
Neapolitan 	Functional Neapolitan sixth.
none 	Used to explicitly encode the absence of chords or functional harmony. In this case, the <root> <numeral>, or <function> element has no meaning. When using the <root> or <numeral> element, the <root-step> or <numeral-step> text attribute should be set to the empty string to keep the root or numeral from being displayed.
pedal 	Pedal-point bass
power 	Perfect fifth.
Tristan 	Augmented fourth, augmented sixth, augmented ninth.

*/
 	
	

const thirds = [3, 'b3', 'm3']
const sevenths = [7, 'b7', 'm7']


const base12_notes = [
    {base12: '0', level1: 'C'},
    {base12: '0', level1: 'B#'},
    {base12: '1', level1: 'Db'},
    {base12: '1', level1: 'C#'},
    {base12: '2', level1: 'D'},
    {base12: '3', level1: 'Eb'},
    {base12: '3', level1: 'D#'},
    {base12: '4', level1: 'E'},
    {base12: '4', level1: 'Fb'},
    {base12: '5', level1: 'F'},
    {base12: '5', level1: 'E#'},
    {base12: '6', level1: 'Gb'},
    {base12: '6', level1: 'F#'},
    {base12: '7', level1: 'G'},
    {base12: '8', level1: 'Ab'},
    {base12: '8', level1: 'G#'},
    {base12: '9', level1: 'A'},
    {base12: 'a', level1: 'Bb'},
    {base12: 'a', level1: 'A#'},
    {base12: 'b', level1: 'B'},
    ]
   

  export const transpose_lookup = {
      C : 0,
      B : -1,
      "Bb" :  -2,
      "A#" :  -2,
      "A#/Bb" :  -2,
      A : -3,
      "Ab" : -4,
      "G#" : -4,
      "Ab/G#" : -4,
      G :	-5,
      "F#" : -6,
      "Gb" : -6,
      "F#/Gb" : -6,
      F : -7,
      E :	-8,
      "Eb" : -9,
      "D#" : -9,
      "D#/Eb" : -9,
      D :	-10,
      "C#" : -11, 
      "Db" : -11, 
      "C#/Db" : -11, 
      }

      

  /* scale names are not stored in the data
  but are derived from interval knowledge of the
  major and melodic minor chords */

  const MAJOR_INTERVALS =  {
      Major: ['1', '2', '3', '4', '5', '6', '7'],  // major (bright & happy)
      Dorian: ['1', '2', 'b3', '4', '5', '6', 'b7'],  // minor + maj6 (dark & sweet)
      Phrygian: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], // minor + b2 (dark & exotic)
      Lydian: ['1', '2', '3', '#4', '5', '6', '7'],  // major + #11 (bright & mysterious)
      Mixolydian: ['1', '2', '3', '4', '5', '6', 'b7'], // dominant (bright & tense)
      Aeolian: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],  // minor (dark & sad)
      Locrian: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], // half diminished (dissonant)
      
  }
  
  const MM_INTERVALS = { 
      'Melodic Minor': ['1', '2', 'b3', '4', '5', '6', 'b7'],
      'Lydian Augmented': ['1', '2', '3', '#4', '#5', '6', '7'],
      'Lydian Dominant': ['1', '2', '3', '#11', '5', '6', 'b7'],
      'Half Diminished': ['1', '2', 'b3', '4', 'b5', 'b6', 'b7'],
      Altered: ['1', 'b9', '#9', '3', '#11', 'b13', 'b7'],
  }

  const HM_INTERVALS = { 
    'Harmonic Minor': ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    'Phrygian Dominant': ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
}

  const OTHER_INTERVALS = { 
      'Pentatonic Major': ['1', '2', '3',  '5', '6', ],
      'Pentatonic Minor': ['1',  'b3',  '4', '5',  'b7', ],
      'Diminished': ['1', '9', 'b3', '11', '#11',  'b13', '13', 'b7', ],
      'Whole Tone': ['1', '2', '3', '#11', 'b13', 'b7', ],
      'Minor Blues': ['1', '2', '3', '#11', 'b13', 'b7', ],
      'Major Blues': ['1', '2', 'b3', '3', '5', '6', ],
      'Pentatonic 7b9': ['1', 'b2', '3', '5', 'b7', ],
  }

const ARPEGGIO_INTERVALS = {
'7 Arp': ['1', '3', '5', 'b7', ],
'm7 Arp': ['1', 'b3', '5', 'b7', ],
'maj7 Arp': ['1', '3', '5', '7', ],
'm7b5 Arp': ['1', 'b3', 'b5', 'b7', ],
}
  // modeLookupIntervals are transaltion from standard interval
// to the mode
// the modes are relative to the intervals of the root node
// (e.g. for Lydian Dominant, it is relative to the Melodic Minor)
const modeLookupIntervals = {
  Major : ['1', '2', '3', '4', '5', '6', '7'],
  Dorian :  ['b7', '1', '2', 'b3', '4', '5', '6'], 
  Phrygian : ['b6', 'b7', '1', 'b2', 'b3', '4', '5'], 
  Lydian : ['5', '6', '7', '1', '2', '3', '#4'], 
  Mixolydian : ['4', '5', '6', 'b7', '1', '2', '3'], 
  Aeolian : ['b3', '4', '5', 'b6', 'b7', '1', '2'], 
  Locrian : ['b2', 'b3', '4', 'b5', 'b6', 'b7', '1'], 
  'Melodic Minor' : ['1', '2', 'b3', '4', '5', '6', '7'],
  'Lydian Augmented' : ['6', '7', '1', '2', '3', '#4', '#5'] ,
  'Lydian Dominant' : ['5', '6', 'b7', '1', '2', '3', '#11'], 
  'Half Diminished' : ['b3', '4', 'b5', 'b6', 'b7', '1', '2'], 
  Altered : ['b9', '#9', '3', '#11', 'b13', 'b7', '1'] ,
  'Pentatonic Major': ['1', '2', '3',  '5', '6', ],
  'Pentatonic Minor': ['1',  'b3',  '4', '5',  'b7', ],
  'Diminished': ['1', '9', 'b3', '11', '#11',  'b13', '13', 'b7', ],
  'Whole Tone': ['1', '2', '3', '#11', 'b13', 'b7', ],
  'Minor Blues': ['1',  'b3',  '4', '#11', '5', 'b7', ],
  'Major Blues': ['1',  '2',  'b3', '3', '5', '6', ],
  'Pentatonic 7b9': ['1', 'b2', '3', '5', 'b7', ],
  '7 Arp': ['1', '3', '5', 'b7', ],
'm7 Arp': ['1', 'b3', '5', 'b7', ],
'maj7 Arp': ['1', '3', '5', '7', ],
'm7b5 Arp': ['1', 'b3', 'b5', 'b7', ],

'Harmonic Minor' : ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
'Phrygian Dominant' : ['4', '5', 'b6', 'b7', '1', '2', 'b3',],
}

const QUALITIES = {
Maj: "Major",
MM: 'Melodic Minor',
HM: 'Harmonic Minor',
DIM: 'Diminished',
WT: 'Whole Tone',
PMAJ: 'Pentatonic Major',
PMIN: 'Pentatonic Minor',
MINORBLUE: 'Minor Blues',
MAJORBLUE: 'Major Blues',
PENT7b9: 'Pentatonic 7b9',
ARP7: '7 Arp',
ARPm7: 'm7 Arp',
ARPmaj7: 'maj7 Arp',
ARPm7b5: 'm7b5 Arp',
}

const MODE_LOOKUP_SEMITONES = {
  Major: 0,
  Dorian :  10, 
  Phrygian : 8, 
  Lydian : 7, 
  Mixolydian : 5, 
  Aeolian : 3, 
  Locrian : 1, 
  'Melodic Minor' : 0,
  'Lydian Augmented' : 9 ,
  'Lydian Dominant' : 7, 
  'Half Diminished' : 3, 
  Altered : 1 ,
  'Pentatonic Major': 0, 
  'Pentatonic Minor': 0, 
  'Diminished': 0, 
  'Whole Tone': 0, 
  'Minor Blues': 0, 
  'Major Blues': 0, 
  'Pentatonic 7b9': 0, 
  '7 Arp' : 0,
'm7 Arp': 0,
  'maj7 Arp': 0,
  'm7b5 Arp': 0,

  'Harmonic Minor': 0,
  'Phrygian Dominant': 5,


}



const noteColors = {
  '1' : dc.ROOT_NOTE_COLOR,
  // { 'b2' : semitones: 1},
  // { interval: 'b9', semitones: 1},
  // { interval: '9', semitones: 2},
  // { interval: '#2', semitones: 3},
  // { interval: '#9', semitones: 3},
   'm3' : dc.THIRD_NOTE_COLOR,
  'b3' : dc.THIRD_NOTE_COLOR,
  '3' : dc.THIRD_NOTE_COLOR,
  // { interval: '4', semitones: 5},
  // { interval: '#4', semitones: 6},
  // { interval: '#11', semitones: 6},
  // { interval: 'b5', semitones: 6},
  // { interval: '5', semitones: 7},
  // { interval: '#5', semitones: 8},
  // { interval: 'b6', semitones: 8},
  // { interval: 'b13', semitones: 8},
  // { interval: '6', semitones: 9},
  '5' : dc.FIFTH_NOTE_COLOR,
    'b7' : dc.SEVENTH_NOTE_COLOR,
   'm7' : dc.SEVENTH_NOTE_COLOR,
    '7': dc.SEVENTH_NOTE_COLOR ,
  
   }


const formSSLookup = {
      id: ["D2:1", "D2:2", "D2:3", "D3:1", "D3:2", ],
      stringset: ["D2:1-4", "D2:2-5", "D2:3-6", "D3:1-5", "D3:2-6", ],
      display: ["Drop 2:1-4", "Drop 2:2-5", "Drop 2:3-6", "Drop 3:1-5", "Drop 3:2-6", ],
       }



  
Number.prototype.fromBase12 = function () {
    return this.toString().fromBase12( )
    }

    /*
    const KEYS = {
    //(progressively each adds a sharp up to 7)
    sharp: ['G', 'D', 'A', 'E', 'B', 'F#', 'C#' ],
    //(progressively each adds a flat up to 7)
    flat:  ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb' ]
}

*/
// convert fifths number to string e.g. -1 -> 'F'
Number.prototype.keyString = function () {
    let key = "C"
    if( this < 0 ) { // flats 
        const index = Math.abs(this) - 1
        key = KEYS.flat[index]
        }
    else if( this > 0 ) { // flats 
        const index = this -1
        key = KEYS.sharp[index]
        }
return key
}




String.prototype.noteLetter = function ( ) {
    return this.toString().replace(/[0-9]/g, '')  // remove numbers
}





// can't export a prototype directly, so wrap the prototype extensions
export default function installStringPrototypes() {

  String.prototype.enharmonicFlat = function () {
    const letter = this.noteLetter();
    const str = this.toString();

    // Natural note → unchanged
    if (letter.length === 1) return str;

    const octave = str.replace(/[^0-9]/g, '');

    // Already flat → unchanged
    if (letter[1] === 'b') return str;

    // Sharp → convert to flat
    if (letter[1] === '#') {
      const match = accidentals.find(item => item.sharp === letter);
      if (!match) return str; // safety fallback
      return match.flat + octave;
    }

    return str;
  };


  String.prototype.enharmonicSharp = function () {
    try {
      const letter = this.noteLetter();
      const str = this.toString();

      // Natural note → unchanged
      if (letter.length === 1) return str;

      const octave = str.replace(/[^0-9]/g, '');

      // Already sharp → unchanged
      if (letter[1] === '#') return str;

      // Flat → convert to sharp
      if (letter[1] === 'b') {
        const match = accidentals.find(item => item.flat === letter);
        if (!match) return str; // safety fallback
        return match.sharp + octave;
      }

      return str;
    } catch (err) {
      console.log("%c" + err, "color: red;");
      return this.toString();
    }
  };

}






String.prototype.setEnharmonicBias = function( bias ) {
    if( bias == "#") { return this.enharmonicSharp() }
    if( bias == "b") { return this.enharmonicFlat() }
    return this.toString()
}

String.prototype.enharmonicForKey =  function( key ) { // key.fifths is positive  is sharp, negative is flat
    if( key.fifths == 0){ return this.toString() }
    else if(  key.fifths > 0 ) { return this.toString().enharmonicSharp() }
    else { return this.toString().enharmonicFlat() }
}


// conver from base 12 to note name in flats e.g. 30 to 'C3' to 30, 4a to 'Bb4'
// assume octave is in range 0 <= octave <= 9
String.prototype.fromBase12 = function(  ) {
    const nn = this.toString()
    const octave = nn[0]
    const letter = nn[1]
    const filtered = base12_notes.filter(function( note ){
        if( note.base12 == letter ) { return true }
        else return false
        })
    return filtered[0].level1 + octave
}


// convert from note name in flats to base 12 e.g. 'C3' to 30,  'Bb4' to 4a
// assume octave is in range 0 <= octave <= 9
String.prototype.toBase12 = function( ) {
    const nn = this.toString()
    // if this is a letter, and not a note, then convert to a note
    // by adding the octave
    let octave = nn.replace(/[^0-9]/g, ''); // remove non numbers
    if( octave === '') { octave = 3 }
    let letter = this.toString().replace(/[0-9]/g, '') // remove numbers
    letter =  letter.charAt(0).toUpperCase() + letter.slice(1) // make first character uppercase
    const filtered = base12_notes.filter(function( note ){
        if( note.level1 == letter ) { return true }
        else return false
        })
    return octave + filtered[0].base12
}


/*
noteNameFromFret can take string argument as either
the string number or the note-octave format
*/
String.prototype.noteNameFromFret = function(fret = "1") {
    switch(this.toString() ) {
        case "E4":
        case "1":
        case "44":
            return "E4" .addSemitones( parseInt(fret) )
            break
        case "B3":
        case "3b":   
        case "2":
            return "B3" .addSemitones( parseInt(fret) )
                break
        case "G3":
        case "37":  
        case "3":
            return "G3" .addSemitones( parseInt(fret) )
                break
        case "D3":
        case "4":
        case "32":  
                return "D3" .addSemitones( parseInt(fret) )

                break
        case "A2":
        case "5":
        case "29":
            return "A2" .addSemitones( parseInt(fret) )
                break
        case "E2":
        case "6":
        case "24":
                return "E2" .addSemitones( parseInt(fret) )
                break
    }
}


/* find the octave of this note, which is closest to noteB */

String.prototype.closestTo = function(noteB) {
    let wasSharp = false
    if( this.indexOf("#") !== -1) {
       wasSharp = true
       }
// conver the notes to base12, then to base 10 integers, and compare
    const lowest = parseInt( dc.FRETBOARD_MANAGER.lowestNoteName().toBase12(), 12)
    const highest = parseInt( dc.FRETBOARD_MANAGER.highestNoteName().toBase12(), 12)
    
    let numA = parseInt(this.toBase12(), 12)
    while( numA  >= 12 && numA - 12 >= lowest ){ numA -= 12 }

    const numB = parseInt(noteB.toBase12(), 12)
    while( Math.abs(numB - numA) > 12 && numA <= highest) { numA += 12 }
    if( Math.abs(numB - numA - 12 )  <  Math.abs(numB - numA)  && numA + 12 <= highest) { numA += 12 }

    const foundNote = numA.toString().fromBase12()
    return foundNote

    
// find where the difference is less than 12

}

// determine if note A is higher than B
// notes as in letter + octave "E4", Bb3", etc max len of 3
// cant assume note will be in the guitar fret as notes could be for bass part
String.prototype.higherThan =  function(  noteB) {
    // convert to flats
    const strA = this.enharmonicFlat()
    const strB = noteB.enharmonicFlat()
    const numA = strA.toBase12()
    const numB = strB.toBase12()
    if( parseInt(numA, 12) > parseInt(numB, 12) ) { return true}
    else return false
}

String.prototype.higherThanOrEqualTo =  function(  noteB) {
  
    if(this.enharmonicFlat() == noteB.enharmonicFlat() ) return true;
    return this.higherThan(noteB)

}

String.prototype.lowerThanOrEqualTo =  function(  noteB) {
  
    if(this.enharmonicFlat() == noteB.enharmonicFlat() ) return true;
    return this.lowerThan(noteB)

}


String.prototype.lowerThan =  function(  noteB) {
    // convert to flats
    const strA = this.enharmonicFlat()
    const strB = noteB.enharmonicFlat()
    const numA = strA.toBase12()
    const numB = strB.toBase12()
    if( parseInt(numA, 12) < parseInt(numB, 12)  ) { return true}
    else return false
}



// addSemitone can take either a letter or a note as argument

String.prototype.addSemitones = function( st ) {
    //   e.g.  Bb3 + 4 semitones:  Bb3->3a, parseInt('3a', 12) + 4 = 50, parseInt(50).toString(12) = 42 -> D4
    let wasSharp = false
    if( this.indexOf("#") !== -1) {
       wasSharp = true
       }
   const str =  this.enharmonicFlat()
   /* the idea here is to convert from note/octave to base 12
   convert from base 12 to base 10
   do arithmetic in base 10
   convert back to base 12 then to note/octave
   */

   const transInt = parseInt(str.toBase12(), 12) * 1 + st // from note/octave, parseInt converts to base 10, then base 10 arithmetic
   let returnStr = transInt.toString( 12 ) // opposite of parseInt(12), converts to base 12
   returnStr = returnStr.fromBase12() // to note/octave
   // if taking a letter as argument, remove the octave from the return value
   if( this.toString().replace(/[0-9]/g, '').length ===  this.toString().length ) {
       returnStr = returnStr.replace(/[0-9]/g, '') }
   if(wasSharp) {
       returnStr = returnStr.enharmonicSharp()
       }
   return returnStr
   }


// String.prototype.addSemitones = function( st ) {
//  //   e.g.  Bb3 + 4 semitones:  Bb3->3a, parseInt('3a', 12) + 4 = 50, parseInt(50).toString(12) = 42 -> D4
//  let wasSharp = false
//  if( this.indexOf("#") !== -1) {
//     wasSharp = true
//     }
// const str =  this.enharmonicFlat()
// const num =  str.toBase12()
// const transInt = parseInt(num, 12) + st
// let returnStr = transInt.fromBase12( 12)
// // if taking a letter as argument, remove the octave from the return value
// if( this.toString().replace(/[0-9]/g, '').length ===  this.toString().length ) {
//     returnStr = returnStr.replace(/[0-9]/g, '') }
// if(wasSharp) {
//     returnStr = returnStr.enharmonicSharp()
//     }
// return returnStr
// }



/* display the note string in the key
key argument is fifths format - positive for sharps, negative for flats 

const flats_by_fifths = ['a', '3','8', '1',  '6',  'b',  '4'  ]
const sharps_by_fifths = [ '6', '1',  '8', '3','a',  '5',  '0' ]
const flats_by_fifths = ['Bb', 'Eb','Ab', 'Db',  'Gb',  'Cb',  'Fb'  ]               
const sharps_by_fifths = [ 'F#', 'C#',  'G#', 'D#','A#',  'E#',  'B#' ]       
*/
String.prototype.formatForKey = function ( fifths ) {
    const self = this
    let keyStr = undefined
    const fNum = Number(fifths)
    if( fNum == 0) return this;
    
    if( this.length > 1) { 
        // const numB12 =  this.toBase12()[1] // octive is [0], b12 [1]
        if( fNum < 0) { // flats
            const strNote = this.enharmonicFlat()
            const arr = flats_by_fifths.slice(0, Math.abs(fNum))
            $.each(arr, function(i, n){
                // remove any octave for comparison
               if(strNote.replace(/[0-9]/g, '') == n)   { // note is in the key, so remove accidental
                keyStr = strNote.replace('b','')
                return false
                 }   
                 else { 
                // check to see if it is a natural note - convert to base 12 and natural is one above
                const strB12 = strNote.toBase12()
                const octave = strB12[0]
                const numB12 = parseInt(strB12, 12)
                const nextB12 = parseInt((n+octave).toBase12(),12)
                if( numB12 - nextB12 == 1 ) { // should be a natural
                    keyStr = strNote[0] + 'n' + octave
                    return false
                    }
                 }
             })
            }
        else if( fNum > 0) { // sharps
            const strNote = this.enharmonicSharp()
            const arr = sharps_by_fifths.slice(0, Math.abs(fNum))
            $.each(arr, function(i, n){
                // remove any octave for comparison
               if(strNote.replace(/[0-9]/g, '') == n)   { // note is in the key, so remove accidental
                keyStr = strNote.replace('#','')
                return false
                 }
                else { 
                // check to see if it is a natural note - convert to base 12 and natural is one above
                const strB12 = strNote.toBase12()
                const octave = strB12[0]
                const numB12 = parseInt(strB12, 12)
                const nextB12 = parseInt( (n+octave).toBase12(), 12)
                if( nextB12 - numB12   == 1 ) { // should be a natural
                    keyStr = strNote[0] + 'n' + octave
                    return false
                    }
                    }

             })
            }
  
    }

// for remaining keys, ensure other accidentals they are flats if the key is a flat based keys ditto sharps
if( typeof keyStr === "undefined") {
    if( fNum < 0) {keyStr = this.enharmonicFlat()}
    else if (fNum > 0){keyStr = this.enharmonicSharp()}
    }
return keyStr
}




/* vexflow key is "C/4", "D/4", etc i.e. the octave is preceded by a slash 
assume string is already formatted as letter and number */

String.prototype.vexflowFormat = function () {
    let returnStr = this
    if( this.length > 1 && this.indexOf('/') === -1 ) { // check not already in vexflow format
        const vfNote = this.slice(0, this.length - 1)
        const octive = this.slice(this.length - 1, this.length)
        returnStr =  vfNote.concat( "/", octive)
    }

  return returnStr
}




// get the next item after item in the array
// if the item is the last item in the array, return the first item
// i.e. it cycles
Array.prototype.next = function( item ) {
let foundItem = undefined
const index = this.indexOf(item)
if( index !== -1 ) {
    if( index === this.length -1) { // cycle to first item
        return this[0]
        }
    else  return this[index + 1] // cycle to next item
    }
return foundItem
}


Array.prototype.previous = function( item ) {
    let foundItem = undefined
    const index = this.indexOf(item)
    if( index !== -1 ) {
        if( index === 0 ) {
                return this[this.length - 1]
                }
            else  return this[index - 1] // cycle to previous item
        }  
return foundItem
}







     /**
      * 
  this function from https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object

 * Sets a value of nested key string descriptor inside a Object.
 * It changes the passed object.
 * Ex:
 *    let obj = {a: {b:{c:'initial'}}}
 *    setNestedKey(obj, ['a', 'b', 'c'], 'changed-value')
 *    assert(obj === {a: {b:{c:'changed-value'}}})
 *
 * @param {[Object]} obj   Object to set the nested key
 * @param {[Array]} path  An array to describe the path(Ex: ['a', 'b', 'c'])
 * @param {[Object]} value Any value
 */
function setNestedKey (obj, path, value) {
    if (path.length === 1) {
      obj[path] = value
      return
    }
    return setNestedKey(obj[path[0]], path.slice(1), value)
  }






  function getChordFormSSWithId( formId ) {

    let fIndex = formSSLookup.id.indexOf(formId)
    let stringset = formSSLookup.stringset[fIndex]
    let display = formSSLookup.display[fIndex]
    return {id: formId,
            fSS: stringset,
            display: display,
        }

}


function getChordFormSSWithFSS( fSS ) {

    let fIndex = formSSLookup.stringset.indexOf(fSS)
    let formId = formSSLookup.id[fIndex]
    let display = formSSLookup.display[fIndex]
    return {id: formId,
            fSS: fSS,
            display: display,
        }

}

function getChordFormSSWithDisplay( display ) {

    let fIndex = formSSLookup.display.indexOf(display)
    let formId = formSSLookup.id[fIndex]
    let fSS = formSSLookup.stringset[fIndex]
    return {id: formId,
            fSS: fSS,
            display: display,
        }

}



