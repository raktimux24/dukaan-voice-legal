"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Nudge } from "../../lib/shop/types";
import { homeNudgeLink } from "../../lib/shop/home";
import { formatINR } from "../../lib/shop/money";
import { useShop } from "./context";
import { Button, Notice } from "./ui";
import { VoiceSheet } from "./voice-sheet";

export function HomeNudge({ nudge, surface='home' }: { nudge: Nudge; surface?:'home'|'product'|'buy_list'|'customer' }) {
  const { api, shop, perms, offline, t, setNotice } = useShop();
  const client = useQueryClient(),
    alive = useRef(true),
    shown = useRef(false);
  const [busy, setBusy] = useState(false),
    [hidden, setHidden] = useState(false),
    [error, setError] = useState<unknown>(null);
  const [confirmPrice, setConfirmPrice] = useState(false),
    [draft, setDraft] = useState<{
      message: string;
      phone?: string | null;
    } | null>(null);
  useEffect(() => {
    alive.current = true;
    if (shop && !shown.current && !offline) {
      shown.current = true;
      void api.nudgeEvent(shop.id, nudge.id, "shown",surface).catch(() => undefined);
    }
    return () => {
      alive.current = false;
    };
  }, [api, shop, nudge.id, offline]);
  if (!shop || hidden) return null;
  const shopId = shop.id,
    action = nudge.action?.type,
    p = nudge.action?.params ?? {};
  const href = homeNudgeLink(nudge),
    price = Number(p.sellingPrice);
  const digits = draft?.phone?.replace(/\D/g, "") ?? "";
  const whatsappPhone = digits.length === 10 ? `91${digits}` : digits;
  const allowed =
    perms.canSeeReports &&
    (["add_to_buy_list", "set_price", "add_product"].includes(action ?? "")
      ? perms.canEditProducts
      : true) &&
    (!["open_customer", "remind_customer"].includes(action ?? "") ||
      perms.canManageCustomers);
  const labels: Record<string, string> = {
    add_to_buy_list: t("nudge.action.add_to_buy_list", "Add to buy list"),
    set_price: t("nudge.action.set_price", "Set price {{price}}", {
      price: formatINR(price),
    }),
    remind_customer: t("homeweb.prepare_reminder", "Review reminder"),
    share_offer: t("homeweb.prepare_offer", "Review offer"),
    add_to_cart: t("homeweb.view_product", "View product"),
    open_product: t("homeweb.view_product", "View product"),
    add_product: t("nudge.action.add_product", "Add product"),
    open_customer: t("nudge.action.view", "View"),
  };
  const refresh = () => {
    for (const key of ["nudges", "brief", "catalog", "stats", "buy-list"])
      void client.invalidateQueries({ queryKey: [key, shopId] });
  };
  const run = async (dismiss = false) => {
    if (busy || offline || !allowed) return;
    setBusy(true);
    setError(null);
    try {
      if (dismiss) {
        await api.nudgeEvent(shopId, nudge.id, "dismissed",surface);
        if (alive.current) {
          setHidden(true);
          refresh();
        }
      } else {
        void api.nudgeEvent(shopId, nudge.id, "tapped",surface).catch(() => undefined);
        const result = await api.actNudge(
          shopId,
          nudge.id,
          action === "share_offer" ? { applyPrice: false } : {},
        );
        if (!alive.current) return;
        if (action === "share_offer" || action === "remind_customer") {
          if (!result.message)
            throw new Error(
              t(
                "homeweb.draft_unavailable",
                "The message could not be prepared. Try again.",
              ),
            );
          setDraft({ message: result.message, phone: result.phone });
        } else {
          setNotice(
            action === "set_price"
              ? t(
                  "nudge.toast.price_updated",
                  "Selling price set to {{price}}",
                  { price: formatINR(price) },
                )
              : result.already
                ? t("nudge.toast.already_on_list", "Already on the buy list")
                : t("nudge.toast.added_to_list", "Added to buy list"),
          );
          setHidden(true);
          refresh();
        }
        setConfirmPrice(false);
      }
    } catch (reason) {
      if (alive.current) setError(reason);
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const canRun =
    ["add_to_buy_list", "share_offer", "remind_customer"].includes(
      action ?? "",
    ) ||
    (action === "set_price" && Number.isFinite(price) && price > 0);
  return (
    <article className="home-suggestion">
      <div className="home-suggestion-top">
        <h3>{nudge.title}</h3>
        <button
          type="button"
          className="home-icon-button"
          disabled={busy || offline}
          onClick={() => void run(true)}
          aria-label={t("homeweb.dismiss_suggestion", "Dismiss suggestion")}
        >
          ×
        </button>
      </div>
      <p>{nudge.body}</p>
      <Notice error={!confirmPrice ? error : null} />
      {allowed && labels[action ?? ""] ? (
        href ? (
          <Link
            className="home-text-link"
            href={href}
            onClick={() => {
              void api
                .nudgeEvent(shopId, nudge.id, "tapped",surface)
                .catch(() => undefined);
            }}
          >
            {labels[action!]} <span aria-hidden="true">↗</span>
          </Link>
        ) : canRun ? (
          <Button
            tone="ghost"
            size="sm"
            disabled={busy || offline}
            onClick={() =>
              action === "set_price" ? setConfirmPrice(true) : void run()
            }
          >
            {busy ? t("common.loading", "Loading…") : labels[action!]}
          </Button>
        ) : null
      ) : null}
      {confirmPrice ? (
        <VoiceSheet
          title={t("nudge.confirm_price_title", "Change selling price?")}
          closeLabel={t("common.close", "Close")}
          onClose={() => {
            if (!busy) setConfirmPrice(false);
          }}
        >
          <p>
            {t(
              "nudge.confirm_price_body",
              "Set the selling price to {{price}}. You can change it again any time.",
              { price: formatINR(price) },
            )}
          </p>
          <Notice error={error} />
          <div className="shop-actions">
            <Button disabled={busy || offline} onClick={() => void run()}>
              {t("common.confirm", "Confirm")}
            </Button>
            <Button
              tone="ghost"
              disabled={busy}
              onClick={() => setConfirmPrice(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
          </div>
        </VoiceSheet>
      ) : null}
      {draft ? (
        <VoiceSheet
          title={t("homeweb.review_message", "Review your message")}
          closeLabel={t("common.close", "Close")}
          onClose={() => {
            setDraft(null);
            setHidden(true);
            refresh();
          }}
        >
          <p className="home-message-draft">{draft.message}</p>
          {/^[1-9]\d{9,14}$/.test(whatsappPhone) ? (
            <a className="home-text-link" href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(draft.message)}`} target="_blank" rel="noopener noreferrer">
              {t("followups.whatsapp", "Prepare WhatsApp")}
            </a>
          ) : null}
          {typeof navigator.share === "function" ? (
            <Button
              tone="ghost"
              onClick={() => {
                void navigator
                  .share({ text: draft.message })
                  .catch((reason) => {
                    if (reason?.name !== "AbortError" && alive.current)
                      setError(reason);
                  });
              }}
            >
              {t("onboarding.invite.share", "Share")}
            </Button>
          ) : null}
          <Button
            tone="ghost"
            onClick={() => {
              void navigator.clipboard
                .writeText(draft.message)
                .then(() => {
                  if (alive.current)
                    setNotice(t("homeweb.copied", "Message copied"));
                })
                .catch(setError);
            }}
          >
            {t("homeweb.copy_message", "Copy message")}
          </Button>
          <Notice error={error} />
        </VoiceSheet>
      ) : null}
    </article>
  );
}
