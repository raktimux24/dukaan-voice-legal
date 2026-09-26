'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCart } from '../../lib/shop/cart';
import { formatINR } from '../../lib/shop/money';
import { normalizeIndianMobile } from '../../lib/shop/phone';
import { useShop } from './context';
import { Button, Field, inputClass } from './ui';

export function CustomerAttach() {
  const { api, shop, userId, premium, perms, t } = useShop();
  const cartApi = useCart(userId, shop?.id ?? null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const customers = useQuery({
    queryKey: ['customer-search', shop?.id, q],
    enabled: !!shop?.id && premium && perms.canManageCustomers && q.trim().length > 1,
    queryFn: () => api.getCustomers(shop!.id, { q: q.trim(), limit: 8 }),
  });

  if (!shop || !userId) return null;
  const cart = cartApi.cart;
  const attached = !!(cart.customerId || cart.customerName);

  const clear = () => {
    cartApi.patch({ customerId: null, customerName: null, customerPhone: null, customerClientId: null });
  };

  const saveNew = () => {
    const normalized = phone.trim() ? normalizeIndianMobile(phone) : null;
    if (normalized === 'invalid') {
      setPhoneError('Enter a valid Indian mobile number.');
      return;
    }
    if (!name.trim()) return;
    cartApi.patch({
      customerId: null,
      customerName: name.trim(),
      customerPhone: normalized,
      customerClientId: cart.customerClientId ?? crypto.randomUUID(),
    });
    setOpen(false);
    setPhoneError(null);
  };

  return (
    <div className="customer-attach">
      {attached ? (
        <div className="shop-toggle">
          <span>
            {cart.customerName}
            {cart.customerPhone ? <span className="text-muted"> · {cart.customerPhone}</span> : null}
          </span>
          <button type="button" className="text-sm text-saffron" onClick={clear}>
            Remove
          </button>
        </div>
      ) : (
        <button type="button" className="customer-add" onClick={() => setOpen((value) => !value)}>
          {t('checkout.add_customer', 'Add customer')}
        </button>
      )}
      {open && !attached ? (
        <div className="stack-form">
          {premium && perms.canManageCustomers ? (
            <>
              <Field label="Find a customer">
                <input className={inputClass} placeholder="Name or phone" value={q} onChange={(event) => setQ(event.target.value)} />
              </Field>
              {(customers.data?.customers ?? []).length > 0 ? (
                <div className="shop-list">
                  {customers.data?.customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="shop-list-row"
                      onClick={() => {
                        cartApi.patch({
                          customerId: customer.id,
                          customerName: customer.name,
                          customerPhone: customer.phone,
                          customerClientId: null,
                        });
                        setOpen(false);
                      }}
                    >
                      <span className="shop-list-main">
                        <span className="shop-list-title">{customer.name}</span>
                        {customer.phone ? <span className="shop-list-meta">{customer.phone}</span> : null}
                      </span>
                      <span className="num text-sm text-muted">{formatINR(customer.balance)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          <div className="form-grid is-2">
            <Field label="New customer">
              <input className={inputClass} placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={inputClass} inputMode="tel" placeholder="10-digit mobile" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </Field>
          </div>
          {phoneError ? <p className="text-sm text-danger">{phoneError}</p> : null}
          <Button type="button" disabled={!name.trim()} onClick={saveNew}>Use this customer</Button>
        </div>
      ) : null}
    </div>
  );
}
