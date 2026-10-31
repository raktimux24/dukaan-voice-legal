"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  APP_LANGUAGES,
  loadBundledLanguage,
  translateUi,
} from "../../lib/shop/translations";
import { SUPPORTED_LANGUAGES } from "../../lib/shop/languages";
import type {
  OnlineListing,
  OrderQuote,
  PublicStore,
} from "../../lib/shop/commerce/contract";
import { commerceUnit } from "../../lib/shop/commerce/contract";
import "./store.css";
type Item = Omit<OnlineListing, "productId">;
type Store = Omit<PublicStore, "items"> & { items: Item[] };
type Quote = Omit<OrderQuote, "lines"> & {
  lines: Omit<OrderQuote["lines"][number], "productId" | "tax">[];
};
const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
async function send<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(base + "/api/storefront" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const data = await r.json();
  if (!r.ok)
    throw Object.assign(Error(data.error ?? "commerce_failed"), {
      status: r.status,
    });
  return data;
}
const hexToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
    v.toString(16).padStart(2, "0"),
  ).join("");
function BrandMark() {
  return (
    <span
      className="store-mark"
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html:
          '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="samaan-store-mark"><rect width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#FF6B00" mask="url(#samaan-store-mark)"/></svg>',
      }}
    />
  );
}
export function Storefront() {
  const params = useParams<{
      storeId: string;
      itemId?: string;
      orderId?: string;
    }>(),
    router = useRouter(),
    id = params.storeId,
    alive = useRef(true),
    taskRunning = useRef(false),
    languageRequest = useRef(0),
    [lang, setLang] = useState("en"),
    [store, setStore] = useState<Store | null>(null),
    [item, setItem] = useState<Item | null>(null),
    [page, setPage] = useState(0),
    [cart, setCart] = useState<
      { id: string; quantity: string; name?: string; unit?: string }[]
    >([]),
    [view, setView] = useState<"products" | "cart">("products"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [quote, setQuote] = useState<Quote | null>(null),
    [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup"),
    [method, setMethod] = useState<"cash" | "upi">("cash"),
    [customer, setCustomer] = useState({
      name: "",
      phone: "",
      address: "",
      email: "",
    }),
    [challenge, setChallenge] = useState(""),
    [code, setCode] = useState(""),
    [token, setToken] = useState(""),
    [verified, setVerified] = useState(false),
    [reviewed, setReviewed] = useState(false),
    [pending, setPending] = useState<any>(null),
    [pendingQuote, setPendingQuote] = useState<Quote | null>(null),
    [restored, setRestored] = useState(false),
    [tracking, setTracking] = useState<any>(null),
    [privateToken, setPrivateToken] = useState("");
  const tr = (k: string, v?: Record<string, string | number>) =>
      translateUi(lang, {}, "commerce." + k, "commerce." + k, v),
    unit = (v: string) => (commerceUnit(v) ? tr("unit." + commerceUnit(v)) : v),
    key = "store-order-pending:" + id;
  useEffect(() => {
    alive.current = true;
    try {
      const saved = localStorage.getItem("samaan-public-language");
      const generation = ++languageRequest.current;
      if (saved && (APP_LANGUAGES as string[]).includes(saved))
        void loadBundledLanguage(saved).then(() => {
          if (alive.current && generation === languageRequest.current)
            setLang(saved);
        });
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw),
          request = saved.request ?? saved;
        setPending(request);
        setPendingQuote(saved.quote ?? null);
        setCart(request.items);
        setView("cart");
      } else {
        const cartRaw = sessionStorage.getItem("store-cart:" + id);
        if (cartRaw) {
          const saved = JSON.parse(cartRaw);
          if (
            Array.isArray(saved) &&
            saved.length <= 50 &&
            saved.every(
              (l) => typeof l.id === "string" && typeof l.quantity === "string",
            )
          )
            setCart(saved);
        }
      }
      setRestored(true);
    } catch {
      setError("commerce_storage");
    }
    return () => {
      alive.current = false;
    };
  }, [id]);
  useEffect(() => {
    if (!restored || params.orderId) return;
    try {
      sessionStorage.setItem("store-cart:" + id, JSON.stringify(cart));
    } catch {
      setError("commerce_storage");
    }
  }, [id, restored, JSON.stringify(cart), params.orderId]);
  const task = async (fn: () => Promise<void>) => {
    if (taskRunning.current) return;
    taskRunning.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e: any) {
      if (alive.current) setError(e.message ?? "commerce_failed");
    } finally {
      taskRunning.current = false;
      if (alive.current) setBusy(false);
    }
  };
  useEffect(() => {
    let active = true;
    void send<Store>("/" + id)
      .then((s) => {
        if (active) {
          setStore(s);
          setFulfilment(s.config.pickup ? "pickup" : "delivery");
          setMethod(s.config.cash ? "cash" : "upi");
        }
      })
      .catch((e) => {
        if (active && !params.orderId) setError(e.message);
      });
    if (params.itemId)
      void send<{ item: Item }>("/" + id + "/products/" + params.itemId)
        .then((p) => {
          if (active) setItem(p.item);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [id, params.itemId]);
  useEffect(() => {
    setQuote(null);
    setReviewed(false);
  }, [
    JSON.stringify(cart),
    fulfilment,
    method,
    customer.name,
    customer.phone,
    customer.address,
  ]);
  useEffect(() => {
    document.title =
      (tracking
        ? tr("order_number", { number: tracking.number })
        : (store?.config.name ?? tr("catalogue"))) + " · Samaan Bol";
    document.documentElement.lang = lang === "hinglish" ? "hi-Latn" : lang;
  }, [lang, store?.config.name, tracking?.number]);
  const loadTrack = async (tokenValue: string) => {
    const p = await send<any>(
      "/" + id + "/orders/" + params.orderId + "/track",
      { token: tokenValue },
    );
    if (alive.current) setTracking(p);
  };
  useEffect(() => {
    if (!params.orderId) return;
    const value = location.hash.slice(1);
    if (!/^[a-f0-9]{64}$/.test(value)) {
      setError("commerce_tracking");
      return;
    }
    setPrivateToken(value);
    void loadTrack(value).catch((e) => setError(e.message));
    const timer = setInterval(
      () => void loadTrack(value).catch(() => {}),
      30000,
    );
    return () => clearInterval(timer);
  }, [id, params.orderId]);
  const changeEmail = (v: string) => {
    setCustomer({ ...customer, email: v });
    setChallenge("");
    setVerified(false);
    setCode("");
  };
  const add = (p: Item) => {
    setCart((old) => {
      const present = old.find((l) => l.id === p.id);
      return present
        ? old.map((l) =>
            l.id === p.id
              ? { ...l, quantity: String(Number(l.quantity) + 1) }
              : l,
          )
        : [...old, { id: p.id, quantity: "1", name: p.name, unit: p.unit }];
    });
    setNotice("");
  };
  const place = async () => {
    const request = pending ?? {
      clientId: crypto.randomUUID(),
      challengeId: challenge,
      token,
      language: lang,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      },
      items: cart.map(({ id, quantity }) => ({ id, quantity })),
      fulfilment,
      method,
      quoteHash: quote!.quoteHash,
    };
    const raw = JSON.stringify({
      version: 1,
      request,
      quote: pendingQuote ?? quote,
    });
    try {
      sessionStorage.setItem(key, raw);
      if (sessionStorage.getItem(key) !== raw) throw Error("commerce_storage");
    } catch {
      throw Error("commerce_storage");
    }
    setPending(request);
    setPendingQuote(pendingQuote ?? quote);
    let result: { id: string; token: string };
    try {
      result = await send<{ id: string; token: string }>(
        "/" + id + "/orders",
        request,
      );
    } catch (e: any) {
      // Only definite, transaction-rejected requests may be edited. Lost replies retain their identity.
      if (
        [400, 403, 404, 409].includes(e.status) &&
        /^commerce_(changed|stock|quantity|customer|product|fulfilment|payment|tax|verification|email|unpublished|not_found|amount|invalid)$/.test(
          e.message,
        )
      ) {
        sessionStorage.removeItem(key);
        if (alive.current) {
          setPending(null);
          setPendingQuote(null);
          setQuote(null);
          setReviewed(false);
          if (e.message === "commerce_verification") {
            setVerified(false);
            setChallenge("");
            setCode("");
          }
        }
      }
      throw e;
    }
    if (!alive.current) return;
    sessionStorage.removeItem(key);
    sessionStorage.removeItem("store-cart:" + id);
    location.assign(
      "/store/" + id + "/orders/" + result.id + "#" + result.token,
    );
  };
  const message =
    error === "commerce_tracking"
      ? tr("tracking_unavailable")
      : translateUi(
          lang,
          {},
          "commerce.error." + error.replace(/^commerce_/, ""),
          tr("error.failed"),
        );
  return (
    <main className="public-store">
      <header className="store-top">
        <Link href={"/store/" + id} className="store-brand">
          <BrandMark />
          <span className="store-word">
            Samaan<span>Bol</span>
          </span>
        </Link>
        <div className="store-top-actions">
          {!params.orderId && cart.length > 0 ? (
            <button
              type="button"
              className="store-cart-chip"
              onClick={() => {
                setNotice("");
                setView(view === "products" ? "cart" : "products");
              }}
            >
              {view === "products"
                ? tr("view_cart") + " · " + cart.length
                : tr("back_products")}
            </button>
          ) : null}
          <label>
          <span>{tr("language")}</span>
          <select
            aria-label={tr("language")}
            value={lang}
            onChange={(e) => {
              const v = e.target.value;
              const generation = ++languageRequest.current;
              void loadBundledLanguage(v).then(() => {
                if (!alive.current || generation !== languageRequest.current)
                  return;
                setLang(v);
                try {
                  localStorage.setItem("samaan-public-language", v);
                } catch {}
              });
            }}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          </label>
        </div>
      </header>
      {error ? (
        <div className="store-message danger" role="alert">
          {message}
        </div>
      ) : null}
      {notice ? (
        <p role="status" className="store-toast">
          {notice}
        </p>
      ) : null}
      {busy ? (
        <p role="status" className="store-busy">
          {tr("loading")}
        </p>
      ) : null}
      {params.orderId ? (
        <section className="store-content store-confirm">
          {tracking ? (
            <>
              <p className="store-kicker">{tr("fulfilment_status")}</p>
              <h1>{tr("order_number", { number: tracking.number })}</h1>
              <p className="store-status store-status-lg">
                {tr("state_" + tracking.state)}
              </p>
              <div className="store-card">
                <h2>{tr("payment")}</h2>
                <p>{tr("payment_" + tracking.payment)}</p>
                <p className="store-muted">{tr("staff_payment_help")}</p>
                <p className="store-total">
                  {tr("total_amount", { amount: tracking.total })}
                </p>
                {Number(tracking.refunded) > 0 ? (
                  <p>{tr("refund_amount", { amount: tracking.refunded })}</p>
                ) : null}
                {tracking.voided ? (
                  <p role="alert">{tr("bill_voided")}</p>
                ) : null}
              </div>
              <div className="store-card">
                <h2>{store?.config.name ?? tracking.store?.name}</h2>
                <p>{tr("config_" + tracking.fulfilment)}</p>
                <p>
                  {tracking.fulfilment === "delivery"
                    ? tracking.customer.address
                    : tracking.store?.address}
                </p>
                <p>
                  {tracking.customer.name} · {tracking.customer.phone}
                </p>
                <p>{tracking.store?.phone}</p>
                {tracking.lines.map((l: any) => (
                  <p key={l.listingId}>
                    {l.name} · {l.quantity} {unit(l.unit)} · ₹{l.price}
                  </p>
                ))}
              </div>
              {tracking.payment === "unpaid" &&
              !tracking.voided &&
              ["ready", "out_for_delivery"].includes(tracking.state) &&
              store?.config.upi &&
              store.upiVpa ? (
                <div className="store-card">
                  <h2>{tr("pay_upi")}</h2>
                  <p>{tr("upi_help")}</p>
                  <a
                    className="store-button primary"
                    href={
                      "upi://pay?" +
                      new URLSearchParams({
                        pa: store.upiVpa,
                        pn: store.upiPayee ?? store.config.name,
                        am: tracking.total,
                        cu: "INR",
                        tn: tracking.number,
                      })
                    }
                  >
                    {tr("upi_open")}
                  </a>
                </div>
              ) : null}
              <div className="store-card">
                <h2>{tr("history")}</h2>
                {tracking.events.map((e: any, i: number) => (
                  <p key={i}>
                    {tr("state_" + e.kind) === "commerce.state_" + e.kind
                      ? tr(
                          e.kind === "payment_recorded"
                            ? "payment_staff_confirmed"
                            : "state_" + tracking.state,
                        )
                      : tr("state_" + e.kind)}{" "}
                    ·{" "}
                    {new Date(e.at).toLocaleString(
                      lang === "hinglish" ? "en-IN" : lang + "-IN",
                      { timeZone: "Asia/Kolkata" },
                    )}
                    {e.note ? " · " + e.note : ""}
                  </p>
                ))}
              </div>
              <p>{tr("tracking_help")}</p>
              <button
                className="store-button"
                disabled={busy}
                onClick={() =>
                  void task(async () => {
                    await navigator.clipboard.writeText(location.href);
                    setNotice(tr("tracking_copied"));
                  })
                }
              >
                {tr("copy_tracking")}
              </button>
              <button
                className="store-button"
                disabled={busy}
                onClick={() => void task(() => loadTrack(privateToken))}
              >
                {tr("refresh")}
              </button>
            </>
          ) : !error ? (
            <p>{tr("loading")}</p>
          ) : null}
        </section>
      ) : store ? (
        <>
          {view === "products" ? (
          <section className="store-hero">
            <p className="store-kicker">{tr("catalogue")}</p>
            <h1>{store.config.name}</h1>
            <ul className="store-meta">
              {store.config.address ? <li>{store.config.address}</li> : null}
              {store.config.hours ? <li>{store.config.hours}</li> : null}
              {store.config.phone ? (
                <li>
                  <a href={"tel:" + store.config.phone}>{store.config.phone}</a>
                </li>
              ) : null}
            </ul>
            {store.config.policy ? (
              <p className="store-policy">{store.config.policy}</p>
            ) : null}
            <p className="store-muted">
              {tr("stock_help")}
              {store.orderingAvailable === false
                ? " · " + tr("error.email_unavailable")
                : ""}
            </p>
          </section>
          ) : null}
          {pending ? (
            <div className="store-card">
              <p>{tr("saved_request")}</p>
              {pendingQuote ? (
                <>
                  <p>{tr("total_amount", { amount: pendingQuote.total })}</p>
                  {pendingQuote.lines.map((l) => (
                    <p key={l.listingId}>
                      {l.name} · {l.quantity} {unit(l.unit)}
                    </p>
                  ))}
                </>
              ) : null}
              <button
                disabled={busy}
                className="store-button primary"
                onClick={() => void task(place)}
              >
                {tr("retry_order")}
              </button>
            </div>
          ) : null}
          {view === "products" ? (
            <section className="store-grid">
              {(params.itemId ? (item ? [item] : []) : store.items).map((p) => (
                <article key={p.id} className="store-card store-product">
                  <div className="store-product-mark" aria-hidden="true">
                    {p.name.slice(0, 1)}
                  </div>
                  <h2>
                    <Link href={"/store/" + id + "/p/" + p.id}>{p.name}</Link>
                  </h2>
                  {p.description ? <p>{p.description}</p> : null}
                  <p className="store-price">
                    {tr("price_unit", { price: p.price, unit: unit(p.unit) })}
                  </p>
                  <p
                    className={
                      "store-pill" + (p.available ? "" : " store-pill-off")
                    }
                  >
                    {tr(p.available ? "available" : "unavailable")}
                  </p>
                  <button
                    disabled={
                      !p.available ||
                      store.orderingAvailable === false ||
                      busy ||
                      !!pending
                    }
                    className="store-button primary"
                    onClick={() => add(p)}
                  >
                    {tr("add_cart")}
                  </button>
                </article>
              ))}
              {!params.itemId && store.more ? (
                <button
                  className="store-button"
                  disabled={busy}
                  onClick={() =>
                    void task(async () => {
                      const next = await send<Store>(
                        "/" + id + "?offset=" + (page + 30),
                      );
                      setStore({
                        ...store,
                        items: [...store.items, ...next.items],
                        more: next.more,
                      });
                      setPage(page + 30);
                    })
                  }
                >
                  {tr("more")}
                </button>
              ) : null}
            </section>
          ) : (
            <section className="store-checkout">
              <h2>{tr("cart")}</h2>
              {cart.length ? (
                cart.map((l) => {
                  const p =
                    store.items.find((x) => x.id === l.id) ??
                    (item?.id === l.id ? item : null);
                  return (
                    <div key={l.id} className="store-card">
                      <h3>{p?.name ?? l.name ?? tr("unavailable")}</h3>
                      <label>
                        {tr("quantity")}{" "}
                        {p?.unit || l.unit ? unit(p?.unit ?? l.unit!) : ""}
                        <input
                          inputMode="decimal"
                          aria-label={
                            tr("quantity") +
                            " " +
                            (p?.name ?? l.name ?? tr("unavailable"))
                          }
                          value={l.quantity}
                          disabled={!!pending || busy}
                          onChange={(e) =>
                            setCart(
                              cart.map((x) =>
                                x.id === l.id
                                  ? { ...x, quantity: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        className="store-button"
                        disabled={!!pending || busy}
                        onClick={() =>
                          setCart(cart.filter((x) => x.id !== l.id))
                        }
                      >
                        {tr("remove")}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p>{tr("empty_cart")}</p>
              )}
              {cart.length > 0 && !pending ? (
                <>
                  <div className="store-card">
                    <h3>{tr("fulfilment")}</h3>
                    <div className="store-pills">
                    {(["pickup", "delivery"] as const)
                      .filter((k) => store.config[k])
                      .map((k) => (
                        <label className="store-choice" key={k}>
                          <input
                            type="radio"
                            name="fulfilment"
                            checked={fulfilment === k}
                            onChange={() => setFulfilment(k)}
                          />
                          {tr(k)}
                        </label>
                      ))}
                    </div>
                    <h3>{tr("payment")}</h3>
                    <div className="store-pills">
                    {(["cash", "upi"] as const)
                      .filter((k) => store.config[k])
                      .map((k) => (
                        <label className="store-choice" key={k}>
                          <input
                            type="radio"
                            name="payment"
                            checked={method === k}
                            onChange={() => setMethod(k)}
                          />
                          {tr("pay_" + k)}
                        </label>
                      ))}
                    </div>
                    <p className="store-muted">{tr("payment_help")}</p>
                    {(["name", "phone", "email"] as const).map((k) => (
                      <label key={k}>
                        {tr("contact_" + k)}
                        <input
                          value={customer[k]}
                          autoComplete={
                            k === "name"
                              ? "name"
                              : k === "phone"
                                ? "tel"
                                : "email"
                          }
                          inputMode={
                            k === "phone"
                              ? "tel"
                              : k === "email"
                                ? "email"
                                : "text"
                          }
                          disabled={busy}
                          maxLength={
                            k === "name" ? 120 : k === "phone" ? 10 : 254
                          }
                          onChange={(e) =>
                            k === "email"
                              ? changeEmail(e.target.value)
                              : setCustomer({
                                  ...customer,
                                  [k]: e.target.value,
                                })
                          }
                        />
                      </label>
                    ))}
                    {fulfilment === "delivery" ? (
                      <label>
                        {tr("delivery_address")}
                        <textarea
                          value={customer.address}
                          maxLength={500}
                          onChange={(e) =>
                            setCustomer({
                              ...customer,
                              address: e.target.value,
                            })
                          }
                        />
                      </label>
                    ) : null}
                    <p className="store-muted">{tr("email_help")}</p>
                    {verified ? (
                      <p role="status">{tr("verified")}</p>
                    ) : (
                      <>
                        <button
                          className="store-button"
                          disabled={
                            busy ||
                            store.orderingAvailable === false ||
                            !customer.email
                          }
                          onClick={() =>
                            void task(async () => {
                              const c = await send<{ id: string }>(
                                "/" + id + "/challenges",
                                { email: customer.email, language: lang },
                              );
                              setChallenge(c.id);
                              setToken(hexToken());
                              setNotice(tr("code_sent"));
                            })
                          }
                        >
                          {tr("send_code")}
                        </button>
                        {challenge ? (
                          <>
                            <label>
                              {tr("code")}
                              <input
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                              />
                            </label>
                            <button
                              className="store-button"
                              disabled={busy || code.length !== 6}
                              onClick={() =>
                                void task(async () => {
                                  await send("/" + id + "/verify", {
                                    id: challenge,
                                    code,
                                    token,
                                  });
                                  setVerified(true);
                                })
                              }
                            >
                              {tr("verify_code")}
                            </button>
                          </>
                        ) : null}
                      </>
                    )}
                  </div>
                  <div className="store-card">
                    <h3>{tr("review_order")}</h3>
                    <p>{store.config.policy}</p>
                    <p className="store-muted">{tr("review_help")}</p>
                    <button
                      className="store-button"
                      disabled={busy}
                      onClick={() =>
                        void task(async () => {
                          const q = await send<Quote>("/" + id + "/quote", {
                            items: cart,
                            fulfilment,
                          });
                          setQuote(q);
                          setReviewed(false);
                        })
                      }
                    >
                      {tr("review_order")}
                    </button>
                    {quote ? (
                      <>
                        <p>
                          {tr("tax")} · ₹{quote.tax}
                        </p>
                        <p className="store-total">
                          {tr("total_amount", { amount: quote.total })}
                        </p>
                        <label className="store-choice">
                          <input
                            type="checkbox"
                            checked={reviewed}
                            onChange={(e) => setReviewed(e.target.checked)}
                          />
                          {tr("request_review")}
                        </label>
                        <button
                          className="store-button primary"
                          disabled={
                            busy ||
                            store.orderingAvailable === false ||
                            !verified ||
                            !reviewed ||
                            !customer.name.trim() ||
                            !/^[6-9]\d{9}$/.test(customer.phone) ||
                            (fulfilment === "delivery" &&
                              !customer.address.trim())
                          }
                          onClick={() => void task(place)}
                        >
                          {tr("place_order")}
                        </button>
                      </>
                    ) : null}
                    <p className="store-muted">{tr("order_privacy")}</p>
                  </div>
                </>
              ) : null}
            </section>
          )}
        </>
      ) : !error ? (
        <p>{tr("loading")}</p>
      ) : (
        <p>{tr("product_unavailable")}</p>
      )}
    </main>
  );
}
