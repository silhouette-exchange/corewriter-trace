import { JsonRpcProvider } from 'ethers';
import * as hl from '@nktkas/hyperliquid';
import { HttpTransportOptions } from '@nktkas/hyperliquid';

export type ChainSearchResult =
  | { chain: 'hyperevm'; receipt: any }
  | { chain: 'hypercore'; tx: any }
  | null;

/**
 * Searches for a transaction across both HyperEVM and HyperCore chains in parallel
 * @param txHash - The transaction hash to search for
 * @param provider - The JsonRpcProvider for HyperEVM
 * @param isTestnet - Whether to search on testnet or mainnet
 * @returns Promise that resolves to the first non-null result, or null if not found on either chain
 */
export async function searchBothChains(
  txHash: string,
  provider: JsonRpcProvider,
  isTestnet: boolean
): Promise<ChainSearchResult> {
  const hyperEvmPromise = (async () => {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt ? { chain: 'hyperevm' as const, receipt } : null;
    } catch {
      return null;
    }
  })();

  const hyperCorePromise = (async () => {
    try {
      const transportConfig: HttpTransportOptions = {
        isTestnet,
      };
      const transport = new hl.HttpTransport(transportConfig);
      const client = new hl.InfoClient({ transport });
      const result = await client.txDetails({
        hash: txHash as `0x${string}`,
      });
      return result.tx ? { chain: 'hypercore' as const, tx: result.tx } : null;
    } catch {
      return null;
    }
  })();

  const results = await Promise.all([hyperEvmPromise, hyperCorePromise]);
  const hyperEvmResult = results[0];
  const hyperCoreResult = results[1];

  // Return the first non-null result
  if (hyperEvmResult) return hyperEvmResult;
  if (hyperCoreResult) return hyperCoreResult;
  return null;
}

