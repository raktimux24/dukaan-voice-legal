type Send = <T>(path: string, init?: RequestInit) => Promise<T>;

export type ProductImageRef = { id: string; version: string; width: number; height: number; alt: string };
export type ProductMedia = { cover: ProductImageRef | null; count: number; version: number };
export type ProductGallery = ProductMedia & { images: ProductImageRef[] };

const base = (shop: string) => `/api/shops/${encodeURIComponent(shop)}/product-images`;
const apiBase = () => process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

export function bindProductImages(send: Send) {
  const json = <T>(path: string, method: string, body: unknown) =>
    send<T>(path, { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  return {
    capabilities: (shop: string) =>
      send<{ available: boolean; canEdit: boolean; limits: { count: number; inputBytes: number } }>(base(shop)),
    draft: (shop: string, clientId: string) =>
      json<{ id: string; expiresAt: string }>(`${base(shop)}/drafts`, 'POST', { clientId }),
    gallery: (shop: string, product: string) =>
      send<ProductGallery>(`${base(shop)}/products/${encodeURIComponent(product)}`),
    save: (shop: string, product: string, input: { clientId: string; expectedVersion: number; draftId?: string; images: { id: string; alt: string }[] }) =>
      json<ProductGallery>(`${base(shop)}/products/${encodeURIComponent(product)}`, 'PUT', input),
    query: (shop: string, productIds: string[]) =>
      json<{ media: Record<string, ProductMedia> }>(`${base(shop)}/query`, 'POST', { productIds }),
    leases: (shop: string, imageIds: string[]) =>
      json<{ leases: Record<string, string>; expiresAt: string }>(`${base(shop)}/leases`, 'POST', { imageIds }),
    upload: (shop: string, draft: string, client: string, bytes: Blob) =>
      send<{ state: string; image: ProductImageRef }>(`${base(shop)}/drafts/${encodeURIComponent(draft)}/images/${encodeURIComponent(client)}`, {
        method: 'PUT',
        body: bytes,
        headers: { 'Content-Type': bytes.type || 'application/octet-stream' },
      }),
    mediaUrl: (image: string, variant: 'thumb' | 'card' | 'detail', lease: string) =>
      `${apiBase()}/media/private/${encodeURIComponent(image)}/${variant}?lease=${encodeURIComponent(lease)}`,
  };
}
