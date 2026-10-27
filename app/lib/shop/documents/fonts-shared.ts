import {
  DOCUMENT_FONT_SET,
  type DocumentContextView,
  type PrintableDocument,
} from "./contract";
export const fontRanges: Record<string, string> = {
  notosans: "U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF",
  notosansdevanagari: "U+0900-097F,U+A8E0-A8FF",
  notosansbengali: "U+0980-09FF",
  notosansgujarati: "U+0A80-0AFF",
  notosanskannada: "U+0C80-0CFF",
  notosansmalayalam: "U+0D00-0D7F",
  notosanstamil: "U+0B80-0BFF",
  notosanstelugu: "U+0C00-0C7F",
};
export function documentFonts(
  model: PrintableDocument,
  context: DocumentContextView,
) {
  if (context.payload.fontSet !== DOCUMENT_FONT_SET)
    throw Error("document_update");
  const text = JSON.stringify([model, context.payload]);
  const scripts: Record<string, RegExp> = {
    notosansdevanagari: /[\u0900-\u097f]/,
    notosansbengali: /[\u0980-\u09ff]/,
    notosansgujarati: /[\u0a80-\u0aff]/,
    notosanskannada: /[\u0c80-\u0cff]/,
    notosansmalayalam: /[\u0d00-\u0d7f]/,
    notosanstamil: /[\u0b80-\u0bff]/,
    notosanstelugu: /[\u0c00-\u0c7f]/,
  };
  return [
    "notosans",
    ...Object.keys(scripts).filter((k) => scripts[k].test(text)),
  ];
}
export const documentFontFace = (id: string, data: string) =>
  `@font-face{font-family:'${id === "notosans" ? "DocumentSans" : "DocumentIndic"}';src:url(data:font/ttf;base64,${data}) format('truetype');font-style:normal;font-weight:100 900;font-display:block;unicode-range:${fontRanges[id]}}`;
