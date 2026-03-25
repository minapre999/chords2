import React from "react";
import "./chord-navigation.css"
import  ChordForm, {HarmonyManager, Chord}  from "../../harmony/harmony-manager.js"


export default function FormSSNavigator({
cfUI,
setCFUI

}) {

        if( cfUI == null) return null

        const uniqueFSS =   [...new Set(dc.HARMONY_MANAGER.chordforms.map(cf=>{return cf.form_ss}))] // unique FSS
        const total = uniqueFSS.length
        const index = uniqueFSS.findIndex((fSS) => cfUI.form_ss === fSS)

         const onNext=()=>{
            const fSS = uniqueFSS[index+1]
             const i = cfUI.form_ss.indexOf(":")
            const string = fSS.slice(i+1, i+2)
            const form =  fSS.slice(0, i)

            const nextCF = cfUI.chord.getChordform({ inversion:cfUI.inversion, form:form, string:string, root:cfUI.root } )
            setCFUI(nextCF)
        }

        const onPrev=()=>{
            const fSS = uniqueFSS[index-1]
            const i = cfUI.form_ss.indexOf(":")
            const string = fSS.slice(i+1, i+2)
            const form =  fSS.slice(0, i)

            const nextCF = cfUI.chord.getChordform({ inversion:cfUI.inversion, form:form, string:string, root:cfUI.root } )
            setCFUI(nextCF)
        }

console.log("Rendering FormSSNavigator");
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
