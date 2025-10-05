import { useCallback, useState } from "react";
import "./App.css";
import { CoreWriterActionLog } from "./components/CoreWriterActionLog";
import { JsonRpcProvider, Log, Interface, JsonRpcApiProvider } from "ethers";

const PROVIDER_MAINNET = new JsonRpcProvider(
  "https://rpc.purroofgroup.com",
  999,
  {
    staticNetwork: true,
  }
);

const PROVIDER_TESTNET = new JsonRpcProvider(
  "https://rpc.hyperliquid-testnet.xyz/evm",
  998,
  {
    staticNetwork: true,
  }
);

const CORE_WRITER = new Interface([
  "event RawAction(address indexed user, bytes data)",
]);

function App() {
  const [txHash, setTxHash] = useState<string>(
    //"0xfda27b7180779cfd99ebcd5a451bb68dead6d89fab8e508a7b5b6d137dccd51e"
    "0xe9fd478f935e68dd708b9f90ca72703e753b27f92861c4db67554341e75ac2ad"
  );

  const [logs, setLogs] = useState<Array<Log>>([]);

  const [loading, setLoading] = useState(false);

  const load = useCallback((tx: string, provider: JsonRpcProvider) => {
    setLogs([]);

    if (tx === undefined) {
      return Promise.resolve();
    }

    setLoading(true);

    provider
      .getTransactionReceipt(tx)
      .then((result) => {
        const logs =
          result?.logs.filter(
            (log) =>
              log.address === "0x3333333333333333333333333333333333333333"
          ) ?? [];

        setLogs(logs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="App">
      <div>
        <span>TX Hash</span>
        <input
          value={txHash}
          onChange={(event) => setTxHash(event.currentTarget.value)}
        />
        <button onClick={() => txHash && load(txHash, PROVIDER_MAINNET)}>
          Load (Mainnet)
        </button>
        <button onClick={() => txHash && load(txHash, PROVIDER_TESTNET)}>
          Load (Testnet)
        </button>
      </div>
      {logs.map((log) => (
        <CoreWriterActionLog
          data={
            CORE_WRITER.decodeEventLog(
              CORE_WRITER.getEvent("RawAction")!,
              log.data
            )[1]
          }
        />
      ))}
    </div>
  );
}

export default App;
