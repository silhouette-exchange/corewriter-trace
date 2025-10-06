'use client'

import * as hl from "@nktkas/hyperliquid";

interface HyperCoreTransactionInfoProps {
  txDetails: hl.TxDetails;
}

export function HyperCoreTransactionInfo({ txDetails }: HyperCoreTransactionInfoProps) {
  return (
    <div className="transaction-info">
      <div className="info-grid">
        <div className="info-row">
          <span className="info-label">Transaction Hash:</span>
          <span className="info-value hash-value">{txDetails.hash}</span>
        </div>

        <div className="info-row">
          <span className="info-label">User:</span>
          <span className="info-value hash-value">{txDetails.user}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Block:</span>
          <span className="info-value">{txDetails.block}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Time:</span>
          <span className="info-value">
            {new Date(txDetails.time).toLocaleString()}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Action Type:</span>
          <span className="info-value">{txDetails.action.type}</span>
        </div>

        {txDetails.error && (
          <div className="info-row">
            <span className="info-label">Error:</span>
            <span className="info-value error-value">{txDetails.error}</span>
          </div>
        )}

        {Object.keys(txDetails.action).length > 1 && (
          <div className="info-row full-width">
            <span className="info-label">Action Details:</span>
            <pre className="info-value json-value">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(txDetails.action).filter(([key]) => key !== "type")
                ),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
