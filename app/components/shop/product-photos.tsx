'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ProductGallery, ProductImageRef } from '../../lib/shop/product-images';
import { useShop } from './context';
import { Button, Card } from './ui';

const MAX_PHOTOS = 5;
const MAX_BYTES = 8 * 1024 * 1024;

export function useProductCovers(productIds: string[]) {
  const { api, shop } = useShop();
  const ids = productIds.slice(0, 100);
  return useQuery({
    queryKey: ['product-covers', shop?.id, ids.join(',')],
    enabled: !!shop && ids.length > 0,
    staleTime: 4 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const { media } = await api.images.query(shop!.id, ids);
      const covers = Object.entries(media).flatMap(([productId, row]) => (row.cover ? [[productId, row.cover.id] as const] : []));
      if (!covers.length) return {} as Record<string, string>;
      const { leases } = await api.images.leases(shop!.id, covers.map(([, imageId]) => imageId));
      const urls: Record<string, string> = {};
      for (const [productId, imageId] of covers) {
        const lease = leases[imageId];
        if (lease) urls[productId] = api.images.mediaUrl(imageId, 'thumb', lease);
      }
      return urls;
    },
  });
}

function Photo({ image, name, variant, large }: { image: ProductImageRef; name: string; variant: 'thumb' | 'card'; large?: boolean }) {
  const { api, shop } = useShop();
  const leased = useQuery({
    queryKey: ['product-image', shop?.id, image.id, image.version, variant],
    enabled: !!shop,
    staleTime: 4 * 60 * 1000,
    refetchInterval: 4 * 60 * 1000,
    queryFn: async () => {
      const { leases } = await api.images.leases(shop!.id, [image.id]);
      const lease = leases[image.id];
      if (!lease) throw new Error('photo_unavailable');
      return api.images.mediaUrl(image.id, variant, lease);
    },
  });
  if (!leased.data) return <span className={large ? 'product-photo is-large' : 'product-photo'} aria-hidden="true" />;
  return <img className={large ? 'product-photo is-large' : 'product-photo'} src={leased.data} alt={image.alt || name} />;
}

export function ProductGalleryView({ productId, name }: { productId: string; name: string }) {
  const { api, shop, perms, t } = useShop();
  const gallery = useQuery({
    queryKey: ['product-gallery', shop?.id, productId],
    enabled: !!shop,
    retry: false,
    queryFn: () => api.images.gallery(shop!.id, productId),
  });
  const images = gallery.data?.images ?? [];
  if (gallery.isError || (!gallery.isLoading && images.length === 0 && !perms.canEditProducts)) return null;
  return (
    <Card>
      <h2 className="shop-section-title">{t('product_images.title', 'Photos')}</h2>
      {images.length === 0 ? <p className="shop-section-sub">{t('product_images.empty', 'No photo yet. Add one from Edit details.')}</p> : (
        <div className="product-gallery">
          {images.map((image, index) => <Photo key={image.id} image={image} name={name} variant={index === 0 ? 'card' : 'thumb'} large={index === 0} />)}
        </div>
      )}
    </Card>
  );
}

type Staged = { id: string; alt: string; preview: string };

export type PhotoEditorHandle = {
  dirty: boolean;
  save: (productId: string) => Promise<void>;
  reset: () => void;
};

