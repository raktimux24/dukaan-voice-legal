'use client';

import { useQuery } from '@tanstack/react-query';
import { useId, useMemo, useRef, useState } from 'react';
import { useShop } from './context';
import { Field, inputClass } from './ui';

export function SupplierField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { api, shop, t } = useShop();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const suppliers = useQuery({
    queryKey: ['suppliers', shop?.id, 'picker'],
    enabled: !!shop,
    queryFn: () => api.getSuppliers(shop!.id),
  });

  const matches = useMemo(() => {
    const all = suppliers.data?.suppliers ?? [];
    const query = value.trim().toLowerCase();
    const list = query ? all.filter((row) => row.name.toLowerCase().includes(query)) : all;
    const exact = query && all.some((row) => row.name.toLowerCase() === query);
    return exact ? [] : list.slice(0, 8);
  }, [suppliers.data, value]);

  const showList = open && matches.length > 0;

  return (
    <Field label={t('modal.add_product.supplier_label', 'Supplier')}>
      <div className="supplier-field">
        <input
          className={inputClass}
          value={value}
          placeholder={t('modal.add_product.supplier_placeholder', 'e.g. Krishna Traders')}
          autoComplete="off"
          ref={inputRef}
          aria-expanded={showList}
          aria-controls={listId}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
        />
        <button
          className="supplier-toggle"
          type="button"
          aria-label={t('modal.add_product.supplier_label', 'Supplier')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setOpen((current) => {
              if (!current) inputRef.current?.focus();
              return !current;
            });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showList ? (
          <ul className="supplier-menu" id={listId} role="listbox">
            {matches.map((row) => (
              <li key={row.name}>
                <button
                  type="button"
                  role="option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(row.name);
                    setOpen(false);
                  }}
                >
                  <span>{row.name}</span>
                  <span>{t('supplier.used_n', '{{n}} batches', { n: row.batches })}</span>
                </button>
              </li>
            ))}
            {value.trim() ? (
              <li className="supplier-new">{t('supplier.use_new', 'Or keep "{{name}}" as a new supplier', { name: value.trim() })}</li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
