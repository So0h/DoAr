import React, { createContext, useRef, useContext } from "react";
const CanvasContext = createContext();

export function CanvasProvider({ children }) {
  const canvasRef = useRef(null);
  const captureCanvas = () => canvasRef.current?.toDataURL("image/png");
  return (
    <CanvasContext.Provider value={{ canvasRef, captureCanvas }}>
      {children}
    </CanvasContext.Provider>
  );
}
export function useCanvas() { return useContext(CanvasContext); }
