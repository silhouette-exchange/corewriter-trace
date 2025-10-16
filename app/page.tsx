'use client';

import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CoreWriterActionLog } from './components/CoreWriterActionLog';
import { TransactionInfo } from './components/TransactionInfo';
import { AllLogs } from './components/AllLogs';
import { HyperCoreTransactionInfo } from './components/HyperCoreTransactionInfo';
import { UnifiedSearchBar } from './components/UnifiedSearchBar';
import {
  JsonRpcProvider,
  Log,
  Interface,
  TransactionResponse,
  TransactionReceipt,
  Block,
} from 'ethers';
import { CORE_WRITER_ADDRESS } from '../constants/addresses';
import * as hl from '@nktkas/hyperliquid';
import { HttpTransportOptions } from '@nktkas/hyperliquid';

// Define the transaction details type based on the API response structure
interface TxDetails {
  action: {
    type: string;
    [key: string]: unknown;
  };
  block: number;
  error: string | null;
  hash: string;
  time: number;
  user: string;
}

const MAINNET_RPC = 'https://rpc.purroofgroup.com';
const TESTNET_RPC = 'https://rpc.hyperliquid-testnet.xyz/evm';

const CORE_WRITER = new Interface([
  'event RawAction(address indexed user, bytes data)',
]);

type Network = 'mainnet' | 'testnet' | 'custom';
type ChainType = 'hyperevm' | 'hypercore';

