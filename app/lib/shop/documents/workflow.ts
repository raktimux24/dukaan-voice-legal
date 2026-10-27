import {publishBrandingPos} from './pos-cache';
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultBranding, type BrandingDraft } from "./contract";
import type { DocumentsApi, BrandingSave } from "./client";
export function useBranding(
  api: DocumentsApi,
  scope: string,
  shopId: string,
  allowed: boolean,
  language: string,
  id: () => string,
) {
  const cache = useQueryClient(),
    current = useRef(scope);
  current.current = scope;
  const [draft, setDraft] = useState<BrandingDraft>(defaultBranding(language)),
    [images, setImages] = useState<Record<string, string>>({}),
    [dirty, setDirty] = useState(false),
    [pending, setPending] = useState<BrandingSave | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [saved, setSaved] = useState(""),
    [preview, setPreview] = useState<Awaited<
      ReturnType<DocumentsApi["preview"]>
    > | null>(null);
  const running = useRef(false);
  const meta = useQuery({
    queryKey: ["documentBranding", shopId, scope],
    enabled: !!shopId && allowed,
    queryFn: () => api.get(shopId),
    retry: false,
    networkMode: "always",
  });
  useEffect(() => {
    if (!dirty && meta.data) {
      setDraft(meta.data.current?.draft ?? defaultBranding(language));
      setImages(meta.data.previews ?? {});
    }
  }, [meta.data, dirty, language]);
  useEffect(
    () => () => {
      if (current.current === scope) current.current = "";
    },
    [scope],
  );
  const run = async <T>(work: () => Promise<T>, done: (v: T) => void | Promise<void>) => {
    if (running.current || current.current!==scope) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const value = await work();
      if (current.current === scope) await done(value);
    } catch (e) {
      if (current.current === scope) setError(e);
    } finally {
      running.current = false;
      if (current.current === scope) setBusy(false);
    }
  };
  const edit = (value: Partial<BrandingDraft>) => {
    if (busy || pending) return;
    setDraft((d) => ({ ...d, ...value }));
    setDirty(true);
    setSaved("");
    setPreview(null);
  };
  const save = () => {
    const request = pending ?? {
      clientId: id(),
      expectedVersion: meta.data?.current?.id ?? null,
      draft: structuredClone(draft),
    };
    setPending(request);
    return run(
      () => api.save(shopId, request),
      async(result) => {
        if(!await publishBrandingPos(cache,shopId,scope,result.context,()=>current.current===scope))return;
        setPending(null);
        setDirty(false);
        cache.setQueryData(["documentBranding", shopId, scope], result);
        setDraft(result.current?.draft ?? draft);
        setImages(result.previews ?? {});
        setSaved(
          result.current?.id === result.savedVersion
            ? "documents.saved"
            : "documents.saved_earlier",
        );
      },
    );
  };
  return {
    meta,
    draft,
    images,
    busy,
    pending,
    error,
    saved,
    preview,
    setPreview,
    edit,
    save,
    reload: () =>
      run(
        () => api.get(shopId),
        (result) => {
          setPending(null);
          setDirty(false);
          setSaved("");
          cache.setQueryData(["documentBranding", shopId, scope], result);
          setDraft(result.current?.draft ?? defaultBranding(language));
          setImages(result.previews ?? {});
        },
      ),
    upload: (kind: "logo" | "signature", base64: string) =>
      run(
        () => api.upload(shopId, kind, base64),
        (a) => {
          setImages((v) => ({ ...v, [a.id]: a.dataUrl }));
          edit({ [kind === "logo" ? "logoId" : "signatureId"]: a.id });
        },
      ),
    sample: (count: number) =>
      run(() => api.preview(shopId, draft, count), setPreview),
    setError,
  };
}
