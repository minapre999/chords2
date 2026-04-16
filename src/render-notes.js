import TuningManager from "/src/harmony/tuning-manager.js"
import Note from "/src/harmony/note.js"


/*
RenderNote as in the noun, not verb.  This class does not rendering, it
describes the note/notes that require rendering together with display
attributes
*/

export  class RenderNote {
   constructor(options = {}) {
    console.log("render note options: ")
    // Destructure the options object.
    // Each field has its own default value.
    const {
      note = null,
      color = 'black',
      strokeColor = 'black',
      fillColor = 'white',
      fontSize = 12,
      width = 12,
      text = '',
      activeWidth = width*1.5,
      activefontSize = fontSize*1.5,
      activeFillColor= 'white',
      activeStrokeColor= 'lime',
      activeColor= 'red',
    } = options;

    // Assign to internal fields
    this._note = note;
    this._color = color;
    this._strokeColor = strokeColor;
    this._fillColor = fillColor;
    this._stroke = strokeColor;   // assuming stroke = strokeColor
    this._width = width;
    this._text = text;
    this._fontSize = fontSize;
    this._activeWidth = activeWidth
    this._activeFontSize = activefontSize
    this._activeColor= activeColor
    this._activeFillColor = activeFillColor
    this._activeStrokeColor = activeStrokeColor

    console.log("render note: ", this)
  }

    get note(){return this._note}
    set note(n){this._note = n}
    get width(){return this._width}
    get color(){return this._color}
    set color(c){this._color = c}
    get fillColor(){return this._fillColor}
    set fillColor(c){this._fillColor = c}
    get strokeColor(){return this._strokeColor}
    set strokeColor(c){this._strokeColor = c}
    get width(){return this._width}
    set width(w){this._width = w}
    get text(){return this._text}
    set text(t){this._text = t}
     get fontSize(){return this._fontSize}
    set fontSize(t){this._fontSize = t}

    get activeWidth(){return this._activeWidth}
    set activeWidth(w){this._activeWidth = w}
    get activeFontSize(){return this._activeFontSize}
    set activeFontSize(t){this._activeFontSize = t}
    get activeColor(){return this._activeColor}
    set activeColor(c){this._activeColor = c}
    get activeFillColor(){return this._activeFillColor}
    set activeFillColor(c){this._activeFillColor = c}
    get activeStrokeColor(){return this._activeStrokeColor}
    set activeStrokeColor(c){this._activeStrokeColor = c}
}


// rendernotes comprise an array always the size of number of frerboard strings
// each member of the 
export default class RenderData {
    constructor( ) {
        // console.log(`initialising with ${dc.TUNING_MANAGER.numberOfStrings} strings`)
        this._strings = []
        const len = dc.TUNING_MANAGER.numberOfStrings
        for(let i=0; i<len; i++){
            this._strings.push([])
            }
         /*   this._active
                {stringIndex: int,
                noteIndex: int
                }
         */
    
        }



get active() { return this._active} 
set active(a) { this._active=a}

// see https://stackoverflow.com/questions/28739745/how-to-make-an-iterator-out-of-an-es6-class
/* iterate from bottom string to top string
/ over each note on each string */

[Symbol.iterator]() {

  // console.log("Symbol.iterator function")
  const _arr_rn = []
const arrRev = [...this._strings].reverse();
  for( let s of arrRev){
      for(let rn of s) {
        // console.log("adding rn to _arr_rn: ", rn, _arr_rn )
      _arr_rn.push(rn)
      }
    }
    console.log("_arr_rn: ", _arr_rn )
  let activeIndex = 0

  return {
      next() {
      //  console.log("next() activeIndex: ", activeIndex)
        const rn = _arr_rn[activeIndex++]
        const d = activeIndex === _arr_rn.length-1 ? true : false
          console.log("returning next()) rn... ", rn, " note: ", rn.note, " ++activeIndex: ", activeIndex, " done: ", d )

        return { value:  rn, 
                     done: d } 
      } // next
    
  } // return
} //iterator



get strings() {return this._strings}
// active note


get renderNotes() {

  const arr_rn = []
 const arrFwd = [...this._strings];
const arrRev = [...this._strings].reverse();
console.log("arrFwd: ", arrFwd, "arrRev: ", arrRev)  
    for( let s of arrRev ){
      for(let rn of s) {
        // console.log("adding rn to _arr_rn: ", rn, _arr_rn )
      arr_rn.push(rn)
      }
    }
return arr_rn

  // const arr = []
  // for(const rn of this){
  //   console.log("get renderNotes() rn: ", rn)
  //     arr.push(rn)
  //   }
  // return arr
}

get notes() { 
  const renderNotes = this.renderNotes
  console.log("get notes renderNotes: ", renderNotes)
  return renderNotes.map((rn)=>{
  console.log("mapping renderNote: ", rn)
  return rn.note })
}

get noteNames() { return this.renderNotes.map((rn)=> rn.note.name) }


// render notes belonging to a string
string(n) { 
if( n <= 0 || n > this._strings.length) throw "string number out of range in RenderData:string()"
return  this._strings[n-1] 
}

// set note(arr){this._notes = arr}
add(rn, string=1){ 
    if( string <= 0 || string > this._strings.length) throw "string number out of range in RenderData:add()"
    
this._strings[string-1].push(rn)  

}

} // RenderData