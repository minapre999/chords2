


import { useRef } from "react";


/*
React hooks only work:
    inside a React component
    or inside a custom hook
    during a render phase

Your cursor system is not React-driven.
It’s a DOM-driven overlay.

A ref is just an object with a .current property

So this is functionally identical to const cursorPosRef = useRef({ x: 0, y: 0 });
except:
    it doesn’t require React
    it doesn’t require a component
    it doesn’t trigger renders
    it works anywhere in your codebase
*/


export const cursorPosRef = { current: { x: 0, y: 0,  duration: "q", measure: null } };
export const rafRef = { current: null };
export const cursorMeasureRef = { current: null };
export const cursorOverlayRef = { current: null };
export const cursorLedgersRef = { current: null };
