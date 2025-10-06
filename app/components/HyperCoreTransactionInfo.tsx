'use client'

import { useState } from 'react';
import * as hl from "@nktkas/hyperliquid";
import { AccountBalanceModal } from './AccountBalanceModal';

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

interface HyperCoreTransactionInfoProps {
  txDetails: TxDetails;
  isTestnet: boolean;
}

// Helper function to format order data into human-readable format
function formatOrderAction(actionData: any) {
  if (!actionData.orders || !Array.isArray(actionData.orders)) {
    return actionData;
  }

  const formatOrder = (order: any) => ({
    asset: order.a,
    isBuy: order.b,
    price: order.p,
    size: order.s,
    reduceOnly: order.r,
    orderType: order.t?.limit ? 'Limit' : order.t?.trigger ? 'Trigger' : 'Unknown',
    timeInForce: order.t?.limit?.tif || null,
    triggerDetails: order.t?.trigger ? {
      isMarket: order.t.trigger.isMarket,
      triggerPrice: order.t.trigger.triggerPx,
      tpsl: order.t.trigger.tpsl
    } : null,
    clientOrderId: order.c || null
  });

  return {
    orders: actionData.orders.map(formatOrder),
    grouping: actionData.grouping,
    builder: actionData.builder ? {
      builderAddress: actionData.builder.b,
      feeInTenthsOfBasisPoint: actionData.builder.f
    } : null
  };
}

export function HyperCoreTransactionInfo({ txDetails, isTestnet }: HyperCoreTransactionInfoProps) {
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  return (
    <div className="transaction-info">
      <div className="info-grid">
        <div className="info-row">
          <span className="info-label">Transaction Hash:</span>
          <span className="info-value hash-value">{txDetails.hash}</span>
        </div>

        <div className="info-row">
          <span className="info-label">User:</span>
          <button 
            type="button"
            className="info-value hash-value clickable-address" 
            onClick={() => setShowBalanceModal(true)}
            title="Click to view balance"
            aria-label="View account balance for this address"
          >
            {txDetails.user}
          </button>
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
                formatOrderAction(
                  Object.fromEntries(
                    Object.entries(txDetails.action).filter(([key]) => key !== "type")
                  )
                ),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {showBalanceModal && (
        <AccountBalanceModal 
          address={txDetails.user}
          isTestnet={isTestnet}
          onClose={() => setShowBalanceModal(false)}
        />
      )}
    </div>
  );
}
