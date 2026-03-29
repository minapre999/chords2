import TuningManager from "/src/harmony/tuning-manager.js"
import Note from "/src/harmony/note.js"


/*
RenderNote as in the noun, not verb.  This class does not rendering, it
describes the note/notes that require rendering together with display
attributes
*/

export  class RenderNote {
    constructor(args={note: n, color: 'black', strokeColor: 'black', fillColor: 'white', fontSize: 12, width: 12, text: "" }) {
        this._note = args.note
        this._strokeColor=args.strokeColor
        this._fillColor=args.fillColor
        this._color=args.color
        this._stroke=args.fillColor
        this._width=args.width
        this._text=args.text
        this._fontSize=args.fontSize
    }

    get note(){return this._note}
    set note(n){this._note = n}
    get width(){return this._width}
    get color(){return this._color}
    set color(c){this._color = c}
     get fillColor(){return this._fillColor}
    set fillColor(c){this.fillColor = c}
    get strokeColor(){return this._strokeColor}
    set strokeColor(c){this._strokeColor = c}
    get width(){return this._width}
    set width(w){this._width = w}
    get text(){return this._text}
    set text(t){this._text = t}
     get fontSize(){return this._fontSize}
    set fontSize(t){this._fontSize = t}
}


// rendernotes comprise an array always the size of number of frerboard strings
// each member of the 
export default class RenderData {
    constructor( ) {
        console.log(`initialising with ${dc.TUNING_MANAGER.numberOfStrings} strings`)
        this._strings = []
        const len = dc.TUNING_MANAGER.numberOfStrings
        for(let i=0; i<len; i++){
            this._strings.push([])
            }
        
            }

get strings() {return this._strings}

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