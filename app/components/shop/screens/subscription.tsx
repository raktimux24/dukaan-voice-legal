'use client';

import { AccountDashboard } from '../../../account/AccountClient';
import { getLocale } from '../../../i18n';
import { useShop } from '../context';
import { PageHeader, Spinner } from '../ui';

export function SubscriptionScreen() {
  const { shop, userId, role, t, prefs, offline, signOutShop } = useShop();
  if (!shop) return <Spinner />;
  const language = prefs?.appLanguage ?? 'en';
  const locale = getLocale(language === 'hinglish' ? 'hi' : language);
  return (
    <div className="shop-page billing-workspace">
      <PageHeader back={{ href: '/shop/settings?section=shop', label: t('settings.title', 'Settings') }}
        kicker={shop.name} title={t('subscription.section_title', 'Subscription')}
        description={t('billingweb.intro', 'Plan, payments and invoices for this shop.')} />
      {offline ? <p role="status">{t('settingsweb.offline', 'Reconnect to change settings or download records.')}</p> :
        <div className="shop-billing">
          <AccountDashboard key={`${userId}:${shop.id}:${role}`} locale={locale} language={language} translate={t} onSignOut={signOutShop} lockedShopId={shop.id} embedded />
        </div>}
    </div>
  );
}
