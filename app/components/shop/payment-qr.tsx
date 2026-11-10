'use client';
import { useEffect, useState } from 'react';
import { checkoutUpiUri } from '../../lib/shop/checkout';
import { validVpa } from '../../lib/shop/payments/form';
import { useShop } from './context';
import { Glyph } from './ui';
export function PaymentQr({ vpa, payee, image }: { vpa: string; payee: string; image: string | null }) {
  const { t } = useShop();
  const uri = vpa.trim() && validVpa(vpa) ? checkoutUpiUri(vpa.trim().toLowerCase(), payee, 1, true) : '';
  const [qr, setQr] = useState<{uri:string;url:string}|null>(null);
  useEffect(() => { let live = true; if (uri) void import('qrcode').then(q => q.toDataURL(uri, { margin: 2, width: 180 })).then(url => { if (live) setQr({uri,url}); }).catch(() => { if (live) setQr(null); }); return () => { live = false; }; }, [uri]);
  const src = uri ? (qr?.uri === uri ? qr.url : null) : image;
  return <aside className="payments-qr"><div className="payments-qr-art">{src ? <img src={src} alt={t('payweb.qr_alt', 'UPI QR preview')}/> : <Glyph name="qr"/>}</div><div><h3>{uri ? t('payweb.qr_preview', 'QR preview · ₹1') : t('payweb.qr_alt', 'UPI QR preview')}</h3><p>{uri ? t('pos_settings.dynamic_ready', 'Amount-prefilled QR ready') : image ? t('pos_settings.static_only', 'Image saved. Enter your UPI ID to enable amount-prefilled QR codes.') : t('pos_settings.not_set', 'No UPI set up yet.')}</p><small>{t('payweb.preview_note', 'Preview only. Customers pay the bill amount at checkout.')}</small></div></aside>;
}
