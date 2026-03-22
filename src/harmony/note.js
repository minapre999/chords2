

// throw new Error("THIS IS THE REAL NOTE.JS");


export default class Note {
  constructor(values = {}, fretboardManager) {
    this._fretboardManager = fretboardManager;

    // Basic fields
    this._fret = values.fret ?? undefined;
    this._interval = values.interval ?? undefined;
    this._stringNumber = values.stringNumber ?? undefined;
    this._name = values.name ?? undefined;

    // Finger must ALWAYS be a valid array
    this._finger = Array.isArray(values.finger)
      ? values.finger
      : [{ f: 1 }];
  }

  // -----------------------------
  // Cloning
  // -----------------------------
  copy() {
    const clone = new Note({}, this._fretboardManager);
    return Object.assign(clone, JSON.parse(JSON.stringify(this)));
  }

  // -----------------------------
  // Accessors
  // -----------------------------
  get fretboardManager() {
    return this._fretboardManager;
  }

  get fret() {
    return this._fret;
  }
  set fret(f) {
    this._fret = f;
  }

  get stringNumber() {
    return this._stringNumber;
  }
  set stringNumber(n) {
    this._stringNumber = n;
  }

  get name() {
    if (this._name === undefined) {
      const base = this.stringName;
      if (base?.addSemitones) {
        this._name = base.addSemitones(this.fret);
      } else {
        // fallback: just return the base string
        this._name = base;
      }
    }
    return this._name;
  }
  set name(n) {
    this._name = n;
  }

  get stringName() {
    const tuning = this._fretboardManager?.getTuning?.();
    if (!tuning || !this._stringNumber) return undefined;
    return tuning[this._stringNumber - 1];
  }

  // -----------------------------
  // Fingering
  // -----------------------------
  get finger() {
    return this._finger?.[0]?.f ?? 1;
  }

  set finger(f) {
    if (!Array.isArray(this._finger)) {
      this._finger = [{ f }];
    } else {
      this._finger[0].f = f;
    }
  }

  // -----------------------------
  // Interval
  // -----------------------------
  get interval() {
    return this._interval;
  }
  set interval(i) {
    this._interval = i;
  }

  // -----------------------------
  // Note naming helpers
  // -----------------------------
  noteNameWithBias(enharmonicBias) {
    if (!enharmonicBias && this.name !== undefined) {
      return this.name;
    }

    const base = this.stringNumber?.toString?.().noteNameFromFret?.(this.fret);
    if (!base) return this.name;

    let n = base;
    if (enharmonicBias === "b") n = n.enharmonicFlat?.() ?? n;
    if (enharmonicBias === "#") n = n.enharmonicSharp?.() ?? n;

    this.name = n;
    return n;
  }

  pitch() {
    return this.noteLetter()?.[0];
  }

  alter() {
    const letter = this.noteLetter();
    if (!letter) return 0;
    if (letter.includes("#")) return 1;
    if (letter.includes("b")) return -1;
    return 0;
  }

  octave() {
    try {
      const n = this.name;
      return n?.[n.length - 1];
    } catch {
      return undefined;
    }
  }

  noteLetter() {
    return this.name?.replace(/[0-9]/g, "");
  }

  enharmonicBias() {
    const n = this.name;
    if (!n) return undefined;
    if (n.includes("#")) return "#";
    if (n.includes("b")) return "b";
    return undefined;
  }

  // -----------------------------
  // Positioning
  // -----------------------------
  position() {
    if (this.fret === undefined || this.finger === undefined) return undefined;
    return this.fret - this.finger + 1;
  }

  autoPosition(args = {}) {
    const preferredPosition = args.position ?? 3;

    const targ = this._name?.enharmonicFlat?.();
    if (!targ) return;

    const frets = this._fretboardManager?.getNumFrets?.();
    const tuning = this._fretboardManager?.getTuning?.();
    if (!frets || !tuning) return;

    const positions = [];

    tuning.forEach((noteName, s) => {
      for (let i = 0; i < frets; i++) {
        const next = noteName.addSemitones?.(i)?.enharmonicFlat?.();
        if (next === targ) {
          positions.push({ string: s, fret: i });
        }
      }
    });

    for (const pos of positions) {
      if (this.fret === undefined) {
        this.fret = pos.fret;
        this.stringNumber = pos.string + 1;
      } else {
        const currentDelta = this.fret - preferredPosition;
        const newDelta = pos.fret - preferredPosition;

        if (newDelta < currentDelta && newDelta > 0) {
          this.fret = pos.fret;
          this.stringNumber = pos.string + 1;

          this.finger = Math.min(Math.max(newDelta, 1), 4);
        }
      }
    }
  }
}
