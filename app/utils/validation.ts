/**
 * Validates whether a string is a valid Ethereum transaction hash
 * @param input - The string to validate
 * @returns true if the input is a valid transaction hash (0x + 64 hex chars)
 */
export function isValidTxHash(input: string): boolean {
  const trimmed = input.trim();
  return (
    trimmed.startsWith('0x') &&
    trimmed.length === 66 &&
    /^0x[0-9a-fA-F]{64}$/.test(trimmed)
  );
}

