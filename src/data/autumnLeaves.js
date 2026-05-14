

export const autumnLeaves = {
  title: "Autumn Leaves (Sample Lead Sheet)",
  key: "G",
  time: "4/4",
  tempo: 140,

  ties: [
    { id: "tie1", startMeasure: 1, startIndex: 0, endMeasure: 2, endIndex: 0 },
    { id: "tie2", startMeasure: 3, startIndex: 1, endMeasure: 4, endIndex: 0 },
    { id: "tie3", startMeasure: 5, startIndex: 0, endMeasure: 6, endIndex: 0 },
    { id: "tie4", startMeasure: 9, startIndex: 0, endMeasure: 10, endIndex: 0 },
    { id: "tie5", startMeasure: 11, startIndex: 1, endMeasure: 12, endIndex: 0 },
    { id: "tie6", startMeasure: 13, startIndex: 0, endMeasure: 14, endIndex: 0 },
    { id: "tie7", startMeasure: 15, startIndex: 0, endMeasure: 16, endIndex: 0 },
    { id: "tie8", startMeasure: 19, startIndex: 0, endMeasure: 20, endIndex: 0 },
    { id: "tie9", startMeasure: 21, startIndex: 0, endMeasure: 22, endIndex: 0 },
    { id: "tie10", startMeasure: 27, startIndex: 1, endMeasure: 28, endIndex: 0 },

  ],

  slurs: [
    { id: "slur1", startMeasure: 0, startIndex: 2, endMeasure: 0, endIndex: 3 },
    { id: "slur2", startMeasure: 2, startIndex: 3, endMeasure: 3, endIndex: 0 },
    { id: "slur3", startMeasure: 4, startIndex: 3, endMeasure: 5, endIndex: 0 }
  ],

  measures: [
    {
      id: "m1",
      chords: ["Gmaj7"],
      melody: [
        { id: "m1-n1", pitches: [], duration: "q", dots: 0 },
        { id: "m1-n2", pitches: ["C4"], duration: "q", dots: 1, string: 3, fret: 5 },
        { id: "m1-n3", pitches: ["D4", "D5"], duration: "e", dots: 0, string: 2, fret: 3 },
        { id: "m1-n4", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      ]
      //   melody: [
      //   { id: "m1-n1", pitches: [], duration: "q", dots: 0 },
      //   { id: "m1-n2", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
      //   { id: "m1-n3", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
      //   { id: "m1-n4", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      // ]
    },

    {
      id: "m2",
      chords: ["Fm7"],
      melody: [
        { id: "m2-n1", pitches: ["Ab4"], duration: "w", dots: 0, string: 2, fret: 9 }
      ]
    },

    {
      id: "m3",
      chords: ["Bb7"],
      melody: [
        { id: "m3-n1", pitches: ["Ab4"], duration: "q", dots: 0, string: 2, fret: 9 },
        { id: "m3-n2", pitches: ["Bb3"], duration: "q", dots: 0, string: 3, fret: 3 },
        { id: "m3-n3", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
        { id: "m3-n4", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 }
      ]
    },

    {
      id: "m4",
      chords: ["Ebmaj7"],
      melody: [
        { id: "m4-n1", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 },
        { id: "m4-n2", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 }
      ]
    },

    {
      id: "m5",
      chords: ["Abmaj7"],
      melody: [
        { id: "m5-n1", pitches: ["G4"], duration: "q", dots: 0, string: 2, fret: 8 },
        { id: "m5-n2", pitches: ["Ab3"], duration: "q", dots: 0, string: 4, fret: 6 },
        { id: "m5-n3", pitches: ["Bb3"], duration: "q", dots: 0, string: 3, fret: 3 },
        { id: "m5-n4", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 }
      ]
    },

    {
      id: "m6",
      chords: ["Dm7b5"],
      melody: [
        { id: "m6-n1", pitches: ["F4"], duration: "w", dots: 0, string: 2, fret: 6 }
      ]
    },

    {
      id: "m7",
      chords: ["G7"],
      melody: [
        { id: "m7-n1", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 },
        { id: "m7-n2", pitches: ["G3"], duration: "q", dots: 0, string: 4, fret: 5 },
        { id: "m7-n3", pitches: ["A3"], duration: "q", dots: 0, string: 3, fret: 2 },
        { id: "m7-n4", pitches: ["B3"], duration: "q", dots: 0, string: 3, fret: 4 }
      ]
    },

    {
      id: "m8",
      chords: ["Cm7"],
      melody: [
        { id: "m8-n1", pitches: ["Eb4"], duration: "w", dots: 0, string: 2, fret: 4 }
      ]
    },

    {
      id: "m9",
      chords: ["Cm7"],
      melody: [
        { id: "m9-n1", pitches: [], duration: "q", dots: 0 },
        { id: "m9-n2", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
        { id: "m9-n3", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m9-n4", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      ]
    },

    {
      id: "m10",
      chords: ["Fm7"],
      melody: [
        { id: "m10-n1", pitches: ["Ab4"], duration: "w", dots: 0, string: 2, fret: 9 }
      ]
    },

    {
      id: "m11",
      chords: ["Bb7"],
      melody: [
        { id: "m11-n1", pitches: ["Ab4"], duration: "q", dots: 0, string: 2, fret: 9 },
        { id: "m11-n2", pitches: ["Bb3"], duration: "q", dots: 0, string: 3, fret: 3 },
        { id: "m11-n3", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
        { id: "m11-n4", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 }
      ]
    },

    {
      id: "m12",
      chords: ["Ebmaj7"],
      melody: [
        { id: "m12-n1", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 },
        { id: "m12-n2", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 }
      ]
    },
    {
      id: "m13",
      chords: ["Abmaj7"],
      melody: [
        { id: "m13-n1", pitches: ["G4"], duration: "q", dots: 0, string: 2, fret: 8 },
        { id: "m13-n2", pitches: ["Ab3"], duration: "q", dots: 0, string: 4, fret: 6 },
        { id: "m13-n3", pitches: ["Bb3"], duration: "q", dots: 0, string: 3, fret: 3 },
        { id: "m13-n4", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 }
      ]
    },

    {
      id: "m14",
      chords: ["Dm7b5"],
      melody: [
        { id: "m14-n1", pitches: ["F4"], duration: "w", dots: 0, string: 2, fret: 6 }
      ]
    },

    {
      id: "m15",
      chords: ["G7"],
      melody: [
        { id: "m15-n1", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 },
        { id: "m15-n2", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m15-n3", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 },
        { id: "m15-n4", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      ]
    },

    {
      id: "m16",
      chords: ["Cm7"],
      melody: [
        { id: "m16-n1", pitches: ["C4"], duration: "w", dots: 0, string: 3, fret: 5 }
      ]
    },

    {
      id: "m17",
      chords: ["Cm7"],
      melody: [
        { id: "m17-n1", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
        { id: "m17-n2", pitches: [], duration: "q", dots: 0 },
        { id: "m17-n3", pitches: ["B3"], duration: "q", dots: 0, string: 3, fret: 4 },
        { id: "m17-n4", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 }
      ]
    },

    {
      id: "m18",
      chords: ["Dm7b5"],
      melody: [
        { id: "m18-n1", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m18-n2", pitches: ["G3"], duration: "q", dots: 0, string: 4, fret: 5 },
        { id: "m18-n3", pitches: ["D4"], duration: "h", dots: 0, string: 2, fret: 3 }
      ]
    },
    {
      id: "m19",
      chords: ["G7"],
      melody: [
        { id: "m19-n1", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m19-n2", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m19-n3", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
        { id: "m19-n4", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 }
      ]
    },

    {
      id: "m20",
      chords: ["Cm7"],
      melody: [
        { id: "m20-n1", pitches: ["Eb4"], duration: "w", dots: 0, string: 2, fret: 4 }
      ]
    },

    {
      id: "m21",
      chords: ["Cm7"],
      melody: [
        { id: "m21-n1", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 },
        { id: "m21-n2", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 },
        { id: "m21-n3", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m21-n4", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      ]
    },

    {
      id: "m22",
      chords: ["Fm7"],
      melody: [
        { id: "m22-n1", pitches: ["F4"], duration: "w", dots: 0, string: 2, fret: 6 }
      ]
    },

    {
      id: "m23",
      chords: ["Bb7"],
      melody: [
        { id: "m23-n1", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 },
        { id: "m23-n2", pitches: ["Bb3"], duration: "q", dots: 0, string: 3, fret: 3 },
        { id: "m23-n3", pitches: ["Bb4"], duration: "q", dots: 0, string: 1, fret: 6 },
        { id: "m23-n4", pitches: ["Ab4"], duration: "q", dots: 0, string: 2, fret: 9 }
      ]
    },

    {
      id: "m24",
      chords: ["Ebmaj7"],
      melody: [
        { id: "m24-n1", pitches: ["G4"], duration: "w", dots: 0, string: 2, fret: 8 }
      ]
    },
    {
      id: "m25",
      chords: ["Ebmaj7"],
      melody: [
        { id: "m25-n1", pitches: ["G4"], duration: "q", dots: 0, string: 2, fret: 8 },
        { id: "m25-n2", pitches: [], duration: "q", dots: 0 },
        { id: "m25-n3", pitches: ["Gb4"], duration: "q", dots: 0, string: 2, fret: 7 },
        { id: "m25-n4", pitches: ["G4"], duration: "q", dots: 0, string: 2, fret: 8 }
      ]
    },

    {
      id: "m26",
      chords: ["Dm7b5"],
      melody: [
        { id: "m26-n1", pitches: ["Ab4"], duration: "q", dots: 0, string: 2, fret: 9 },
        { id: "m26-n2", pitches: ["Ab4"], duration: "q", dots: 0, string: 2, fret: 9 },
        { id: "m26-n3", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 },
        { id: "m26-n4", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 }
      ]
    },

    {
      id: "m27",
      chords: ["G7"],
      melody: [
        { id: "m27-n1", pitches: ["D4"], duration: "h", dots: 0, string: 2, fret: 3 },
        { id: "m27-n2", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m27-n3", pitches: ["Ab4"], duration: "q", dots: 0, string: 2, fret: 9 }
      ]
    },

    {
      id: "m28",
      chords: ["Cm7"],
      melody: [
        { id: "m28-n1", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 },
        { id: "m28-n2", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 }
      ]
    },

    {
      id: "m29",
      chords: ["Cm7"],
      melody: [
        { id: "m29-n1", pitches: ["G4"], duration: "h", dots: 0, string: 2, fret: 8 },
        { id: "m29-n2", pitches: ["C4"], duration: "h", dots: 0, string: 3, fret: 5 }
      ]
    },

    {
      id: "m30",
      chords: ["AbMaj7"],
      melody: [
        { id: "m30-n1", pitches: ["F4"], duration: "h", dots: 0, string: 2, fret: 6 },
        { id: "m30-n2", pitches: ["F4"], duration: "q", dots: 0, string: 2, fret: 6 },
        { id: "m30-n3", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      ]
    },

    {
      id: "m31",
      chords: ["G7"],
      melody: [
        { id: "m31-n1", pitches: ["D4"], duration: "h", dots: 0, string: 2, fret: 3 },
        { id: "m31-n2", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 },
        { id: "m31-n3", pitches: ["G3"], duration: "q", dots: 0, string: 4, fret: 5 }
      ]
    },

    {
      id: "m32",
      chords: ["Cm7"],
      melody: [
        { id: "m32-n1", pitches: ["C4"], duration: "w", dots: 0, string: 3, fret: 5 }
      ]
    },

    {
      id: "m33",
      chords: ["Cm7"],
      melody: [
        { id: "m33-n1", pitches: [], duration: "q", dots: 0 },
        { id: "m33-n2", pitches: ["C4"], duration: "q", dots: 0, string: 3, fret: 5 },
        { id: "m33-n3", pitches: ["D4"], duration: "q", dots: 0, string: 2, fret: 3 },
        { id: "m33-n4", pitches: ["Eb4"], duration: "q", dots: 0, string: 2, fret: 4 }
      ]
    }
  ]
};

