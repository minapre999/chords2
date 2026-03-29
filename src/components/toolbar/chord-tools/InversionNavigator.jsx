import React from "react";
import "./chord-navigation.css"
import  ChordForm, {HarmonyManager, Chord}  from "/src/harmony/harmony-manager.js"


export default function InversionNavigator({
  cfUI,
  setCFUI,
  cfChanged,
  setCFChanged
  
}) {



    if( cfUI == null) return null
    // if( cfUI == null) { return null}
    // const arr = cfUI.chord.chordforms
    // const total = arr.length
    // const currentIndex = arr.findIndex((cf) => cf.id === cfUI.id)

// console.log("InversionNavigator cfUI: ", cfUI, "cfUI.root: ", cfUI.root)
    let arrInv = cfUI.chord.chordforms.filter((cf=>cf.form_ss == cfUI.form_ss ))
  // strip non-numerics from string in sort
  // need to set root to have a valid position
    arrInv.forEach((cf)=>cf.root = cfUI.root)
    arrInv.sort((a,b)=>a.position - b.position )

// console.log("sorted: ", arrInv.map((cf)=>cf.position))


    const totalInv = arrInv.length
    const invIndex = arrInv.findIndex((cf) => cf.id === cfUI.id)

   const onNext=()=>{
    
    const nextCF = arrInv[invIndex+1]
    // console.log("onNext nextCF: ", nextCF)
    setCFUI(nextCF)
    setCFChanged(nextCF.id)
   }

   const onPrev=()=>{
    const prevCF = arrInv[invIndex-1]
    setCFUI(prevCF)
    setCFChanged(prevCF.id)
   }


// console.log("InversionNavigator arrInv: ", arrInv, "totalInv: ", totalInv, "invIndex: ", invIndex)
  return (
 cfUI && (
    <div className="cf-nav-widget">

      {/* <button className="widget-nav-btn">◀</button>
<button className="widget-nav-btn">▶</button>
 */}

      <button
        className="nav-btn"
        disabled={invIndex <= 0}
        onClick={onPrev}
      >
        <i className="fa fa-chevron-left"></i>
      </button>

      <div className="nav-label cf-nav-label">
        {invIndex + 1} / {totalInv}
      </div>

      <button
        className="nav-btn"
        disabled={invIndex >= totalInv - 1}
        onClick={onNext}
      >
        <i className="fa fa-chevron-right"></i>
      </button>
    </div>
  ))
  
}


