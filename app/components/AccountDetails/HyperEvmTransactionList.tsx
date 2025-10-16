'use client';

import Link from 'next/link';

interface HyperEvmTransactionListProps {
  address: string;
  rpcUrl: string;
}

export function HyperEvmTransactionList({
  address,
  rpcUrl,
}: HyperEvmTransactionListProps) {
  return (
    <div className="feature-unavailable">
      <div className="feature-unavailable-icon">🚧</div>
      <h4>Transaction History Unavailable</h4>
      <p>
        HyperEVM transaction history requires an indexer service to efficiently
        query transactions by address. This feature is currently under
        development.
      </p>
      <p className="feature-unavailable-note">
        <strong>Note:</strong> You can still view individual transactions by
        entering their hash on the <Link href="/">home page</Link>.
      </p>
    </div>
  );
}
