import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
/** Browser adapter for the shared fiscal SHA-256 contract; never signs evidence. */
export function createHash(algorithm: string) {
  if (algorithm !== 'sha256') throw Error('unsupported_fiscal_hash');
  let input = '';
  return { update(value: string) { input += value; return this; }, digest(encoding: string) {
    if (encoding !== 'hex') throw Error('unsupported_fiscal_hash_encoding');
    return bytesToHex(sha256(new TextEncoder().encode(input)));
  }};
}
