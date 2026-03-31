
import '/src/globals.js'

export default class FretboardManager {
constructor() {

    // for now just loading one tuning at a time
        this._numFrets = 16;
   
    }
get numFrets(){ return this._numFrets}
set numFrets(n){this._numFrets = n}

}

dc.FRETBOARD_MANAGER = new FretboardManager()
