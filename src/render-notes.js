import dc from '/src/globals.js'
import TuningManager from "/src/harmony/tuning-manager.js"
import Note from "/src/harmony/note.js"


/*
RenderNote as in the noun, not verb.  This class does not rendering, it
describes the note/notes that require rendering 
It also serves as data layer for sequencing 
*/

export  class RenderNote {
   constructor(options = {}) {
    // console.log("render note options: ")
    // Destructure the options object.
    // Each field has its own default value.
    const {
      note = null,
      text = '',
      interval=null,
       subdivision="8n",
    } = options;

    // Assign to internal fields
    this._note = note
    this._text = text
   this._interval = interval
   this._subdivision = subdivision
    // console.log("render note: ", this)
  }

    get note(){return this._note}
    set note(n){this._note = n}
   
    get text(){return this._text}
    set text(t){this._text = t}
   
    get interval(){return this._interval}
    set interval(i){this._interval = i}

     get subdivision(){return this._subdivision}
    set subdivision(sd){this._subdivision = sd}

  

}


// rendernotes comprise an array always the size of number of frerboard strings
// each member of the 
export  class RenderData {
    constructor(props ) {
        // console.log(`initialising with ${dc.TUNING_MANAGER.numberOfStrings} strings`)
        this.props = props
        this._strings = []
        const len = dc.TUNING_MANAGER.numberOfStrings
        for(let i=0; i<len; i++){
            this._strings.push([])
            }
  
          this._direction = "up" // "up", "down", "updown", "downup", "random", "pattern"
          this._pattern = [1,2,3,4,5,6,7,8] // e.g. [1,2,3,4,5,6,7,8]
        }



get active() { return this._active} 
set active(a) { this._active=a}

get direction() { return this._direction} 
set direction(d) { this._direction=d}

get pattern() { return this._pattern} 
set pattern(p) { this._pattern=p}

  // passing props as method arguments only gives your class a snapshot of the values at the moment you call the method.
    // props need to be updated manually each time the props change
    setProps(p) {this.props = p}



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


/*
renderNotes accounts for various Patterns, direction, etc
*/
get renderNotes() {

  try{
  // first get an array of all render notes
  const{patternUI, directionUI}=this.props

// array of all render notes for this rendering
const arr_rn = []
const arrRev = [...this._strings].reverse();
// console.log("arrFwd: ", arrFwd, "arrRev: ", arrRev)  
    for( let s of arrRev ){
      for(let rn of s) {
        // console.log("adding rn to _arr_rn: ", rn, _arr_rn )
      arr_rn.push(rn)
      }
    }

// find the index of roots
const roots = arr_rn.map((rn,idx)=>rn.note.interval==1?idx:null).filter(idx=>idx!=null)
// console.log("roots: ", roots)
const rr_forward = [] // index of root-to-root asc
for(let i = roots[0]; i < roots[roots.length-1] ; i++) {
  rr_forward.push(i)
}
  
const rr_reverse= [] // index of root-to-root desc
for(let i = roots[roots.length-1] ; i> roots[0]; i--) {
  rr_reverse.push(i)
}
// console.log("rr_forward: ", rr_forward, " \nrr_reverse: ", rr_reverse)

let seqArray = null // final sequence  as indexes to the render notes
if( patternUI == "sequential" ){

  if( directionUI == "asc") {  seqArray = rr_forward}
  else if( directionUI == "desc") {  seqArray = rr_reverse }
  else if( directionUI == "asc-desc") { seqArray =  [...rr_forward, ...rr_reverse] }
  else if( directionUI == "desc-asc") {   seqArray =  [...rr_reverse, ...rr_forward]  }
} // sequential

else { // pattern
  // patternUI is 1 based - change to index based
  const pat = patternUI.split("-").map(n=>Number(n)-1); // convert to numbers
  const step=1 // assume step of 1 for now, not sure there is much benefit in having steps greater than 1?

// objective is to get e.g. [1,3,2,4,3,6,4,7,5,8,6,9,7,11] for starting pattern of [1,3]

let ascSeqArray = [] 
  let seqHigh = null
  let root_idx = roots[0]
  for( let i = 0; i < rr_forward.length; i+=step) {
    const nextSeq = pat.map(n=>root_idx+n+i)
    seqHigh = Math.max(...nextSeq);
    ascSeqArray = [...ascSeqArray, ...nextSeq]
        console.log("nextSeq: ", nextSeq, "ascSeqArray: ", ascSeqArray, "i: ", i, )

  }

  let descSeqArray = []
  let seqLow = null
   for( let i = rr_reverse.length; i >= 1; i-=step) {
    const nextSeq = pat.map(n=>root_idx+i-n)
    seqLow = Math.max(...nextSeq);
    descSeqArray = [...descSeqArray, ...nextSeq]
    // console.log("nextSeq: ", nextSeq, "descSeqArray: ", descSeqArray, "i: ", i, )
  }

    //  if( directionUI == "asc") { seqArray = ascSeqArray  }
   if( directionUI == "asc") {   seqArray = ascSeqArray}
   if( directionUI == "desc") {   seqArray = descSeqArray}
  else if( directionUI == "asc-desc") { seqArray = [...ascSeqArray, ...descSeqArray]  }
  else if( directionUI == "desc-asc") {   seqArray = [...descSeqArray, ...ascSeqArray]  }

  } // pattern

  // convert from sequence indices to render notes for return
// console.log("seqArray: ", seqArray)
  const renderNotes = []
    for( let i of seqArray){
      // console.log(" i: ", i, " arr_rn[i] ", arr_rn[i], )
      renderNotes.push(arr_rn[i])
    }
      
// console.log("returning render notes: ", renderNotes)
    return renderNotes

}


  
  catch(e){
    console.log("error in get renderNotes: ", e)
  }
}



get notes() { 
  const renderNotes = this.renderNotes
  console.log("get notes renderNotes: ", renderNotes)
  return renderNotes.map((rn)=>{
  // console.log("mapping renderNote: ", rn)
  return rn.note })
}

get noteNames() { return this.renderNotes.map((rn)=> rn.note.name) }


// render notes belonging to a string
string(n) { 
if( n <= 0 || n > this._strings.length) throw "string number out of range in RenderData:string()"
return  this._strings[n-1] 
}

// set note(arr){this._notes = arr}
add(rn, string){ 
   if( typeof string === "undefined") {  string = rn.note.stringNumber  }
    if( string <= 0 || string > this._strings.length) throw "string number out of range in RenderData:add()"
   
  this._strings[string-1].push(rn)  

}

} // RenderData