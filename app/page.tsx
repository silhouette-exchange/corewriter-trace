'use client'

import { useCallback, useState, useMemo } from "react";
import { CoreWriterActionLog } from "./components/CoreWriterActionLog";
import { TransactionInfo } from "./components/TransactionInfo";
import { AllLogs } from "./components/AllLogs";
import { HyperCoreTransactionInfo } from "./components/HyperCoreTransactionInfo";
import { JsonRpcProvider, Log, Interface, TransactionResponse, TransactionReceipt, Block } from "ethers";
import { CORE_WRITER_ADDRESS } from "../constants/addresses";
import * as hl from "@nktkas/hyperliquid";

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

const MAINNET_RPC = "https://rpc.purroofgroup.com";
const TESTNET_RPC = "https://rpc.hyperliquid-testnet.xyz/evm";

const CORE_WRITER = new Interface([
  "event RawAction(address indexed user, bytes data)",
]);

type Network = "mainnet" | "testnet" | "custom";
type ChainType = "hyperevm" | "hypercore";

export default function Home() {
  // Separate state for each chain type
  const [hyperEvmTxHash, setHyperEvmTxHash] = useState<string>(
    "0xfda27b7180779cfd99ebcd5a451bb68dead6d89fab8e508a7b5b6d137dccd51e"
  );
  const [hyperCoreTxHash, setHyperCoreTxHash] = useState<string>("");
  
  const [network, setNetwork] = useState<Network>("mainnet");
  const [customRpc, setCustomRpc] = useState<string>("");
  const [chainType, setChainType] = useState<ChainType>("hyperevm");
  
  // Separate results for HyperEVM (L2)
  const [hyperEvmTransaction, setHyperEvmTransaction] = useState<TransactionResponse | null>(null);
  const [hyperEvmReceipt, setHyperEvmReceipt] = useState<TransactionReceipt | null>(null);
  const [hyperEvmBlock, setHyperEvmBlock] = useState<Block | null>(null);
  const [hyperEvmLogs, setHyperEvmLogs] = useState<Array<Log>>([]);
  const [hyperEvmError, setHyperEvmError] = useState<string>("");
  const [hyperEvmLoading, setHyperEvmLoading] = useState(false);
  
  // Separate results for HyperCore (L1)
  const [hyperCoreTx, setHyperCoreTx] = useState<TxDetails | null>(null);
  const [hyperCoreError, setHyperCoreError] = useState<string>("");
  const [hyperCoreLoading, setHyperCoreLoading] = useState(false);

  const provider = useMemo(() => {
    let rpcUrl: string;
    
    if (network === "custom") {
      rpcUrl = customRpc || MAINNET_RPC;
    } else if (network === "testnet") {
      rpcUrl = TESTNET_RPC;
    } else {
      rpcUrl = MAINNET_RPC;
    }

    return new JsonRpcProvider(rpcUrl, 999, {
      staticNetwork: true,
    });
  }, [network, customRpc]);

  const loadHyperEVM = useCallback(async (tx: string) => {
    try {
      // Fetch transaction receipt
      const receiptResult = await provider.getTransactionReceipt(tx);
      if (!receiptResult) {
        setHyperEvmError("Transaction not found");
        setHyperEvmLoading(false);
        return;
      }
      setHyperEvmReceipt(receiptResult);

      // Fetch transaction details
      const transactionResult = await provider.getTransaction(tx);
      if (!transactionResult) {
        setHyperEvmError("Transaction details not found");
        setHyperEvmLoading(false);
        return;
      }
      setHyperEvmTransaction(transactionResult);

      // Fetch block information
      if (transactionResult.blockNumber) {
        try {
          const blockResult = await provider.getBlock(transactionResult.blockNumber);
          setHyperEvmBlock(blockResult);
        } catch (err) {
          console.warn("Could not fetch block information:", err);
        }
      }

      // Filter CoreWriter logs
      const coreWriterLogs =
        receiptResult?.logs.filter(
          (log) =>
            log.address.toLowerCase() === CORE_WRITER_ADDRESS.toLowerCase()
        ) ?? [];

      setHyperEvmLogs(coreWriterLogs);

      if (coreWriterLogs.length === 0) {
        console.log("No CoreWriter actions found in this transaction");
      }
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        setHyperEvmError('Network error: Please check your connection and try again.');
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
  }, [provider]);

  const loadHyperCore = useCallback(async (tx: string) => {
    try {
      const transport = new hl.HttpTransport({
        isTestnet: network === "testnet"
      });
      const client = new hl.InfoClient({ transport });

      const result = await client.txDetails({ hash: tx as `0x${string}` });
      setHyperCoreTx(result.tx);
    } catch (err: any) {
      setHyperCoreError(`Error loading HyperCore transaction: ${err.message || 'Unknown error'}`);
    } finally {
      setHyperCoreLoading(false);
    }
  }, [network]);

  const load = useCallback(async (tx: string) => {
    if (tx === undefined || tx === "") {
      return Promise.resolve();
    }

    if (chainType === "hyperevm") {
      setHyperEvmLogs([]);
      setHyperEvmTransaction(null);
      setHyperEvmReceipt(null);
      setHyperEvmBlock(null);
      setHyperEvmError("");
      setHyperEvmLoading(true);
      await loadHyperEVM(tx);
    } else {
      setHyperCoreTx(null);
      setHyperCoreError("");
      setHyperCoreLoading(true);
      await loadHyperCore(tx);
    }
  }, [chainType, loadHyperEVM, loadHyperCore]);

  return (
    <div className="App">
      <div className="header">
        <h1>CoreWriter Trace</h1>
        <p className="subtitle">View comprehensive transaction information and decode CoreWriter actions</p>
      </div>

      <div className="tab-switcher">
        <button 
          className={`tab-button ${chainType === "hyperevm" ? "active" : ""}`}
          onClick={() => setChainType("hyperevm")}
        >
          HyperEVM (L2)
        </button>
        <button 
          className={`tab-button ${chainType === "hypercore" ? "active" : ""}`}
          onClick={() => setChainType("hypercore")}
        >
          HyperCore (L1)
        </button>
      </div>

      <div className="config-section">
        <div className="form-group">
          <label htmlFor="network">Network</label>
          <select
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            className="select-input"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
            <option value="custom">Custom RPC</option>
          </select>
        </div>

        {network === "custom" && (
          <div className="form-group">
            <label htmlFor="customRpc">Custom RPC Endpoint</label>
            <input
              id="customRpc"
              type="text"
              value={customRpc}
              onChange={(e) => setCustomRpc(e.target.value)}
              placeholder="https://your-rpc-endpoint.com"
              className="text-input"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="txHash">Transaction Hash</label>
          <div className="input-button-group">
            <input
              id="txHash"
              type="text"
              value={chainType === "hyperevm" ? hyperEvmTxHash : hyperCoreTxHash}
              onChange={(event) => {
                const newHash = event.currentTarget.value;
                if (chainType === "hyperevm") {
                  setHyperEvmTxHash(newHash);
                } else {
                  setHyperCoreTxHash(newHash);
                }
              }}
              placeholder="0x..."
              className="text-input"
            />
            <button 
              onClick={() => {
                const txHash = chainType === "hyperevm" ? hyperEvmTxHash : hyperCoreTxHash;
                txHash && load(txHash);
              }} 
              disabled={chainType === "hyperevm" ? hyperEvmLoading : hyperCoreLoading}
              className="load-button"
            >
              {(chainType === "hyperevm" ? hyperEvmLoading : hyperCoreLoading) ? "Loading..." : "Load"}
            </button>
          </div>
        </div>
      </div>

      {chainType === "hyperevm" && hyperEvmError && (
        <div className="error-message">
          {hyperEvmError}
        </div>
      )}

      {chainType === "hypercore" && hyperCoreError && (
        <div className="error-message">
          {hyperCoreError}
        </div>
      )}

      {chainType === "hyperevm" && hyperEvmTransaction && hyperEvmReceipt && (
        <>
          <div className="results-section">
            <h2>Transaction Overview</h2>
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
              <h2>CoreWriter Actions ({hyperEvmLogs.length})</h2>
              <div className="corewriter-actions">
                {hyperEvmLogs.map((log, index) => (
                  <CoreWriterActionLog
                    key={index}
                    data={
                      CORE_WRITER.decodeEventLog(
                        CORE_WRITER.getEvent("RawAction")!,
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

      {chainType === "hypercore" && hyperCoreTx && (
        <div className="results-section">
          <h2>HyperCore Transaction Details</h2>
          <HyperCoreTransactionInfo txDetails={hyperCoreTx} />
        </div>
      )}
    </div>
  );
}
