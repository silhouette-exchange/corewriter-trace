'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TransactionInfo } from '../components/TransactionInfo';
import { HyperCoreTransactionInfo } from '../components/HyperCoreTransactionInfo';
import { AllLogs } from '../components/AllLogs';
import { CoreWriterActionLog } from '../components/CoreWriterActionLog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  JsonRpcProvider,
  Log,
  Interface,
  TransactionResponse,
  TransactionReceipt,
  Block,
} from 'ethers';
import { CORE_WRITER_ADDRESS } from '../../constants/addresses';
import { isValidTxHash } from '../utils/validation';
import { searchBothChains } from '../utils/chainSearch';

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

type Network = 'mainnet' | 'testnet';
type ChainType = 'hyperevm' | 'hypercore';

export default function TransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const txHash = searchParams.get('hash') || '';
  const network = (searchParams.get('network') as Network) || 'mainnet';

  // Chain type determined by search result
  const [chainType, setChainType] = useState<ChainType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Separate results for HyperEVM (L2)
  const [hyperEvmTransaction, setHyperEvmTransaction] =
    useState<TransactionResponse | null>(null);
  const [hyperEvmReceipt, setHyperEvmReceipt] =
    useState<TransactionReceipt | null>(null);
  const [hyperEvmBlock, setHyperEvmBlock] = useState<Block | null>(null);
  const [hyperEvmLogs, setHyperEvmLogs] = useState<Array<Log>>([]);
  const [hyperEvmError, setHyperEvmError] = useState<string>('');
  const [hyperEvmLoading, setHyperEvmLoading] = useState(false);

  // Separate results for HyperCore (L1)
  const [hyperCoreTx, setHyperCoreTx] = useState<TxDetails | null>(null);
  const [hyperCoreError, setHyperCoreError] = useState<string>('');
  const [hyperCoreLoading, setHyperCoreLoading] = useState(false);

  const provider = useMemo(() => {
    const rpcUrl = network === 'testnet' ? TESTNET_RPC : MAINNET_RPC;
    return new JsonRpcProvider(rpcUrl, 999, {
      staticNetwork: true,
    });
  }, [network]);

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

  // Load transaction on mount
  useEffect(() => {
    const loadTransaction = async () => {
      if (!txHash) {
        setError('No transaction hash provided');
        setLoading(false);
        return;
      }

      // Validate transaction hash format
      if (!isValidTxHash(txHash)) {
        setError('Invalid transaction hash format');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setHyperEvmError('');
      setHyperCoreError('');

      // Try both chains in parallel using utility function
      const result = await searchBothChains(
        txHash,
        provider,
        network === 'testnet'
      );

      if (result?.chain === 'hyperevm') {
        // Transaction found on HyperEVM
        setChainType('hyperevm');
        setHyperEvmLogs([]);
        setHyperEvmTransaction(null);
        setHyperEvmReceipt(null);
        setHyperEvmBlock(null);
        setHyperEvmError('');
        setHyperEvmLoading(true);
        setLoading(false);
        await loadHyperEVM(txHash);
      } else if (result?.chain === 'hypercore') {
        // Transaction found on HyperCore
        setChainType('hypercore');
        setHyperCoreTx(null);
        setHyperCoreError('');
        setHyperCoreLoading(true);
        setLoading(false);
        await loadHyperCore(txHash);
      } else {
        // Not found on either chain
        setLoading(false);
        setError(
          'Transaction hash not found on either HyperEVM or HyperCore. Please check the hash and network settings.'
        );
      }
    };

    loadTransaction();
  }, [txHash, network, provider, loadHyperEVM, loadHyperCore]);

  return (
    <div className="App">
      <div className="header">
        <Link href="/" className="back-button">
          ← Back to Search
        </Link>
        <h1>Transaction Details</h1>
        <p className="subtitle">
          Network: <strong>{network === 'testnet' ? 'Testnet' : 'Mainnet'}</strong>
        </p>
      </div>

      {loading && (
        <LoadingSpinner 
          message="Searching for transaction on HyperEVM and HyperCore..." 
          size="large"
        />
      )}

      {error && <div className="error-message">{error}</div>}

      {chainType === 'hyperevm' && hyperEvmLoading && (
        <LoadingSpinner 
          message="Loading HyperEVM transaction details..." 
          size="large"
        />
      )}

      {chainType === 'hyperevm' && hyperEvmError && (
        <div className="error-message">{hyperEvmError}</div>
      )}

      {chainType === 'hypercore' && hyperCoreLoading && (
        <LoadingSpinner 
          message="Loading HyperCore transaction details..." 
          size="large"
        />
      )}

      {chainType === 'hypercore' && hyperCoreError && (
        <div className="error-message">{hyperCoreError}</div>
      )}

      {chainType === 'hyperevm' && hyperEvmTransaction && hyperEvmReceipt && !hyperEvmLoading && (
        <>
          <h2>HyperEVM Transaction Details</h2>
          <div className="results-section">
            <h3>Transaction Overview</h3>
            <TransactionInfo
              transaction={hyperEvmTransaction}
              receipt={hyperEvmReceipt}
              block={hyperEvmBlock}
              network={network}
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

      {chainType === 'hypercore' && hyperCoreTx && !hyperCoreLoading && (
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
