'use client';

import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedSearchBar } from './components/UnifiedSearchBar';
import { JsonRpcProvider } from 'ethers';
import { isValidTxHash } from './utils/validation';
import { searchBothChains } from './utils/chainSearch';

const MAINNET_RPC = 'https://rpc.purroofgroup.com';
const TESTNET_RPC = 'https://rpc.hyperliquid-testnet.xyz/evm';

type Network = 'mainnet' | 'testnet' | 'custom';

export default function Home() {
  const router = useRouter();

  // Unified search state
  const [searchInput, setSearchInput] = useState<string>('');
  const [network, setNetwork] = useState<Network>('mainnet');
  const [customRpc, setCustomRpc] = useState<string>('');
  const [customTestnet, setCustomTestnet] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const provider = useMemo(() => {
    let rpcUrl: string;

    if (network === 'custom') {
      rpcUrl = customRpc || MAINNET_RPC;
    } else if (network === 'testnet') {
      rpcUrl = TESTNET_RPC;
    } else {
      rpcUrl = MAINNET_RPC;
    }

    return new JsonRpcProvider(rpcUrl, 999, {
      staticNetwork: true,
    });
  }, [network, customRpc]);

  // Validation helpers
  const isValidAddress = (input: string): boolean => {
    const trimmed = input.trim();
    return (
      trimmed.startsWith('0x') &&
      trimmed.length === 42 &&
      /^0x[0-9a-fA-F]{40}$/.test(trimmed)
    );
  };

  const handleSearch = useCallback(async () => {
    const trimmedInput = searchInput.trim();

    if (!trimmedInput) {
      setError('Please enter a transaction hash or address');
      return;
    }

    // Reset previous states
    setError('');

    // Check if input is an address
    if (isValidAddress(trimmedInput)) {
      // Navigate to account details page with network parameter
      // Coerce 'custom' network to a supported value for /account page
      const coercedNetwork =
        network === 'custom'
          ? customTestnet
            ? 'testnet'
            : 'mainnet'
          : network;
      router.push(`/account?address=${trimmedInput}&network=${coercedNetwork}`);
      return;
    }

    // Check if input is a transaction hash
    if (isValidTxHash(trimmedInput)) {
      setLoading(true);

      // Try both chains in parallel using utility function
      const isTestnet =
        network === 'testnet' || (network === 'custom' && customTestnet);
      const result = await searchBothChains(trimmedInput, provider, isTestnet);

      if (result) {
        // Transaction found on at least one chain - redirect to transaction page
        const coercedNetwork =
          network === 'custom'
            ? customTestnet
              ? 'testnet'
              : 'mainnet'
            : network;
        setLoading(false);
        router.push(`/tx/${encodeURIComponent(trimmedInput)}?network=${coercedNetwork}`);
      } else {
        // Not found on either chain
        setLoading(false);
        setError(
          'Transaction hash not found on either HyperEVM or HyperCore. Please check the hash and network settings.'
        );
      }
      return;
    }

    // Invalid input
    setError(
      'Invalid input. Please enter a valid transaction hash (66 characters) or account address (42 characters).'
    );
  }, [searchInput, network, provider, router, customTestnet]);

  return (
    <div className="App">
      <div className="header">
        <h1>CoreWriter Trace</h1>
        <p className="subtitle">
          Search for transactions by hash or explore accounts by address
        </p>
      </div>

      <div className="config-section">
        <div className="form-group">
          <label htmlFor="network">Network</label>
          <select
            id="network"
            value={network}
            onChange={e => setNetwork(e.target.value as Network)}
            className="select-input"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
            <option value="custom">Custom RPC</option>
          </select>
        </div>

        {network === 'custom' && (
          <>
            <div className="form-group">
              <label htmlFor="customRpc">Custom RPC Endpoint</label>
              <input
                id="customRpc"
                type="text"
                value={customRpc}
                onChange={e => setCustomRpc(e.target.value)}
                placeholder="https://your-rpc-endpoint.com"
                className="text-input"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customTestnet}
                  onChange={e => setCustomTestnet(e.target.checked)}
                />
                <span>Custom RPC is Testnet</span>
              </label>
            </div>
          </>
        )}

        <UnifiedSearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
