'use client'

import { useCallback, useState, useMemo } from "react";
import { CoreWriterActionLog } from "./components/CoreWriterActionLog";
import { TransactionInfo } from "./components/TransactionInfo";
import { AllLogs } from "./components/AllLogs";
import { HyperCoreTransactionInfo } from "./components/HyperCoreTransactionInfo";
import { JsonRpcProvider, Log, Interface, TransactionResponse, TransactionReceipt, Block } from "ethers";
import { CORE_WRITER_ADDRESS } from "../constants/addresses";
import * as hl from "@nktkas/hyperliquid";

const MAINNET_RPC = "https://rpc.purroofgroup.com";
const TESTNET_RPC = "https://rpc.hyperliquid-testnet.xyz/evm";

const CORE_WRITER = new Interface([
  "event RawAction(address indexed user, bytes data)",
]);

type Network = "mainnet" | "testnet" | "custom";
type ChainType = "hyperevm" | "hypercore";

export default function Home() {
  const [txHash, setTxHash] = useState<string>(
    "0xfda27b7180779cfd99ebcd5a451bb68dead6d89fab8e508a7b5b6d137dccd51e"
  );
  const [network, setNetwork] = useState<Network>("mainnet");
  const [customRpc, setCustomRpc] = useState<string>("");
  const [chainType, setChainType] = useState<ChainType>("hyperevm");
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [block, setBlock] = useState<Block | null>(null);
  const [logs, setLogs] = useState<Array<Log>>([]);
  const [hyperCoreTx, setHyperCoreTx] = useState<hl.TxDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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
        setError("Transaction not found");
        setLoading(false);
        return;
      }
      setReceipt(receiptResult);

      // Fetch transaction details
      const transactionResult = await provider.getTransaction(tx);
      if (!transactionResult) {
        setError("Transaction details not found");
        setLoading(false);
        return;
      }
      setTransaction(transactionResult);

      // Fetch block information
      if (transactionResult.blockNumber) {
        try {
          const blockResult = await provider.getBlock(transactionResult.blockNumber);
          setBlock(blockResult);
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

      setLogs(coreWriterLogs);

      if (coreWriterLogs.length === 0) {
        console.log("No CoreWriter actions found in this transaction");
      }
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR') {
        setError('Network error: Please check your connection and try again.');
      } else if (err.code === 'INVALID_ARGUMENT') {
        setError('Invalid transaction hash format.');
      } else if (err.code === 'SERVER_ERROR') {
        setError('RPC server error: Please try again later.');
      } else {
        setError(`Error loading transaction: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const loadHyperCore = useCallback(async (tx: string) => {
    try {
      const transport = new hl.HttpTransport({
        isTestnet: network === "testnet"
      });
      const client = new hl.PublicClient({ transport });

      const result = await client.txDetails({ hash: tx as `0x${string}` });
      setHyperCoreTx(result.tx);
    } catch (err: any) {
      setError(`Error loading HyperCore transaction: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [network]);

  const load = useCallback(async (tx: string) => {
    setLogs([]);
    setTransaction(null);
    setReceipt(null);
    setBlock(null);
    setHyperCoreTx(null);
    setError("");

    if (tx === undefined || tx === "") {
      return Promise.resolve();
    }

    setLoading(true);

    if (chainType === "hyperevm") {
      await loadHyperEVM(tx);
    } else {
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
              value={txHash}
              onChange={(event) => setTxHash(event.currentTarget.value)}
              placeholder="0x..."
              className="text-input"
            />
            <button 
              onClick={() => txHash && load(txHash)} 
              disabled={loading}
              className="load-button"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {chainType === "hyperevm" && transaction && receipt && (
        <>
          <div className="results-section">
            <h2>Transaction Overview</h2>
            <TransactionInfo 
              transaction={transaction} 
              receipt={receipt} 
              block={block}
            />
          </div>

          <div className="results-section">
            <AllLogs logs={receipt.logs} />
          </div>

          {logs.length > 0 && (
            <div className="results-section">
              <h2>CoreWriter Actions ({logs.length})</h2>
              <div className="corewriter-actions">
                {logs.map((log, index) => (
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
