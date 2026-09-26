'use client';

import { AccountDashboard } from '../../../account/AccountClient';
import { getLocale } from '../../../i18n';
import { useShop } from '../context';
import { PageHeader, Spinner } from '../ui';

export function SubscriptionScreen() {
  const { shop, t, prefs } = useShop();
  if (!shop) return <Spinner />;
  const locale = getLocale(prefs?.appLanguage ?? 'en');

  return (
    <div className="shop-page">
      <PageHeader
        back={{ href: '/shop/settings', label: t('settings.title', 'Settings') }}
        kicker={t('subscription.section_title', 'Billing')}
        title={t('subscription.section_title', 'Subscription')}
        description="Plans, payment method, and invoices for this shop. Checkout still runs through Razorpay."
      />
      <div className="shop-billing">
        <AccountDashboard locale={locale} lockedShopId={shop.id} embedded />
      </div>
    </div>
  );
}
