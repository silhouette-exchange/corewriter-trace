'use client';

import { useState, useEffect } from 'react';
import { JsonRpcProvider, formatEther } from 'ethers';
import { HyperEvmTransactionList } from './HyperEvmTransactionList';

interface HyperEvmAccountDetailsProps {
  address: string;
  rpcUrl: string;
}

export function HyperEvmAccountDetails({
  address,
  rpcUrl,
}: HyperEvmAccountDetailsProps) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError('');

        const provider = new JsonRpcProvider(rpcUrl, 999, {
          staticNetwork: true,
        });

        const balanceWei = await provider.getBalance(address);
        setBalance(formatEther(balanceWei));
      } catch (err: any) {
        setError(`Error loading balance: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [address, rpcUrl]);

  return (
    <div className="account-pane">
      <h2 className="pane-title">HyperEVM (L2) Overview</h2>

      <div className="account-section">
        <h3>Balance</h3>
        {loading && <div className="loading-state">Loading balance...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && (
          <div className="balance-display">
            <div className="balance-card">
              <div className="balance-label">HYPE Balance</div>
              <div className="balance-amount">
                {parseFloat(balance).toFixed(6)} HYPE
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="account-section">
        <h3>Transaction History</h3>
        <HyperEvmTransactionList address={address} rpcUrl={rpcUrl} />
      </div>
    </div>
  );
}