export const ProductPhotoEditor = forwardRef<PhotoEditorHandle, { productId?: string; name: string; onDirty: (dirty: boolean) => void }>(function ProductPhotoEditor({ productId, name, onDirty }, ref) {
  const { api, shop, t } = useShop();
  const queryClient = useQueryClient();
  const gallery = useQuery({
    queryKey: ['product-gallery', shop?.id, productId],
    enabled: !!shop && !!productId,
    retry: false,
    queryFn: () => api.images.gallery(shop!.id, productId!),
  });
  const caps = useQuery({
    queryKey: ['product-image-caps', shop?.id],
    enabled: !!shop,
    retry: false,
    queryFn: () => api.images.capabilities(shop!.id),
  });
  const [added, setAdded] = useState<Staged[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const saved = (gallery.data?.images ?? []).filter((image) => !removed.includes(image.id));
  const shown = [...saved.map((image) => ({ id: image.id, alt: image.alt, preview: '' })), ...added];
  const dirty = added.length > 0 || removed.length > 0;
  const canEdit = caps.data?.canEdit !== false && caps.data?.available !== false;

  const mark = (nextAdded: Staged[], nextRemoved: string[]) => {
    setAdded(nextAdded);
    setRemoved(nextRemoved);
    onDirty(nextAdded.length > 0 || nextRemoved.length > 0);
  };

  useImperativeHandle(ref, () => ({
    dirty,
    reset: () => {
      for (const row of added) URL.revokeObjectURL(row.preview);
      setAdded([]);
      setRemoved([]);
      setDraftId(null);
      onDirty(false);
    },
    save: async (targetId: string) => {
      if (!shop || !dirty) return;
      const version = targetId === productId ? (gallery.data?.version ?? 0) : 0;
      const alt = (name.trim() || 'Product').slice(0, 240);
      const savedGallery: ProductGallery = await api.images.save(shop.id, targetId, {
        clientId: crypto.randomUUID(),
        expectedVersion: version,
        ...(draftId ? { draftId } : {}),
        images: shown.map((image) => ({ id: image.id, alt: image.alt || alt })),
      });
      queryClient.setQueryData(['product-gallery', shop.id, targetId], savedGallery);
      for (const row of added) URL.revokeObjectURL(row.preview);
      setAdded([]);
      setRemoved([]);
      setDraftId(null);
      onDirty(false);
    },
  }), [added, api, dirty, draftId, gallery.data?.version, name, onDirty, productId, queryClient, removed, shop, shown]);

  const pick = async (list: FileList | null) => {
    if (!shop || !list?.length) return;
    setError(null);
    const room = MAX_PHOTOS - shown.length;
    const files = [...list].slice(0, room);
    if (!files.length) {
      setError(t('product_images.limit', 'A product can have up to 5 photos.'));
      return;
    }
    setBusy(true);
    try {
      let draft = draftId;
      if (!draft) {
        const created = await api.images.draft(shop.id, crypto.randomUUID());
        draft = created.id;
        setDraftId(draft);
      }
      const next = [...added];
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_BYTES) {
          setError(t('product_images.file', 'Use a JPEG, PNG, or WebP under 8 MB.'));
          continue;
        }
        const uploaded = await api.images.upload(shop.id, draft, crypto.randomUUID(), file);
        next.push({ id: uploaded.image.id, alt: (name.trim() || file.name).slice(0, 240), preview: URL.createObjectURL(file) });
      }
      mark(next, removed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('product_images.failed', 'The photo could not be saved.'));
    } finally {
      setBusy(false);
    }
  };

  if (caps.data?.available === false) return null;
  return (
    <Card className="grid gap-3">
      <div>
        <h2 className="shop-section-title">{t('product_images.title', 'Photos')}</h2>
        <p className="shop-section-sub">{t('product_images.help', 'The first photo is the one shown in the product list.')}</p>
      </div>
      {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
      <div className="product-gallery">
        {shown.map((image) => (
          <div key={image.id} className="product-photo-slot">
            {image.preview ? <img className="product-photo" src={image.preview} alt={image.alt || name} /> : <Photo image={{ id: image.id, version: '', width: 0, height: 0, alt: image.alt }} name={name} variant="thumb" />}
            {canEdit ? <button type="button" className="product-photo-remove" onClick={() => {
              if (added.some((row) => row.id === image.id)) {
                const row = added.find((item) => item.id === image.id);
                if (row) URL.revokeObjectURL(row.preview);
                mark(added.filter((item) => item.id !== image.id), removed);
              } else mark(added, [...removed, image.id]);
            }}>{t('common.remove', 'Remove')}</button> : null}
          </div>
        ))}
      </div>
      {canEdit && shown.length < MAX_PHOTOS ? (
        <label className="button button-ghost">
          {busy ? t('common.loading', 'Loading') : t('product_images.add', 'Add photo')}
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={(event) => { void pick(event.target.files); event.target.value = ''; }} />
        </label>
      ) : null}
    </Card>
  );
});
