'use client'

import { useState, useEffect } from 'react';
import * as hl from "@nktkas/hyperliquid";
import Link from 'next/link';

interface HyperCoreTransactionListProps {
  address: string;
  isTestnet: boolean;
}

interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: string;
  time: number;
  startPosition: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
  feeToken: string;
}

export function HyperCoreTransactionList({ address, isTestnet }: HyperCoreTransactionListProps) {
  const [transactions, setTransactions] = useState<UserFill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const transportConfig: hl.HttpTransportOptions = {
          isTestnet
        };

        const transport = new hl.HttpTransport(transportConfig);
        const client = new hl.InfoClient({ transport });

        // Fetch user fills (trades/actions)
        const result = await client.userFills({ user: address as `0x${string}` });
        
        // Take the first 25 items
        const firstBatch = result.slice(0, 25);
        setTransactions(firstBatch);
        setHasMore(result.length > 25);
      } catch (err: any) {
        setError(`Error loading transactions: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isTestnet]);

  const loadMore = async () => {
    try {
      const transportConfig: hl.HttpTransportOptions = {
        isTestnet
      };

      const transport = new hl.HttpTransport(transportConfig);
      const client = new hl.InfoClient({ transport });

      const result = await client.userFills({ user: address as `0x${string}` });
      
      // Load next batch
      const nextBatch = result.slice(transactions.length, transactions.length + 25);
      setTransactions([...transactions, ...nextBatch]);
      setHasMore(result.length > transactions.length + nextBatch.length);
    } catch (err: any) {
      setError(`Error loading more transactions: ${err.message || 'Unknown error'}`);
    }
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
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="loading-state">Loading transactions...</div>
    );
  }

  if (error) {
    return (
      <div className="error-message">{error}</div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">No transactions found</div>
    );
  }

  return (
    <div className="transactions-list">
      <div className="transactions-table">
        <div className="transaction-table-header">
          <span>Hash</span>
          <span>Action</span>
          <span>Coin</span>
          <span>Side</span>
          <span>Size</span>
          <span>Price</span>
          <span>Age</span>
        </div>
        {transactions.map((tx, idx) => (
          <div key={idx} className="transaction-table-row">
            <span className="transaction-hash">
              <Link href={`/?tx=${tx.hash}`}>
                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
              </Link>
            </span>
            <span className="transaction-type">Trade</span>
            <span className="transaction-coin">{tx.coin}</span>
            <span className={`transaction-side ${tx.side.toLowerCase()}`}>
              {tx.side}
            </span>
            <span className="transaction-size">{parseFloat(tx.sz).toFixed(4)}</span>
            <span className="transaction-price">${tx.px}</span>
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
