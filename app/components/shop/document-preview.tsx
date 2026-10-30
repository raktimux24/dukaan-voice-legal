"use client";
import { useEffect, useRef, useState, useId } from "react";
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
        {t(open ? "documents.close" : "mobile.observations.preview_share", "")}
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
  const { api, t, shop, userId, setNotice } = useShop(),
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
    [retry, setRetry] = useState(0),
    [expanded, setExpanded] = useState(false),
    [viewportWidth, setViewportWidth] = useState(0);
  const panel = useRef<HTMLDivElement>(null), headingId = useId();
  const compact = !!issued;
  useEffect(() => {
    if (!expanded) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const resize = () => setViewportWidth(window.innerWidth);
    resize();window.addEventListener("resize", resize);
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => { document.body.style.overflow = overflow; window.removeEventListener("resize", resize); if(previous?.isConnected)previous.focus(); };
  }, [expanded]);
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
    api.assertSession();
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
  const exportFile = async (kind: "pdf" | "png", share = false) => {
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
        const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
        const file = new File([blob], "samaan-" + model.number.replace(/[^a-zA-Z0-9-]/g, "-") + ".pdf", {type:"application/pdf"});
        check();
        if (share && navigator.canShare?.({files:[file]})) {
          await navigator.share({files:[file]});check();setNotice(tr("documents.shared"));
        } else download(blob, ".pdf");
      }
    } catch (e) {
      if((e as Error)?.name!=="AbortError")setError(e);
    } finally {
      show(page);
      setBusy(false);
    }
  };
  const print = async () => {
    if(busy||!pages)return;setBusy(true);setError(null);
    try {
      check();await frame.current!.contentDocument!.fonts.ready;check();
      // Print CSS exposes every retained sheet without changing the selected screen page.
      frame.current!.contentWindow!.focus();frame.current!.contentWindow!.print();
      setNotice(tr("documents.print_opened"));
    } catch(e){setError(e)}finally{setBusy(false)}
  };

  const paperScale = expanded ? Math.min(1, Math.max(200,viewportWidth-80)/paper.width) : compact ? Math.min(scale,210/paper.height) : scale;
  const pageControls = pages > 1 ? <div className="flex flex-wrap items-center justify-between gap-2">
    <Button tone="ghost" disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}>{tr("documents.previous")}</Button>
    <p aria-live="polite" className="text-sm">{tr("documents.page_label",{page:page+1,pages})}</p>
    <Button tone="ghost" disabled={busy||page===pages-1} onClick={()=>setPage(p=>p+1)}>{tr("documents.next")}</Button>
  </div> : null;
  const canShare = typeof navigator!=="undefined" && !!navigator.share && !!navigator.canShare;
  return (
    <div className="grid min-w-0 gap-4 document-preview" ref={container}>
      <p className="text-sm text-muted">{tr(model.sample?"documents.sample_help":"documents.original_caption")}</p>
      {error?<div role="alert" className="grid gap-2"><p className="text-danger">{tr(documentErrorKey(error))}</p><Button tone="ghost" onClick={()=>setRetry(n=>n+1)}>{tr("common.retry")}</Button></div>:null}
      {!pages&&!error?<Spinner label={tr("documents.rendering")}/>:null}
      {pages?<div className="document-actions">
        <Button disabled={busy} onClick={()=>void exportFile("pdf",canShare)}>{tr(canShare?"documents.share_pdf":"documents.download_pdf")}</Button>
        {canShare?<Button tone="ghost" disabled={busy} onClick={()=>void exportFile("pdf")}>{tr("documents.download_pdf")}</Button>:null}
        <Button tone="ghost" disabled={busy} onClick={()=>void print()}>{tr("documents.print")}</Button>
        <Button tone="ghost" disabled={busy} onClick={()=>void exportFile("png")}>{tr("documents.download_png")}</Button>
      </div>:null}
      {html?<div ref={panel} className={"document-paper-panel"+(expanded?" is-expanded":"")} role={expanded?"dialog":undefined} aria-modal={expanded||undefined} aria-labelledby={expanded?headingId:undefined} onKeyDown={event=>{
        if(!expanded)return;
        if(event.key==="Escape"){event.preventDefault();event.stopPropagation();setExpanded(false)}
        if(event.key==="Tab"){
          const buttons=Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])')??[]);
          const first=buttons[0],last=buttons[buttons.length-1];
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
        }
      }}>
        <div className="document-paper-heading"><h2 id={headingId} className="shop-section-title">{tr("mobile.observations.print_preview")}</h2>{expanded?<Button tone="ghost" onClick={()=>setExpanded(false)}>{tr("common.close")}</Button>:null}</div>
        <div className="document-paper-scroll"><div style={{height:paper.height*paperScale,width:paper.width*paperScale,overflow:"hidden",maxWidth:"100%",margin:"0 auto"}}>
          <iframe ref={frame} title={tr("documents.preview_title")} tabIndex={-1} srcDoc={html} sandbox="allow-scripts allow-same-origin allow-modals" onLoad={()=>void ready()} style={{width:paper.width,height:paper.height,border:0,transform:`scale(${paperScale})`,transformOrigin:"top left",background:"white"}}/>
        </div></div>
        {pageControls}
        {compact&&!expanded?<Button tone="ghost" disabled={busy||!pages} onClick={()=>setExpanded(true)}>{tr("mobile.observations.full_preview")}</Button>:null}
      </div>:null}
    </div>
  );
}
