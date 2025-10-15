import {
  TransactionResponse,
  TransactionReceipt,
  Block,
  formatEther,
} from 'ethers';
import { useCallback, useMemo } from 'react';
import Link from 'next/link';

interface TransactionInfoProps {
  transaction: TransactionResponse;
  receipt: TransactionReceipt;
  block: Block | null;
}

export const TransactionInfo = ({
  transaction,
  receipt,
  block,
}: TransactionInfoProps) => {
  const formatGasPrice = useCallback((gasPrice: bigint | null) => {
    if (!gasPrice) return 'N/A';
    const gwei = Number(gasPrice) / 1e9;
    return `${gwei.toFixed(2)} Gwei`;
  }, []);

  const formatTimestamp = useCallback((timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }, []);

  const { totalGasFee, effectiveGasPrice } = useMemo(() => {
    // Use effectiveGasPrice for EIP-1559 transactions, fallback to gasPrice for legacy transactions
    const gasPrice =
      (receipt as any).effectiveGasPrice || transaction.gasPrice || BigInt(0);
    try {
      return {
        totalGasFee: receipt.gasUsed * gasPrice,
        effectiveGasPrice: gasPrice,
      };
    } catch (error) {
      console.warn('Gas fee calculation overflow:', error);
      return {
        totalGasFee: BigInt(0),
        effectiveGasPrice: gasPrice,
      };
    }
  }, [
    receipt.gasUsed,
    (receipt as any).effectiveGasPrice,
    transaction.gasPrice,
  ]);

  return (
    <div className="transaction-info-container">
      <div className="info-section">
        <h3>Transaction Details</h3>
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-label">Transaction Hash:</td>
              <td className="info-value">
                <code>{transaction.hash}</code>
              </td>
            </tr>
            <tr>
              <td className="info-label">Status:</td>
              <td className="info-value">
                <span
                  className={`status-badge ${receipt.status === 1 ? 'status-success' : 'status-failed'}`}
                >
                  {receipt.status === 1 ? '✓ Success' : '✗ Failed'}
                </span>
              </td>
            </tr>
            <tr>
              <td className="info-label">Block Number:</td>
              <td className="info-value">{transaction.blockNumber}</td>
            </tr>
            {block && (
              <tr>
                <td className="info-label">Timestamp:</td>
                <td className="info-value">
                  {formatTimestamp(block.timestamp)}
                </td>
              </tr>
            )}
            <tr>
              <td className="info-label">From:</td>
              <td className="info-value">
                <code>
                  <Link
                    href={`/account?address=${transaction.from}`}
                    className="clickable-address"
                  >
                    {transaction.from}
                  </Link>
                </code>
              </td>
            </tr>
            <tr>
              <td className="info-label">To:</td>
              <td className="info-value">
                <code>
                  {transaction.to ? (
                    <Link
                      href={`/account?address=${transaction.to}`}
                      className="clickable-address"
                    >
                      {transaction.to}
                    </Link>
                  ) : (
                    'Contract Creation'
                  )}
                </code>
              </td>
            </tr>
            <tr>
              <td className="info-label">Value:</td>
              <td className="info-value">
                {formatEther(transaction.value)} ETH
                {transaction.value > BigInt(0) && (
                  <span className="info-secondary">
                    {' '}
                    ({transaction.value.toString()} wei)
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="info-section">
        <h3>Gas Details</h3>
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-label">Gas Limit:</td>
              <td className="info-value">{transaction.gasLimit.toString()}</td>
            </tr>
            <tr>
              <td className="info-label">Gas Used:</td>
              <td className="info-value">
                {receipt.gasUsed.toString()}
                <span className="info-secondary">
                  {' '}
                  (
                  {(
                    (Number(receipt.gasUsed) / Number(transaction.gasLimit)) *
                    100
                  ).toFixed(2)}
                  % of limit)
                </span>
              </td>
            </tr>
            <tr>
              <td className="info-label">Gas Price:</td>
              <td className="info-value">
                {formatGasPrice(effectiveGasPrice)}
              </td>
            </tr>
            <tr>
              <td className="info-label">Transaction Fee:</td>
              <td className="info-value">
                {formatEther(totalGasFee)} ETH
                <span className="info-secondary">
                  {' '}
                  ({totalGasFee.toString()} wei)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="info-section">
        <h3>Additional Information</h3>
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-label">Nonce:</td>
              <td className="info-value">{transaction.nonce}</td>
            </tr>
            <tr>
              <td className="info-label">Transaction Index:</td>
              <td className="info-value">{receipt.index}</td>
            </tr>
            <tr>
              <td className="info-label">Input Data:</td>
              <td className="info-value">
                {Math.max(0, Math.floor((transaction.data.length - 2) / 2))}{' '}
                bytes
                {transaction.data !== '0x' && (
                  <details className="data-details">
                    <summary>View Data</summary>
                    <code className="data-hex">{transaction.data}</code>
                  </details>
                )}
              </td>
            </tr>
            <tr>
              <td className="info-label">Logs Count:</td>
              <td className="info-value">{receipt.logs.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
