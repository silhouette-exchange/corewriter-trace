'use client';

import { useState, useEffect } from 'react';
import * as hl from '@nktkas/hyperliquid';
import Link from 'next/link';

interface HyperCoreTransactionListProps {
  address: string;
  isTestnet: boolean;
}

interface UserDetail {
  action: {
    type: string;
    [key: string]: any;
  };
  block: number;
  error: string | null;
  hash: string;
  time: number;
  user: string;
}

export function HyperCoreTransactionList({
  address,
  isTestnet,
}: HyperCoreTransactionListProps) {
  const [transactions, setTransactions] = useState<UserDetail[]>([]);
  const [allTransactions, setAllTransactions] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError('');

        const transportConfig: hl.HttpTransportOptions = {
          isTestnet,
        };

        const transport = new hl.HttpTransport(transportConfig);
        const client = new hl.InfoClient({ transport });

        // Fetch user details (all actions)
        const result = await client.userDetails({
          user: address as `0x${string}`,
        });

        // Store all transactions (userDetails returns an object with txs property)
        const txs = result.txs || [];
        setAllTransactions(txs);
        // Take the first 25 items
        const firstBatch = txs.slice(0, 25);
        setTransactions(firstBatch);
        setHasMore(txs.length > 25);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error loading transactions: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isTestnet]);

  const loadMore = () => {
    // Load next batch from cached data
    const nextBatch = allTransactions.slice(
      transactions.length,
      transactions.length + 25
    );
    setTransactions([...transactions, ...nextBatch]);
    setHasMore(allTransactions.length > transactions.length + nextBatch.length);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return <div className="loading-state">Loading transactions...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (transactions.length === 0) {
    return <div className="empty-state">No transactions found</div>;
  }

  return (
    <div className="transactions-list">
      <div className="transactions-table">
        <div className="transaction-table-header">
          <span>Hash</span>
          <span>Action Type</span>
          <span>Block</span>
          <span>Status</span>
          <span>Age</span>
        </div>
        {transactions.map((tx, idx) => (
          <div key={idx} className="transaction-table-row">
            <span className="transaction-hash">
              <Link href={`/tx?hash=${tx.hash}&network=${isTestnet ? 'testnet' : 'mainnet'}`}>
                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
              </Link>
            </span>
            <span className="transaction-type">{tx.action.type}</span>
            <span className="transaction-block">{tx.block}</span>
            <span
              className={`transaction-status ${tx.error ? 'error' : 'success'}`}
            >
              {tx.error ? 'Failed' : 'Success'}
            </span>
            <span className="transaction-age" title={formatTimestamp(tx.time)}>
              {formatTimeAgo(tx.time)}
            </span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={loadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
}
