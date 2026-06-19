import { createContext, useContext, useState, type ReactNode } from "react";
import { type Salon } from "@workspace/api-client-react";

interface CompareContextValue {
  compareList: Salon[];
  addToCompare: (salon: Salon) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Salon[]>([]);

  const addToCompare = (salon: Salon) => {
    setCompareList(prev => {
      if (prev.find(s => s.id === salon.id)) return prev;
      if (prev.length >= 2) return prev;
      return [...prev, salon];
    });
  };

  const removeFromCompare = (id: number) => {
    setCompareList(prev => prev.filter(s => s.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (id: number) => compareList.some(s => s.id === id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
