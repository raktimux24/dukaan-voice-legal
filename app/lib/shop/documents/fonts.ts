import manifest from "../../../../public/fonts/invoice/manifest.json";
import { documentFonts, documentFontFace } from "./fonts-shared";
import type { PrintableDocument, DocumentContextView } from "./contract";
const cache: Record<string, Promise<string>> = {};
export async function documentFontCss(
  model: PrintableDocument,
  context: DocumentContextView,
) {
  return (
    await Promise.all(
      documentFonts(model, context).map(
        (id) =>
          (cache[id] ??= (async () => {
            const response = await fetch("/fonts/invoice/" + id + ".ttf");
            if (!response.ok) throw Error("document_render");
            const bytes = await response.arrayBuffer();
            const hash = Array.from(
              new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
              (b) => b.toString(16).padStart(2, "0"),
            ).join("");
            if (hash !== manifest.fonts.find((f) => f.id === id)?.sha256)
              throw Error("document_integrity");
            let data = "";
            for (const b of new Uint8Array(bytes))
              data += String.fromCharCode(b);
            return documentFontFace(id, btoa(data));
          })()),
      ),
    )
  ).join("");
}
