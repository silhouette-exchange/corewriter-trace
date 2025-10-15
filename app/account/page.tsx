'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { HyperEvmAccountDetails } from '../components/AccountDetails/HyperEvmAccountDetails';
import { HyperCoreAccountDetails } from '../components/AccountDetails/HyperCoreAccountDetails';

const MAINNET_RPC = 'https://rpc.purroofgroup.com';
const TESTNET_RPC = 'https://rpc.hyperliquid-testnet.xyz/evm';

type Network = 'mainnet' | 'testnet';

function AccountContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get('address');

  const [network, setNetwork] = useState<Network>('mainnet');

  const rpcUrl = useMemo(() => {
    return network === 'testnet' ? TESTNET_RPC : MAINNET_RPC;
  }, [network]);

  if (!address) {
    return (
      <div className="App">
        <div className="header">
          <h1>Account Details</h1>
          <p className="subtitle">No address provided</p>
        </div>
        <div className="error-message">
          Please provide an address in the URL: /account?address=0x...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Account Details</h1>
        <p className="subtitle">
          View account balances and transaction history across HyperEVM and
          HyperCore
        </p>
      </div>

      <div className="account-header">
        <div className="account-address-display">
          <span className="info-label">Address:</span>
          <code className="account-address-value">{address}</code>
        </div>

        <div className="network-selector">
          <label htmlFor="network">Network:</label>
          <select
            id="network"
            value={network}
            onChange={e => setNetwork(e.target.value as Network)}
            className="select-input"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>
      </div>

      <div className="account-panes-container">
        <HyperEvmAccountDetails address={address} rpcUrl={rpcUrl} />
        <HyperCoreAccountDetails
          address={address}
          isTestnet={network === 'testnet'}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="App">
          <div className="header">
            <h1>Account Details</h1>
            <p className="subtitle">Loading...</p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
