// import jQuery from 'jquery';
import '/src/globals.js'
import {midiLookup} from "/src/harmony/core.js"

/* 
only one tuning loaded at a time 
for tuning, as only one object loaded, it is not more efficient to check the timestamp in localstorage
for persistence, the tuning id is stored in cookie*/



export default class TuningManager {
constructor() {

    // for now just loading one tuning at a time
        this._id = null;
        this._name = null
        this._noteNames= [] // array of strings e.g.[E2, A2, ...]
    }

get id (){ return this._id }
set id(x) {this._id=x}
get name (){ return this._name }
set name(n) {this._name=n}
get noteNames() { return this._noteNames   }
set noteNames(arr){ this._noteNames = arr }
get midi(){ return this._noteNames.map(n=>midiLookup[n]) }
get numberOfStrings() {
    return this._noteNames.length
}



// console.log("fetched data: ",data)
// }
// get harmonies from the server
async ajax_retrieve() {
  try{
  console.log("ajax_retrieve for tuning data on the server ...");

  const token = await dc.getCSRF_TOKEN() 
  console.log("ajax-retrieve token:", token);
//   const url = "http://127.0.0.1:8000/ajax-tuning/";
// need to use localhost here to align with the backend 
// otherwise get cookie not being sent correctly
    const url = "http://localhost:8000/ajax-tuning/";

  let response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token
        },
        body: JSON.stringify({
          withCredentials: true
        })
      })

    const data = await response.json();
    console.log("server returned:", data);

  if(  data.tuning) {
  console.log("ajax_retrieve returning data:", data.tuning);
  return data.tuning;
  }
    
  console.log("ajax_retrieve: something went wrong ... returning null")
  return null
  }
    catch(err){
      console.log("error fetching tuning data")
    }
}



 async load_tuning() {
    if (this._loadingPromise) return this._loadingPromise;
    this._loadingPromise = this._loadInternal();
    return this._loadingPromise;
  }


async _loadInternal() {

  if (this._loaded) return;
this._loaded = true;

 if( this._dict != null) return null
  
    try {


      const db = dc.db
      // console.log("dexie db: ", db)

     let stored = await db.tuning.orderBy('id').first();

      if (stored) {
        console.log(" tuning table already exists — loading from IndexedDB");

        this.id = stored.id;
        this.name = stored.name;
        this.noteNames = stored.noteNames;
        return;
      } // stored

        else {
            // -------------------------
            // FETCH FROM SERVER BRANCH
            // -------------------------

        console.log("Retrieving tuning data from server...");

        const data = await this.ajax_retrieve();
        this.id = data.id;
        this.name = data.name;
        this.noteNames = data.notes;
          // write to Dexie
          await db.tuning.put({
            id: this.id,
            name: this.name,
            noteNames: this.noteNames
          });

          return
        } 
    } 
  catch (err) {
      console.log(" load_tuning error", err)
    }
  
}


} // class tuning 



dc.TUNING_MANAGER = new TuningManager()

