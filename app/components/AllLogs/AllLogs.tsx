import { Log } from "ethers";
import { useState } from "react";
import { CORE_WRITER_ADDRESS } from "../../constants/addresses";

interface AllLogsProps {
  logs: Log[];
}

interface LogEntryProps {
  log: Log;
  index: number;
  isCoreWriter: boolean;
}

const LogEntry = ({ log, index, isCoreWriter }: LogEntryProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(!expanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`log-entry ${isCoreWriter ? 'log-corewriter' : ''}`}>
      <div 
        className="log-header" 
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`log-details-${log.index}`}
        onKeyDown={handleKeyDown}
      >
        <span className="log-index">Log #{index}</span>
        {isCoreWriter && <span className="log-badge">CoreWriter</span>}
        <span className="log-address">
          <code>{log.address}</code>
        </span>
        <span className={`log-expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>
      
      {expanded && (
        <div className="log-details" id={`log-details-${log.index}`}>
          <table className="log-table">
            <tbody>
              <tr>
                <td className="log-label">Address:</td>
                <td className="log-value">
                  <code>{log.address}</code>
                </td>
              </tr>
              <tr>
                <td className="log-label">Block Number:</td>
                <td className="log-value">{log.blockNumber}</td>
              </tr>
              <tr>
                <td className="log-label">Transaction Index:</td>
                <td className="log-value">{log.transactionIndex}</td>
              </tr>
              <tr>
                <td className="log-label">Log Index:</td>
                <td className="log-value">{log.index}</td>
              </tr>
              <tr>
                <td className="log-label">Removed:</td>
                <td className="log-value">{log.removed ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td className="log-label">Topics:</td>
                <td className="log-value">
                  <div className="topics-list">
                    {log.topics.map((topic, i) => (
                      <div key={i} className="topic-item">
                        <span className="topic-index">[{i}]</span>
                        <code className="topic-value">{topic}</code>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="log-label">Data:</td>
                <td className="log-value">
                  <code className="log-data">{log.data}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const AllLogs = ({ logs }: AllLogsProps) => {
  const [showAllLogs, setShowAllLogs] = useState(false);

  const coreWriterLogs = logs.filter(
    log => log.address.toLowerCase() === CORE_WRITER_ADDRESS.toLowerCase()
  );
  
  const otherLogs = logs.filter(
    log => log.address.toLowerCase() !== CORE_WRITER_ADDRESS.toLowerCase()
  );

  return (
    <div className="all-logs-container">
      <div className="logs-header">
        <h3>Transaction Logs ({logs.length} total)</h3>
        <button 
          className="toggle-logs-button"
          onClick={() => setShowAllLogs(!showAllLogs)}
        >
          {showAllLogs ? '▲ Hide All Logs' : '▼ Show All Logs'}
        </button>
      </div>

      {showAllLogs && (
        <div className="logs-content">
          {logs.length === 0 ? (
            <p className="no-logs">No logs found in this transaction.</p>
          ) : (
            <>
              {coreWriterLogs.length > 0 && (
                <div className="logs-section">
                  <h4>CoreWriter Logs ({coreWriterLogs.length})</h4>
                  {coreWriterLogs.map((log, index) => (
                    <LogEntry 
                      key={log.index} 
                      log={log} 
                      index={log.index} 
                      isCoreWriter={true}
                    />
                  ))}
                </div>
              )}

              {otherLogs.length > 0 && (
                <div className="logs-section">
                  <h4>Other Logs ({otherLogs.length})</h4>
                  {otherLogs.map((log, index) => (
                    <LogEntry 
                      key={log.index} 
                      log={log} 
                      index={log.index} 
                      isCoreWriter={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
