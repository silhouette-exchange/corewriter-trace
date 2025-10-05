'use client'

import { useCallback, useState, useMemo } from "react";
import { CoreWriterActionLog } from "./components/CoreWriterActionLog";
import { JsonRpcProvider, Log, Interface } from "ethers";

const MAINNET_RPC = "https://rpc.purroofgroup.com";
const TESTNET_RPC = "https://rpc.hyperliquid-testnet.xyz/evm";

const CORE_WRITER = new Interface([
  "event RawAction(address indexed user, bytes data)",
]);

type Network = "mainnet" | "testnet" | "custom";

export default function Home() {
  const [txHash, setTxHash] = useState<string>(
    "0xfda27b7180779cfd99ebcd5a451bb68dead6d89fab8e508a7b5b6d137dccd51e"
  );
  const [network, setNetwork] = useState<Network>("mainnet");
  const [customRpc, setCustomRpc] = useState<string>("");
  const [logs, setLogs] = useState<Array<Log>>([]);
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

  const load = useCallback((tx: string) => {
    setLogs([]);
    setError("");

    if (tx === undefined || tx === "") {
      return Promise.resolve();
    }

    setLoading(true);

    provider.getTransactionReceipt(tx)
      .then((result) => {
        if (!result) {
          setError("Transaction not found");
          return;
        }

        const logs =
          result?.logs.filter(
            (log) =>
              log.address === "0x3333333333333333333333333333333333333333"
          ) ?? [];

        if (logs.length === 0) {
          setError("No CoreWriter actions found in this transaction");
        }

        setLogs(logs);
      })
      .catch((err) => {
        setError(`Error loading transaction: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div className="App">
      <div className="header">
        <h1>CoreWriter Trace</h1>
        <p className="subtitle">Decode Hyperliquid CoreWriter actions from transaction logs</p>
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

      {logs.length > 0 && (
        <div className="results-section">
          <h2>CoreWriter Actions ({logs.length})</h2>
          {logs.map((log, index) => (
            <CoreWriterActionLog
              key={index}
              data={
                CORE_WRITER.decodeEventLog(
                  CORE_WRITER.getEvent("RawAction")!,
                  log.data
                )[1]
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

