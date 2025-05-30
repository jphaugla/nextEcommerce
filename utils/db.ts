// utils/db.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  // Only log warnings; errors will be surfaced via our retry wrapper
  log: ['warn'],
});

const MAX_RETRIES = 5;
const BACKOFF_MS = 200;

/**
 * Runs the given async function inside a SERIALIZABLE transaction,
 * retrying up to MAX_RETRIES on serialization or transient errors.
 *
 * @param txFn A function that receives a Prisma transaction client.
 * @param label Optional label to include in logs (e.g. "restock", "place-order").
 */
export async function runWithRetry<T>(
  txFn: (tx: PrismaClient) => Promise<T>,
  label?: string
): Promise<T> {
  let attempt = 0;
  const txId = Math.random().toString(36).substr(2, 6);
  const tag = label ? ` [${label}]` : '';

  while (true) {
    attempt++;
    const startTs = new Date().toISOString();
    console.info(
      `[${startTs}] INFO  ▶ Beginning transaction${tag} (txId=${txId}, attempt=${attempt})`
    );

    try {
      const result = await prisma.$transaction(
        async (tx) => txFn(tx),
        { isolationLevel: 'Serializable' }
      );

      console.info(
        `[${new Date().toISOString()}] INFO  ▶ Transaction${tag} ${txId} succeeded on attempt ${attempt}`
      );
      return result;
    } catch (err: any) {
      const errTs = new Date().toISOString();
      console.error(
        `[${errTs}] ERROR ▶ Transaction${tag} tx-${txId} aborted: ${err.code || err.message}`
      );

      const isSerialization = err.code === 'P2034' || err.code === '40001';
      const isTransient = /Timeout|ECONNRESET|context deadline exceeded/.test(
        err.message
      );

      if (isSerialization) {
        console.warn(
          `[${errTs}] WARN  ▶ Serialization conflict on Transaction${tag} tx-${txId}; retrying (attempt ${attempt}/${MAX_RETRIES})`
        );
      } else if (isTransient) {
        console.warn(
          `[${errTs}] WARN  ▶ Transient error on Transaction${tag} tx-${txId}; retrying (attempt ${attempt}/${MAX_RETRIES})`
        );
      } else {
        // Non-retryable error: rethrow
        throw err;
      }

      if (attempt >= MAX_RETRIES) {
        throw new Error(
          `Transaction${tag} tx-${txId} failed after ${MAX_RETRIES} attempts: ${err.message}`
        );
      }

      // Back off before retrying
      await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS));
    }
  }
}