export default function Home() {
  const router = useRouter();

  // Unified search state
  const [searchInput, setSearchInput] = useState<string>('');
  const [network, setNetwork] = useState<Network>('mainnet');
  const [customRpc, setCustomRpc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Chain type determined by search result
  const [chainType, setChainType] = useState<ChainType | null>(null);

  // Separate results for HyperEVM (L2)
  const [hyperEvmTransaction, setHyperEvmTransaction] =
    useState<TransactionResponse | null>(null);
  const [hyperEvmReceipt, setHyperEvmReceipt] =
    useState<TransactionReceipt | null>(null);
  const [hyperEvmBlock, setHyperEvmBlock] = useState<Block | null>(null);
  const [hyperEvmLogs, setHyperEvmLogs] = useState<Array<Log>>([]);
  const [hyperEvmError, setHyperEvmError] = useState<string>('');
  const [_hyperEvmLoading, setHyperEvmLoading] = useState(false);

  // Separate results for HyperCore (L1)
  const [hyperCoreTx, setHyperCoreTx] = useState<TxDetails | null>(null);
  const [hyperCoreError, setHyperCoreError] = useState<string>('');
  const [_hyperCoreLoading, setHyperCoreLoading] = useState(false);

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

  const loadHyperEVM = useCallback(
    async (tx: string) => {
      try {
        // Fetch transaction receipt
        const receiptResult = await provider.getTransactionReceipt(tx);
        if (!receiptResult) {
          setHyperEvmError('Transaction not found');
          setHyperEvmLoading(false);
          return;
        }
        setHyperEvmReceipt(receiptResult);

        // Fetch transaction details
        const transactionResult = await provider.getTransaction(tx);
        if (!transactionResult) {
          setHyperEvmError('Transaction details not found');
          setHyperEvmLoading(false);
          return;
        }
        setHyperEvmTransaction(transactionResult);

        // Fetch block information
        if (transactionResult.blockNumber) {
          try {
            const blockResult = await provider.getBlock(
              transactionResult.blockNumber
            );
            setHyperEvmBlock(blockResult);
          } catch (err) {
            console.warn('Could not fetch block information:', err);
          }
        }

        // Filter CoreWriter logs
        const coreWriterLogs =
          receiptResult?.logs.filter(
            log =>
              log.address.toLowerCase() === CORE_WRITER_ADDRESS.toLowerCase()
          ) ?? [];

        setHyperEvmLogs(coreWriterLogs);

        if (coreWriterLogs.length === 0) {
          console.log('No CoreWriter actions found in this transaction');
        }
      } catch (err: any) {
        if (err.code === 'NETWORK_ERROR') {
          setHyperEvmError(
            'Network error: Please check your connection and try again.'
          );
        } else if (err.code === 'INVALID_ARGUMENT') {
          setHyperEvmError('Invalid transaction hash format.');
        } else if (err.code === 'SERVER_ERROR') {
          setHyperEvmError('RPC server error: Please try again later.');
        } else {
          setHyperEvmError(`Error loading transaction: ${err.message}`);
        }
      } finally {
        setHyperEvmLoading(false);
      }
    },
    [provider]
  );

  const loadHyperCore = useCallback(
    async (tx: string) => {
      try {
        const transportConfig: HttpTransportOptions = {
          isTestnet: network === 'testnet',
        };

        const transport = new hl.HttpTransport(transportConfig);
        const client = new hl.InfoClient({ transport });

        const result = await client.txDetails({ hash: tx as `0x${string}` });
        setHyperCoreTx(result.tx);
      } catch (err: any) {
        setHyperCoreError(
          `Error loading HyperCore transaction: ${err.message || 'Unknown error'}`
        );
      } finally {
        setHyperCoreLoading(false);
      }
    },
    [network]
  );

  // Validation helpers
  const isValidAddress = (input: string): boolean => {
    const trimmed = input.trim();
    return (
      trimmed.startsWith('0x') &&
      trimmed.length === 42 &&
      /^0x[0-9a-fA-F]{40}$/.test(trimmed)
    );
  };

  const isValidTxHash = (input: string): boolean => {
    const trimmed = input.trim();
    return (
      trimmed.startsWith('0x') &&
      trimmed.length === 66 &&
      /^0x[0-9a-fA-F]{64}$/.test(trimmed)
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
    setHyperEvmError('');
    setHyperCoreError('');
    setChainType(null);

    // Check if input is an address
    if (isValidAddress(trimmedInput)) {
      // Navigate to account details page with network parameter
      router.push(`/account?address=${trimmedInput}&network=${network}`);
      return;
    }

    // Check if input is a transaction hash
    if (isValidTxHash(trimmedInput)) {
      setLoading(true);

      // Try both chains in parallel
      const hyperEvmPromise = (async () => {
        try {
          const receipt = await provider.getTransactionReceipt(trimmedInput);
          return receipt ? { chain: 'hyperevm' as const, receipt } : null;
        } catch {
          return null;
        }
      })();

      const hyperCorePromise = (async () => {
        try {
          const transportConfig: HttpTransportOptions = {
            isTestnet: network === 'testnet',
          };
          const transport = new hl.HttpTransport(transportConfig);
          const client = new hl.InfoClient({ transport });
          const result = await client.txDetails({
            hash: trimmedInput as `0x${string}`,
          });
          return result.tx
            ? { chain: 'hypercore' as const, tx: result.tx }
            : null;
        } catch {
          return null;
        }
      })();

      const results = await Promise.all([hyperEvmPromise, hyperCorePromise]);
      const hyperEvmResult = results[0];
      const hyperCoreResult = results[1];

      if (hyperEvmResult) {
        // Transaction found on HyperEVM
        setChainType('hyperevm');
        setHyperEvmLogs([]);
        setHyperEvmTransaction(null);
        setHyperEvmReceipt(null);
        setHyperEvmBlock(null);
        setHyperEvmError('');
        setHyperEvmLoading(true);
        setLoading(false);
        await loadHyperEVM(trimmedInput);
      } else if (hyperCoreResult) {
        // Transaction found on HyperCore
        setChainType('hypercore');
        setHyperCoreTx(null);
        setHyperCoreError('');
        setHyperCoreLoading(true);
        setLoading(false);
        await loadHyperCore(trimmedInput);
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
  }, [searchInput, network, provider, router, loadHyperEVM, loadHyperCore]);

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
        )}

        <UnifiedSearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {chainType === 'hyperevm' && hyperEvmError && (
        <div className="error-message">{hyperEvmError}</div>
      )}

      {chainType === 'hypercore' && hyperCoreError && (
        <div className="error-message">{hyperCoreError}</div>
      )}

      {chainType === 'hyperevm' && hyperEvmTransaction && hyperEvmReceipt && (
        <>
          <h2>HyperEVM Transaction Details</h2>
          <div className="results-section">
            <h3>Transaction Overview</h3>
            <TransactionInfo
              transaction={hyperEvmTransaction}
              receipt={hyperEvmReceipt}
              block={hyperEvmBlock}
            />
          </div>

          <div className="results-section">
            <AllLogs logs={[...hyperEvmReceipt.logs]} />
          </div>

          {hyperEvmLogs.length > 0 && (
            <div className="results-section">
              <h3>CoreWriter Actions ({hyperEvmLogs.length})</h3>
              <div className="corewriter-actions">
                {hyperEvmLogs.map((log, index) => (
                  <CoreWriterActionLog
                    key={index}
                    data={
                      CORE_WRITER.decodeEventLog(
                        CORE_WRITER.getEvent('RawAction')!,
                        log.data,
                        log.topics
                      )[1]
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {chainType === 'hypercore' && hyperCoreTx && (
        <div className="results-section">
          <h2>HyperCore Transaction Details</h2>
          <HyperCoreTransactionInfo
            txDetails={hyperCoreTx}
            isTestnet={network === 'testnet'}
          />
        </div>
      )}
    </div>
  );
}
