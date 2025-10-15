'use client'

import { HyperCoreAccountState } from './HyperCoreAccountState';
import { HyperCoreTransactionList } from './HyperCoreTransactionList';

interface HyperCoreAccountDetailsProps {
  address: string;
  isTestnet: boolean;
}

export function HyperCoreAccountDetails({ address, isTestnet }: HyperCoreAccountDetailsProps) {
  return (
    <div className="account-pane">
      <h2 className="pane-title">HyperCore (L1) State</h2>
      
      <div className="account-section">
        <HyperCoreAccountState address={address} isTestnet={isTestnet} />
      </div>

      <div className="account-section">
        <h3>Transaction History</h3>
        <HyperCoreTransactionList address={address} isTestnet={isTestnet} />
      </div>
    </div>
  );
}
