

// Declare variables in a separate .js file and export them. 
// Import the file in components—all imports will reference the same variable instance, 
// avoiding re-initialization.
// https://www.xjavascript.com/blog/how-to-declare-a-global-variable-in-react/


export class  DCManager {
  #globals = {}
  constructor(){ 
   
    this.#globals.DEFAULT_NOTE_COLOR = "darkgrey"
    this.#globals.ROOT_NOTE_COLOR = "black"
    this.#globals.THIRD_NOTE_COLOR = "green"
    this.#globals.FIFTH_NOTE_COLOR = "DodgerBlue"

    this.#globals.SEVENTH_NOTE_COLOR = "red"
    this.#globals.LOWEST_ALLOWED_FRET = 1
    this.#globals.HIGHEST_ALLOWED_FRET = 18
    this.mouseIsDown = false  // for monitoring of dragging
    this.#globals.profile = {
          profiling:  true,
          profile_log: [],
          profile_start: new Date().getTime(),
          }

    this.#globals.debug = {
          debugging : true,
      }
      this.#globals.CSRF_TOKEN = null
  }




 async  initCsrf() {
  return await fetch("http://localhost:8000/set-csrf/", {
    credentials: "include"
  })

}




  
 async getCSRF_TOKEN() {
  if( this.#globals.CSRF_TOKEN != null) return this.#globals.CSRF_TOKEN
  await this.initCsrf() // write csrf to cookie
  // get csrf from cookie
  const name = "csrftoken=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      this.#globals.CSRF_TOKEN = cookie.substring(name.length);
      return this.#globals.CSRF_TOKEN
    }
  }
  return null
}




get profileLog() {return this.#globals.profile.profile_log}
get profiling() { return this.#globals.profile.profiling}
get profile_start() { return this.#globals.profile.profile_start }
set profiling(b) { this.#globals.profile.profiling = b}
clearProfileLog() { 
    this.profile.profile_log = []
    this.profile.profile_start = new Date().getTime()
  }
addProfile(str) {  if( this.profiling   ) {
                  this.profileLog.push(  { message: str, ms: new Date().getTime() - this.profile_start  })  } //profiling 
            } // addProfile

get debugging() { return this.#globals.debug.debugging}
set debugging(b) { this.#globals.debug.debugging = b}
log(str) { if( this.debugging == true) {
  console.log(str)
  }}

get ACTIVTY_BAR() { return this.#globals.ACTIVTY_BAR}
set ACTIVTY_BAR(x) {  this.#globals.ACTIVTY_BAR = x}

get CLIPBOARD_MANAGER() { return this.#globals.CLIPBOARD_MANAGER}
set CLIPBOARD_MANAGER(x) {  this.#globals.CLIPBOARD_MANAGER = x}

get UNDO_MANAGER() { return this.#globals.UNDO_MANAGER}
set UNDO_MANAGER(x) {  this.#globals.UNDO_MANAGER = x}


get TUNING() { return this.#globals._TUNING}
set TUNING(x) {  this.#globals._TUNING = x}
get HARMONY_MANAGER() { return this.#globals._HARMONY_MANAGER}
set HARMONY_MANAGER(x) {  this.#globals._HARMONY_MANAGER = x}
get CHORD_CHOPS() { return this.#globals._CHORD_CHOPS}
set CHORD_CHOPS(x) {  this.#globals._CHORD_CHOPS = x}
get LEAD_SHEET() { return this.#globals.LEAD_SHEET}
set LEAD_SHEET(x) {  this.#globals.LEAD_SHEET = x}
// LEADSHEET_ID for open document - can prob change this to embed in an element
get LEADSHEET_ID() { return this.#globals.LEADSHEET_ID}
set LEADSHEET_ID(x) {  this.#globals.LEADSHEET_ID = x}

get STATUS_MANAGER() { return this.#globals._STATUS_MANAGER}
set STATUS_MANAGER(x) {  this.#globals._STATUS_MANAGER = x}
get SD_MANAGER() { return this.#globals._SD_MANAGER}
set SD_MANAGER(x) {  this.#globals._SD_MANAGER = x}
get FRETBOARD_MANAGER() { return this.#globals.FRETBOARD_MANAGER}
set FRETBOARD_MANAGER(x) {  this.#globals.FRETBOARD_MANAGER = x}

get DEFAULT_NOTE_COLOR() { return this.#globals.DEFAULT_NOTE_COLOR}
set DEFAULT_NOTE_COLOR(x) {  this.#globals.DEFAULT_NOTE_COLOR = x}
get ROOT_NOTE_COLOR() { return this.#globals.ROOT_NOTE_COLOR}
set ROOT_NOTE_COLOR(x) {  this.#globals.ROOT_NOTE_COLOR = x}
get THIRD_NOTE_COLOR() { return this.#globals.THIRD_NOTE_COLOR}
set THIRD_NOTE_COLOR(x) {  this.#globals.THIRD_NOTE_COLOR = x}
get FIFTH_NOTE_COLOR() { return this.#globals.FIFTH_NOTE_COLOR}
set FIFTH_NOTE_COLOR(x) {  this.#globals.FIFTH_NOTE_COLOR = x}

get SEVENTH_NOTE_COLOR() { return this.#globals.SEVENTH_NOTE_COLOR}
set SEVENTH_NOTE_COLOR(x) {  this.#globals.SEVENTH_NOTE_COLOR = x}

   /* dc.LOWEST_ALLOWED_FRET set to 0 if  allowing open strings 
    currently rendering not good for open strings - need to amend
    so the circle is where the string passes over the nut, and to be an open circle
    */
get LOWEST_ALLOWED_FRET() { return this.#globals.LOWEST_ALLOWED_FRET}
set LOWEST_ALLOWED_FRET(x) {  this.#globals.LOWEST_ALLOWED_FRET = x}
get HIGHEST_ALLOWED_FRET() { return this.#globals.HIGHEST_ALLOWED_FRET}
set HIGHEST_ALLOWED_FRET(x) {  this.#globals.HIGHEST_ALLOWED_FRET = x}

get CHORD_PICKER() { return this.#globals.CHORD_PICKER}
set CHORD_PICKER(x) {  this.#globals.CHORD_PICKER = x}
get SYMBOLS_PICKER() { return this.#globals.SYMBOLS_PICKER}
set SYMBOLS_PICKER(x) {  this.#globals.SYMBOLS_PICKER = x}

get SOUND_MANAGER() { return this.#globals.SOUND_MANAGER}
set SOUND_MANAGER(x) {  this.#globals.SOUND_MANAGER = x}
get SETTINGS_MANAGER() { return this.#globals.SETTINGS_MANAGER}
set SETTINGS_MANAGER(x) {  this.#globals.SETTINGS_MANAGER = x}





// get IMAGE_URL() { return  "{% static 'images/' %}" }
// get STATIC_URL() {return  "{% static '/' %}" }



} // dc


window.dc = new DCManager();
export default window.dc;
    // var CD_MANAGER   // chord dictionary manager

    