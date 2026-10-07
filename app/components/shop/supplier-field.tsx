'use client';

import { useQuery } from '@tanstack/react-query';
import { useId, useMemo, useRef, useState } from 'react';
import { useShop } from './context';
import { SupplierEditor } from './gst-supplier';
import { useGstPages } from './gst-workspace';
import { Section } from './gst-ui';
import { Field, inputClass } from './ui';

export function SupplierField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { api, shop, t } = useShop();
  const canonical=useGstPages(['suppliers','product-picker'],cursor=>api.gst.suppliers(shop!.id,'',cursor));
  const [add,setAdd]=useState(false);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const suppliers = useQuery({
    queryKey: ['suppliers', shop?.id, 'picker'],
    enabled: !!shop,
    queryFn: () => api.getSuppliers(shop!.id),
  });

  const matches = useMemo(() => {
    const masters=canonical.data?.pages.flatMap(p=>p.items)??[];const all=[...masters.map(row=>({name:row.identity.inventorySupplierName||row.identity.name,batches:0})),...(suppliers.data?.suppliers??[]).filter(row=>!masters.some(master=>(master.identity.inventorySupplierName||master.identity.name)===row.name))];
    const query = value.trim().toLowerCase();
    const list = query ? all.filter((row) => row.name.toLowerCase().includes(query)) : all;
    const exact = query && all.some((row) => row.name.toLowerCase() === query);
    return exact ? [] : list.slice(0, 8);
  }, [suppliers.data, canonical.data, value]);

  const showList = open && matches.length > 0;

  return (
    <div><span className="shop-label">{t('modal.add_product.supplier_label', 'Supplier')}</span>
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
      <button type="button" className="shop-section-link" onClick={()=>setAdd(!add)}>{t("gst.add_supplier","Add supplier with GST details")}</button>
      {add?<SupplierEditor onSaved={row=>{onChange(row.identity.inventorySupplierName||row.identity.name);setAdd(false);}}/>:null}
      {canonical.hasNextPage?<button type="button" onClick={()=>void canonical.fetchNextPage()}>Load more suppliers</button>:null}
    </div>
  );
}
