'use client';

import { SellScreen } from '../../components/shop/screens/sell';
import { Suspense } from 'react';
import { Spinner } from '../../components/shop/ui';

export default function SellPage() {
  return <Suspense fallback={<Spinner />}><SellScreen /></Suspense>;
}
