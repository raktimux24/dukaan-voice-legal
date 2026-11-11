'use client';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

/** Tabs with real tab semantics: one tab stop, arrow keys move between tabs, Home/End jump. */
export function TabList({ items, value, onChange, label, idPrefix, className, disabled, vertical, renderLabel }: {
  items: readonly (readonly [string, string])[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  /** When set, each tab points at the panel `${idPrefix}-panel-${id}` and is `${idPrefix}-tab-${id}`. */
  idPrefix?: string;
  className?: string;
  disabled?: boolean;
  vertical?: boolean;
  renderLabel?: (id: string, label: string) => ReactNode;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next = ({ ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last } as Record<string, number>)[event.key];
    if (next === undefined || disabled) return;
    event.preventDefault();
    const target = next < 0 ? last : next > last ? 0 : next;
    refs.current[target]?.focus();
    onChange(items[target][0]);
  };
  const focusable = items.some(([id]) => id === value) ? value : items[0]?.[0];
  return <div role="tablist" aria-label={label || undefined} aria-orientation={vertical ? 'vertical' : 'horizontal'} className={className}>
    {items.map(([id, text], index) => {
      const selected = id === value;
      return <button key={id} ref={node => { refs.current[index] = node; }} type="button" role="tab" id={idPrefix ? `${idPrefix}-tab-${id}` : undefined}
        aria-selected={selected} aria-controls={idPrefix ? `${idPrefix}-panel-${id}` : undefined} tabIndex={id === focusable ? 0 : -1}
        className={selected ? 'is-active' : undefined} disabled={disabled} onKeyDown={event => move(event, index)} onClick={() => onChange(id)}>
        {renderLabel ? renderLabel(id, text) : text}
      </button>;
    })}
  </div>;
}

/** Replaces one query parameter in the address bar without a navigation, so links and reloads reopen the same tab. */
export function syncQuery(name: string, value: string | null) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (value) params.set(name, value); else params.delete(name);
  const query = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
}
