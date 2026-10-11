import { createContext, useContext } from "react";

export const FontScaleContext = createContext<number>(1);
export const useFontScale = () => useContext(FontScaleContext);

export const FONT_SCALE_OPTIONS = [
  { value: 1, label: "A", title: { en: "Normal", es: "Normal" } },
  { value: 1.15, label: "A", title: { en: "Large", es: "Grande" } },
  { value: 1.3, label: "A", title: { en: "Extra large", es: "Extra grande" } },
] as const;

export type FontScaleLevel = 0 | 1 | 2;