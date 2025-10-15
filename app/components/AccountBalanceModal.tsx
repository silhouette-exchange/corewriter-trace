'use client';

import { useState, useEffect } from 'react';
import * as hl from '@nktkas/hyperliquid';

interface AccountBalanceModalProps {
  address: string;
  isTestnet: boolean;
  onClose: () => void;
}

interface SpotBalance {
  coin: string;
  token: number;
  total: string;
  hold: string;
  entryNtl: string;
}

interface AssetPosition {
  type: string;
  position: {
    coin: string;
    szi: string;
    leverage: {
      type: string;
      value: number;
      rawUsd?: string;
    };
    entryPx: string;
    positionValue: string;
    unrealizedPnl: string;
    returnOnEquity: string;
    liquidationPx: string | null;
    marginUsed: string;
    maxLeverage: number;
    cumFunding: {
      allTime: string;
      sinceOpen: string;
      sinceChange: string;
    };
  };
}

interface MarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}

interface ClearinghouseState {
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: AssetPosition[];
  time: number;
}

interface SpotClearinghouseState {
  balances: SpotBalance[];
  evmEscrows?: Array<{
    coin: string;
    token: number;
    total: string;
  }>;
}

export function AccountBalanceModal({
  address,
  isTestnet,
  onClose,
}: AccountBalanceModalProps) {
  const [spotBalances, setSpotBalances] =
    useState<SpotClearinghouseState | null>(null);
  const [perpState, setPerpState] = useState<ClearinghouseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        setError('');

        const transportConfig: hl.HttpTransportOptions = {
          isTestnet,
        };

        const transport = new hl.HttpTransport(transportConfig);
        const client = new hl.InfoClient({ transport });

        // Fetch both spot and perpetual balances in parallel
        const [spotResult, perpResult] = await Promise.all([
          client.spotClearinghouseState({ user: address as `0x${string}` }),
          client.clearinghouseState({ user: address as `0x${string}` }),
        ]);

        setSpotBalances(spotResult);
        setPerpState(perpResult);
      } catch (err: any) {
        setError(`Error loading balances: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [address, isTestnet]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Account Balance</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-address">
            <span className="info-label">Address:</span>
            <span className="hash-value">{address}</span>
          </div>

          {loading && <div className="loading-state">Loading balances...</div>}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
            <>
              {/* Perpetual Balances Section */}
              <div className="balance-section">
                <h3>Perpetual Trading</h3>
                {perpState && (
                  <>
                    <div className="balance-summary">
                      <div className="balance-row">
                        <span className="balance-label">Account Value:</span>
                        <span className="balance-value">
                          ${perpState.marginSummary.accountValue}
                        </span>
                      </div>
                      <div className="balance-row">
                        <span className="balance-label">Withdrawable:</span>
                        <span className="balance-value">
                          ${perpState.withdrawable}
                        </span>
                      </div>
                      <div className="balance-row">
                        <span className="balance-label">
                          Total Margin Used:
                        </span>
                        <span className="balance-value">
                          ${perpState.marginSummary.totalMarginUsed}
                        </span>
                      </div>
                      <div className="balance-row">
                        <span className="balance-label">
                          Total Position Value:
                        </span>
                        <span className="balance-value">
                          ${perpState.marginSummary.totalNtlPos}
                        </span>
                      </div>
                    </div>

                    {perpState.assetPositions.length > 0 && (
                      <div className="positions-section">
                        <h4>
                          Open Positions ({perpState.assetPositions.length})
                        </h4>
                        {perpState.assetPositions.map((position, idx) => (
                          <div key={idx} className="position-card">
                            <div className="position-header">
                              <span className="position-coin">
                                {position.position.coin}
                              </span>
                              <span
                                className={`position-side ${parseFloat(position.position.szi) > 0 ? 'long' : 'short'}`}
                              >
                                {parseFloat(position.position.szi) > 0
                                  ? 'LONG'
                                  : 'SHORT'}
                              </span>
                            </div>
                            <div className="position-details">
                              <div className="position-row">
                                <span>Size:</span>
                                <span>
                                  {Math.abs(
                                    parseFloat(position.position.szi)
                                  ).toFixed(4)}
                                </span>
                              </div>
                              <div className="position-row">
                                <span>Entry Price:</span>
                                <span>${position.position.entryPx}</span>
                              </div>
                              <div className="position-row">
                                <span>Position Value:</span>
                                <span>${position.position.positionValue}</span>
                              </div>
                              <div className="position-row">
                                <span>Unrealized PnL:</span>
                                <span
                                  className={
                                    parseFloat(
                                      position.position.unrealizedPnl
                                    ) >= 0
                                      ? 'positive'
                                      : 'negative'
                                  }
                                >
                                  ${position.position.unrealizedPnl}
                                </span>
                              </div>
                              <div className="position-row">
                                <span>Leverage:</span>
                                <span>
                                  {position.position.leverage.value}x (
                                  {position.position.leverage.type})
                                </span>
                              </div>
                              {position.position.liquidationPx && (
                                <div className="position-row">
                                  <span>Liquidation Price:</span>
                                  <span className="warning">
                                    ${position.position.liquidationPx}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {perpState.assetPositions.length === 0 && (
                      <div className="empty-state">
                        No open perpetual positions
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Spot Balances Section */}
              <div className="balance-section">
                <h3>Spot Balances</h3>
                {spotBalances && spotBalances.balances.length > 0 ? (
                  <div className="balances-table">
                    <div className="balance-table-header">
                      <span>Asset</span>
                      <span>Total</span>
                      <span>On Hold</span>
                      <span>Available</span>
                    </div>
                    {spotBalances.balances.map((balance, idx) => {
                      const total = parseFloat(balance.total);
                      const hold = parseFloat(balance.hold);
                      const available = total - hold;

                      return (
                        <div key={idx} className="balance-table-row">
                          <span className="asset-name">{balance.coin}</span>
                          <span>{total.toFixed(6)}</span>
                          <span>{hold.toFixed(6)}</span>
                          <span>{available.toFixed(6)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">No spot balances</div>
                )}

                {spotBalances?.evmEscrows &&
                  spotBalances.evmEscrows.length > 0 && (
                    <div className="escrow-section">
                      <h4>Escrowed Balances</h4>
                      {spotBalances.evmEscrows.map((escrow, idx) => (
                        <div key={idx} className="escrow-row">
                          <span>{escrow.coin}:</span>
                          <span>{escrow.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
