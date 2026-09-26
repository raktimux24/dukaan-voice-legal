'use client';

import { AccountDashboard } from '../../../account/AccountClient';
import { useShop } from '../context';
import { PageHeader, Spinner } from '../ui';

export function SubscriptionScreen() {
  const { shop } = useShop();
  if (!shop) return <Spinner />;

  return (
    <div className="shop-page">
      <PageHeader
        back={{ href: '/shop/settings', label: 'Settings' }}
        kicker="Billing"
        title="Subscription"
        description="Plans, payment method, and invoices for this shop. Checkout still runs through Razorpay."
      />
      <div className="shop-billing">
        <AccountDashboard locale="en" lockedShopId={shop.id} embedded />
      </div>
    </div>
  );
}
