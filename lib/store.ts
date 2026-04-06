import { create } from "zustand";

type FiltersState = {
  view: "ALL" | "INCOME" | "EXPENSE";
  setView: (view: "ALL" | "INCOME" | "EXPENSE") => void;
};

export const useTransactionFilter = create<FiltersState>((set) => ({
  view: "ALL",
  setView: (view) => set({ view }),
}));

