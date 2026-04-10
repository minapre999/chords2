import React from "react";
import "./chord-navigation.css"
import  ChordForm, {HarmonyManager, Chord}  from "/src/harmony/harmony-manager.js"


export default function FormSSNavigator({
cfUI,
setCFUI,
setCFChanged

}) {

  if( cfUI == null) return null
  const oldPos = cfUI.position

      const uniqueFSS =   [...new Set(dc.HARMONY_MANAGER.chordforms.map(cf=>{return cf.form_ss}))] // unique FSS
      const total = uniqueFSS.length
      const index = uniqueFSS.findIndex((fSS) => cfUI.form_ss === fSS)

      const onNext=()=>{
          const fSS = uniqueFSS[index+1]
            const i = cfUI.form_ss.indexOf(":")
          const string = fSS.slice(i+1, i+2)
          const form =  fSS.slice(0, i)

          // get all inversion for the form:ss and 
          // set the chord form to the one closes to the old position
          const arr = cfUI.chord.getChordforms({form:form, string:string, root:cfUI.root})
          const closest = {dist: 100, cf: null}
          for (let cf of arr) {
            const diff = Math.abs(cf.position - oldPos)
            if( diff < closest.dist){
                closest.dist = diff
                closest.cf = cf
                }
              } // for
          // const nextCF = cfUI.chord.getChordform({ inversion:cfUI.inversion, form:form, string:string, root:cfUI.root } )
          setCFUI(closest.cf)
          setCFChanged(closest.cf.id)
      }

      const onPrev=()=>{
          const fSS = uniqueFSS[index-1]
          const i = cfUI.form_ss.indexOf(":")
          const string = fSS.slice(i+1, i+2)
          const form =  fSS.slice(0, i)

          // get all inversion for the form:ss and 
          // set the chord form to the one closes to the old position
          const arr = cfUI.chord.getChordforms({form:form, string:string, root:cfUI.root})
          const closest = {dist: 100, cf: null}
          for (let cf of arr) {
            const diff = Math.abs(cf.position - oldPos)
            if( diff < closest.dist){
                closest.dist = diff
                closest.cf = cf
                }
              } // for
          // const nextCF = cfUI.chord.getChordform({ inversion:cfUI.inversion, form:form, string:string, root:cfUI.root } )
          setCFUI(closest.cf)
          setCFChanged(closest.cf.id)
      }

// console.log("Rendering FormSSNavigator");
  return (
     cfUI &&    (
    <div className="formss-nav-widget">
      <div className="middle-row">
        <button
          className="nav-btn"
          disabled={index <= 0}
          onClick={onPrev}
        >
          <i className="fa fa-chevron-up"></i>
        </button>

        <div className="nav-label">
          {cfUI.form_ss}
        </div>

        <button
          className="nav-btn"
          disabled={index >= total - 1}
          onClick={onNext}
        >
          <i className="fa fa-chevron-down"></i>
        </button>
      </div>
    </div>
  ))

}
