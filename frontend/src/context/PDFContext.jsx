import { createContext, useContext, useMemo, useState } from "react";

const PDFContext = createContext(null);

export function PDFProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const value = useMemo(() => ({ documents, setDocuments, selected, setSelected }), [documents, selected]);
  return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
}

export function usePDFContext() {
  const context = useContext(PDFContext);
  if (!context) throw new Error("usePDFContext must be used inside PDFProvider");
  return context;
}
