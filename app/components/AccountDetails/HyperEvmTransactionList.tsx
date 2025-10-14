'use client'

import { useState, useEffect } from 'react';
import { JsonRpcProvider, TransactionResponse } from 'ethers';
import Link from 'next/link';
import { CORE_WRITER_ADDRESS } from '../../../constants/addresses';

interface HyperEvmTransactionListProps {
  address: string;
  rpcUrl: string;
}

interface TransactionWithBlock {
  tx: TransactionResponse;
  timestamp?: number;
  hasCoreWriter: boolean;
}

export function HyperEvmTransactionList({ address, rpcUrl }: HyperEvmTransactionListProps) {
  const [transactions, setTransactions] = useState<TransactionWithBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const provider = new JsonRpcProvider(rpcUrl, 999, {
          staticNetwork: true,
        });

        // Get current block number
        const blockNumber = await provider.getBlockNumber();
        setCurrentBlock(blockNumber);

        // Fetch transactions by scanning recent blocks
        // Note: This is a fallback approach since eth_getTransactionsByAddress is not standard
        // In production, you'd want to use an indexer service
        const txs = await fetchRecentTransactions(provider, address, blockNumber, 25);
        setTransactions(txs);
        setHasMore(txs.length === 25);
      } catch (err: any) {
        setError(`Error loading transactions: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address, rpcUrl]);

  const fetchRecentTransactions = async (
    provider: JsonRpcProvider,
    address: string,
    startBlock: number,
    limit: number
  ): Promise<TransactionWithBlock[]> => {
    const txs: TransactionWithBlock[] = [];
    const addressLower = address.toLowerCase();
    let currentBlockNum = startBlock;
    const minBlock = Math.max(0, startBlock - 1000); // Scan last 1000 blocks

    while (txs.length < limit && currentBlockNum > minBlock) {
      try {
        const block = await provider.getBlock(currentBlockNum, true);
        
        if (block && block.transactions) {
          for (const txHash of block.transactions) {
            if (typeof txHash === 'string') {
              const tx = await provider.getTransaction(txHash);
              if (tx && (
                tx.from.toLowerCase() === addressLower || 
                tx.to?.toLowerCase() === addressLower
              )) {
                // Check if transaction has CoreWriter logs
                let hasCoreWriter = false;
                try {
                  const receipt = await provider.getTransactionReceipt(txHash);
                  if (receipt) {
                    hasCoreWriter = receipt.logs.some(
                      log => log.address.toLowerCase() === CORE_WRITER_ADDRESS.toLowerCase()
                    );
                  }
                } catch {
                  // Ignore errors when checking receipt
                }

                txs.push({
                  tx,
                  timestamp: block.timestamp,
                  hasCoreWriter
                });

                if (txs.length >= limit) break;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Error fetching block ${currentBlockNum}:`, err);
      }

      currentBlockNum--;
    }

    return txs;
  };

  const loadMore = async () => {
    try {
      const provider = new JsonRpcProvider(rpcUrl, 999, {
        staticNetwork: true,
      });

      const startBlock = transactions.length > 0 
        ? transactions[transactions.length - 1].tx.blockNumber! - 1
        : currentBlock;

      const moreTxs = await fetchRecentTransactions(provider, address, startBlock, 25);
      setTransactions([...transactions, ...moreTxs]);
      setHasMore(moreTxs.length === 25);
    } catch (err: any) {
      setError(`Error loading more transactions: ${err.message || 'Unknown error'}`);
    }
  };

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    
    const now = Date.now();
    const diffMs = now - (timestamp * 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getMethodName = (tx: TransactionResponse): string => {
    if (!tx.data || tx.data === '0x') return '';
    
    // Extract first 4 bytes (function selector)
    const selector = tx.data.slice(0, 10);
    
    // Common method signatures
    const methodMap: { [key: string]: string } = {
      '0xa9059cbb': 'Transfer',
      '0x23b872dd': 'TransferFrom',
      '0x095ea7b3': 'Approve',
    };

    return methodMap[selector] || 'Contract Call';
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
      <div className="empty-state">No transactions found in recent blocks</div>
    );
  }

  return (
    <div className="transactions-list">
      <div className="transactions-table">
        <div className="transaction-table-header">
          <span>Hash</span>
          <span>Method</span>
          <span>Block</span>
          <span>Age</span>
        </div>
        {transactions.map((item, idx) => (
          <div key={idx} className="transaction-table-row">
            <span className="transaction-hash">
              <Link href={`/?tx=${item.tx.hash}`}>
                {item.tx.hash.slice(0, 10)}...{item.tx.hash.slice(-8)}
              </Link>
              {item.hasCoreWriter && (
                <span className="corewriter-badge" title="Contains CoreWriter actions">
                  CW
                </span>
              )}
            </span>
            <span className="transaction-method">{getMethodName(item.tx)}</span>
            <span className="transaction-block">{item.tx.blockNumber}</span>
            <span className="transaction-age" title={formatTimestamp(item.timestamp)}>
              {formatTimeAgo(item.timestamp)}
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
