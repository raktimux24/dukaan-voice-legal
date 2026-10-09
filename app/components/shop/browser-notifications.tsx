"use client";
import { useEffect, useRef, useState } from "react";
import { useShop } from "./context";
import { Button, Card, Spinner } from "./ui";
import { useGstText } from "./gst-ui";
import { ApiError } from "../../lib/shop/api";
import {
  assertPushSession,
  bindPushOwner,
  pushKeyMatches,
  pushWorkerReady,
  pushSession,
  withPushSession,
  type PushLease,
} from "../../lib/shop/browser-push-session";
export const BROWSER_PUSH_OWNER = "samaan-browser-push-owner";
type PushApi = {
  removeBrowserPush: (subscription: PushSubscriptionJSON) => Promise<unknown>;
};
async function disconnect(
  api: PushApi,
  registration: ServiceWorkerRegistration | undefined,
  check: () => void,
) {
  check();
  registration?.active?.postMessage({
    type: "BIND_PUSH_ACCOUNT",
    actorId: null,
  });
  const subscription = await registration?.pushManager.getSubscription();
  check();
  if (subscription) {
    await subscription.unsubscribe();
    check();
    await Promise.race([
      api.removeBrowserPush(subscription.toJSON()).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    check();
  }
  localStorage.removeItem(BROWSER_PUSH_OWNER);
}
export async function disconnectBrowserPush(api: PushApi, lease: PushLease) {
  if (!("serviceWorker" in navigator)) return;
  return withPushSession(lease, async (check) => {
    const registration = await navigator.serviceWorker.getRegistration("/");
    check();
    await disconnect(api, registration, check);
  });
}
export function BrowserNotifications() {
  const { api, userId, prefs, offline, t } = useShop(),
    text = useGstText();
  const [status, setStatus] = useState("loading"),
    [busy, setBusy] = useState(false);
  const [key, setKey] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  const identity = useRef(userId);
  identity.current = userId;
  const alive = useRef(true);
  useEffect(() => {
    setBusy(false);
  }, [userId]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setKey(null);
    const check = async () => {
      if (
        !window.isSecureContext ||
        !("Notification" in window) ||
        !("PushManager" in window) ||
        !("serviceWorker" in navigator)
      ) {
        setStatus("unsupported");
        return;
      }
      if (!userId) return;
      try {
        const lease = pushSession(userId);
        const capability = await api.getBrowserPush();
        assertPushSession(lease);
        if (cancelled) return;
        setKey(capability.publicKey);
        if (!capability.available || !capability.publicKey) {
          setStatus("unavailable");
          return;
        }
        const outcome = await withPushSession(lease, async (guard) => {
          const registration = await navigator.serviceWorker.register(
            "/shop-worker.js",
            { scope: "/" },
          );
          guard();
          const ready = await pushWorkerReady(navigator.serviceWorker.ready);
          guard();
          const subscription = await registration.pushManager.getSubscription();
          guard();
          const bound = localStorage.getItem(BROWSER_PUSH_OWNER);
          if (
            subscription &&
            (bound !== userId ||
              !pushKeyMatches(
                subscription.options.applicationServerKey,
                capability.publicKey!,
              ))
          ) {
            await disconnect(api, registration, guard);
            return "off";
          }
          if (subscription && Notification.permission === "granted") {
            await api.saveBrowserPush(
              subscription.toJSON(),
              prefs?.appLanguage ?? "en",
            );
            guard();
            await bindPushOwner(ready.active, userId);
            guard();
            return "on";
          }
          return Notification.permission === "denied" ? "denied" : "off";
        });
        if (!cancelled) setStatus(outcome);
      } catch (error) {
        if (!cancelled && identity.current === userId)
          setStatus(error instanceof ApiError && [404, 503].includes(error.status) ? "unavailable" : "error");
      }
    };
    if (offline) {
      setStatus("error");
      return;
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [api, userId, prefs?.appLanguage, offline, revision]);
  const toggle = async () => {
    if (busy || !userId) return;
    setBusy(true);
    const current = () => alive.current && identity.current === userId;
    try {
      const lease = pushSession(userId);
      if (status === "on") {
        await disconnectBrowserPush(api, lease);
        assertPushSession(lease);
        if (current()) setStatus("off");
        return;
      }
      if (!key) return;
      // Permission is requested only from the user's explicit click.
      const permission = await Notification.requestPermission();
      assertPushSession(lease);
      if (!current()) return;
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      await withPushSession(lease, async (guard) => {
        await navigator.serviceWorker.register("/shop-worker.js", {
          scope: "/",
        });
        guard();
        const registration = await pushWorkerReady(
          navigator.serviceWorker.ready,
        );
        guard();
        const existing = await registration.pushManager.getSubscription();
        guard();
        if (
          existing &&
          !pushKeyMatches(existing.options.applicationServerKey, key)
        ) {
          await disconnect(api, registration, guard);
        }
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
        guard();
        await api.saveBrowserPush(
          subscription.toJSON(),
          prefs?.appLanguage ?? "en",
        );
        guard();
        localStorage.setItem(BROWSER_PUSH_OWNER, userId);
        await bindPushOwner(registration.active, userId);
        guard();
      });
      if (current()) setStatus("on");
    } catch {
      if (current()) setStatus("error");
    } finally {
      if (current()) setBusy(false);
    }
  };
  const labels: Record<string, string> = {
    unsupported: "This browser does not support notifications.",
    unavailable: "Browser notifications are not available yet.",
    off: "Notifications are off on this browser.",
    denied: "Notifications are blocked. Allow them in your browser settings.",
    on: "Notifications are enabled on this browser.",
    error: "Could not update notifications. Connect and try again.",
  };
  return (
    <Card className="grid gap-4">
      <div>
        <h2 className="shop-section-title">
          {t("settings.section_notifications", "Notifications")}
        </h2>
        <p className="shop-section-sub">
          {text("Daily recaps and shop updates on this browser.")}
        </p>
      </div>
      {status === "loading" ? (
        <Spinner />
      ) : (
        <p role="status">{text(labels[status])}</p>
      )}
      {["off", "on"].includes(status) ? (
        <div className="shop-actions">
          <Button disabled={busy || offline} onClick={() => void toggle()}>
            {text(
              status === "on"
                ? "Turn off notifications"
                : "Enable notifications",
            )}
          </Button>
        </div>
      ) : status === "error" ? (
        <Button
          disabled={busy || offline}
          tone="ghost"
          onClick={() => setRevision((value) => value + 1)}
        >
          {t("common.retry", "Try again")}
        </Button>
      ) : null}
    </Card>
  );
}
