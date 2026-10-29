import {
  documentCanonical,
  type DocumentContextView,
  type IssuedDocument,
} from "./contract";
export async function verifyDocumentPresentation(
  context: DocumentContextView,
  issued: IssuedDocument | undefined,
  sha: (text: string) => Promise<string>,
) {
  if (
    !context ||
    context.ref.version !== 1 ||
    context.payload.version !== 1 ||
    (await sha(documentCanonical(context.payload))) !== context.ref.hash
  )
    throw Error("document_integrity");
  if (
    issued &&
    (issued.version !== 1 ||
      issued.context.id !== context.ref.id ||
      issued.context.hash !== context.ref.hash ||
      (await sha(
        documentCanonical({ context: issued.context, model: issued.model }),
      )) !== issued.hash)
  )
    throw Error("document_integrity");
  for (const hash of [context.payload.logoHash, context.payload.signatureHash])
    if (
      hash &&
      (!context.assets[hash] ||
        (await sha(documentCanonical(context.assets[hash]))) !== hash)
    )
      throw Error("document_integrity");
}
