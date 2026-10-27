"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { PDFDocument } from "pdf-lib";
import { documentHtml } from "../../lib/shop/documents/render";
import { documentFontCss } from "../../lib/shop/documents/fonts";
import { verifyDocumentPresentation } from "../../lib/shop/documents/integrity";
import { documentErrorKey } from "../../lib/shop/documents/client";
import {
  documentPaper,
  type DocumentContextView,
  type PrintableDocument,
  type IssuedDocument,
} from "../../lib/shop/documents/contract";
import { useShop } from "./context";
import { Button, Spinner } from "./ui";
const sha = async (text: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
export function IssuedDocumentButton({ issued }: { issued: IssuedDocument }) {
  const { api, shop, userId, t } = useShop(),
    [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: ["documentContext", shop?.id, userId, issued.context.id],
    enabled: open && !!shop,
    queryFn: () => api.documents.context(shop!.id, issued.context.id),
    retry: false,
  });
  return (
    <div className="grid gap-4">
      <Button tone="ghost" onClick={() => setOpen((v) => !v)}>
        {t(open ? "documents.close" : "documents.open", "")}
      </Button>
      {open && q.isPending ? <Spinner /> : null}
      {open && q.error ? (
        <p role="alert" className="text-danger">
          {t(documentErrorKey(q.error), "")}
        </p>
      ) : null}
      {open && q.data ? (
        <DocumentPreview
          context={q.data}
          model={issued.model}
          issued={issued}
        />
      ) : null}
    </div>
  );
}
export function DocumentPreview({
  context,
  model,
  issued,
}: {
  context: DocumentContextView;
  model: PrintableDocument;
  issued?: IssuedDocument;
}) {
  const { t, shop, userId, setNotice } = useShop(),
    tr = (k: string, v?: Record<string, string | number>) => t(k, k, v),
    frame = useRef<HTMLIFrameElement>(null),
    container = useRef<HTMLDivElement>(null),
    scope = shop?.id + ":" + userId,
    current = useRef(scope);
  current.current = scope;
  const [html, setHtml] = useState(""),
    [fonts, setFonts] = useState(""),
    [error, setError] = useState<unknown>(null),
    [pages, setPages] = useState(0),
    [page, setPage] = useState(0),
    [busy, setBusy] = useState(false),
    [scale, setScale] = useState(1),
    [retry, setRetry] = useState(0);
  const paper = documentPaper(context.payload.config.layout);
  useEffect(() => {
    const observer = new ResizeObserver((rows) =>
      setScale(Math.min(1, rows[0].contentRect.width / paper.width)),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, [paper.width]);
  useEffect(() => {
    let active = true;
    setHtml("");
    setError(null);
    setPages(0);
    setPage(0);
    void (async () => {
      await verifyDocumentPresentation(context, issued, sha);
      const css = await documentFontCss(model, context);
      if (active) {
        setFonts(css);
        setHtml(documentHtml(model, context, css));
      }
    })().catch((e) => {
      if (active) setError(e);
    });
    return () => {
      active = false;
    };
  }, [context, model, issued, retry]);
  const sheets = () =>
    Array.from(
      frame.current?.contentDocument?.querySelectorAll<HTMLElement>(
        ".doc-sheet",
      ) ?? [],
    );
  const show = (index: number) =>
    sheets().forEach((el, i) => {
      el.style.display = i === index ? "flow-root" : "none";
    });
  useEffect(() => {
    show(page);
  }, [page, pages]);
  const ready = async () => {
    try {
      const win = frame.current?.contentWindow as
        | (Window & {
            __samaanDocumentReady?: Promise<{
              lineIds: string[];
              pages: string[];
            }>;
          })
        | null;
      if (!win?.__samaanDocumentReady) throw Error("document_render");
      const result = await Promise.race([
        win.__samaanDocumentReady,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(Error("document_render")), 20_000),
        ),
      ]);
      if (scope !== current.current) throw Error("document_scope");
      if (
        result.lineIds.join("|") !== model.items.map((i) => i.id).join("|") ||
        result.pages.length > 100
      )
        throw Error("document_integrity");
      setPages(result.pages.length);
    } catch (e) {
      setError(e);
    }
  };
  const check = () => {
    if (scope !== current.current || !frame.current?.isConnected)
      throw Error("document_scope");
  };
  const download = (blob: Blob, suffix: string) => {
    check();
    const url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download =
      "samaan-" + model.number.replace(/[^a-zA-Z0-9-]/g, "-") + suffix;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setNotice(tr("documents.downloaded"));
  };
  const png = async (index: number) => {
    check();
    show(index);
    const node = sheets()[index];
    if (!node) throw Error("document_render");
    const result = await toPng(node, {
      width: paper.width,
      height: paper.height,
      pixelRatio: 2,
      backgroundColor: "#fff",
      fontEmbedCSS: fonts,
      skipFonts: true,
      cacheBust: false,
    });
    check();
    return result;
  };
  const exportFile = async (kind: "pdf" | "png") => {
    if (busy || !pages) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "png") {
        const data = await png(page);
        download(await (await fetch(data)).blob(), "-" + (page + 1) + ".png");
      } else {
        const pdf = await PDFDocument.create();
        for (let i = 0; i < pages; i++) {
          const image = await pdf.embedPng(await png(i));
          pdf
            .addPage([
              (paper.widthMm * 72) / 25.4,
              (paper.heightMm * 72) / 25.4,
            ])
            .drawImage(image, {
              x: 0,
              y: 0,
              width: (paper.widthMm * 72) / 25.4,
              height: (paper.heightMm * 72) / 25.4,
            });
        }
        const bytes = await pdf.save();
        download(
          new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          ".pdf",
        );
      }
    } catch (e) {
      setError(e);
    } finally {
      show(page);
      setBusy(false);
    }
  };
  const print = () => {
    try {
      check();
      sheets().forEach((el) => (el.style.display = "flow-root"));
      frame.current!.contentWindow!.focus();
      frame.current!.contentWindow!.print();
      show(page);
      setNotice(tr("documents.print_opened"));
    } catch (e) {
      setError(e);
    }
  };
  return (
    <div className="grid min-w-0 gap-4" ref={container}>
      <p className="text-sm text-muted">
        {tr(
          model.sample ? "documents.sample_help" : "documents.original_caption",
        )}
      </p>
      {error ? (
        <div role="alert" className="grid gap-2">
          <p className="text-danger">{tr(documentErrorKey(error))}</p>
          <Button tone="ghost" onClick={() => setRetry((n) => n + 1)}>
            {tr("common.retry")}
          </Button>
        </div>
      ) : null}
      {!pages && !error ? <Spinner label={tr("documents.rendering")} /> : null}
      {html ? (
        <div
          style={{
            height: paper.height * scale,
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          <iframe
            ref={frame}
            title={tr("documents.preview_title")}
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin allow-modals"
            onLoad={() => void ready()}
            style={{
              width: paper.width,
              height: paper.height,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              background: "white",
            }}
          />
        </div>
      ) : null}
      {pages ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              tone="ghost"
              disabled={busy || page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              {tr("documents.previous")}
            </Button>
            <p aria-live="polite" className="text-sm">
              {tr("documents.page_label", { page: page + 1, pages })}
            </p>
            <Button
              tone="ghost"
              disabled={busy || page === pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              {tr("documents.next")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void exportFile("pdf")}>
              {tr("documents.download_pdf")}
            </Button>
            <Button
              tone="ghost"
              disabled={busy}
              onClick={() => void exportFile("png")}
            >
              {tr("documents.download_png")}
            </Button>
            <Button tone="ghost" disabled={busy} onClick={print}>
              {tr("documents.print")}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
