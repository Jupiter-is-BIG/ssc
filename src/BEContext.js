import React, { createContext } from "react";
import BE from './BE/logic';

export const BEContext = createContext();

export const BEProvider = ({ children }) => {
  const beInstance = BE.getInstance();

  return (
    <BEContext.Provider value={beInstance}>
      {children}
    </BEContext.Provider>
  );
};