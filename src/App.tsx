import { useCallback, useState } from "react";
import "./App.css";
import { CoreWriterActionLog } from "./components/CoreWriterActionLog";
import { JsonRpcProvider, Log, Interface } from "ethers";

const PROVIDER = new JsonRpcProvider("https://rpc.purroofgroup.com", 999, {
  staticNetwork: true,
});

const CORE_WRITER = new Interface([
  "event RawAction(address indexed user, bytes data)",
]);

function App() {
  const [txHash, setTxHash] = useState<string>(
    "0xb90a856ce6288858e26e5744819e0e45c90305f6810436b4f3b621cc29af796d"
  );

  const [logs, setLogs] = useState<Array<Log>>([]);

  const [loading, setLoading] = useState(false);

  const load = useCallback((tx: string) => {
    setLogs([]);

    if (tx === undefined) {
      return Promise.resolve();
    }

    setLoading(true);

    PROVIDER.getTransactionReceipt(tx)
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
        <button onClick={() => txHash && load(txHash)}>Load</button>
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
