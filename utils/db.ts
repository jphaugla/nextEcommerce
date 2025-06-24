// utils/db.ts
import { PrismaClient, Prisma } from '@prisma/client';

export const prisma = new PrismaClient({ log: ['warn'] });

const MAX_RETRIES = 5;

export async function runWithRetry<T>(
  txFn: (tx: PrismaClient) => Promise<T>,
  label?: string
): Promise<T> {
  let attempt = 0;
  const txId = Math.random().toString(36).slice(-6);
  const tag = label ? ` [${label}]` : '';

  while (true) {
    attempt++;
    console.info(`▶ Starting tx${tag} id=${txId} attempt=${attempt}`);

    try {
      const result = await prisma.$transaction(txFn, {
        isolationLevel: 'Serializable',
      });
      console.info(`✔︎ tx${tag} id=${txId} succeeded on attempt ${attempt}`);
      return result;
    } catch (err: any) {
      const code = (err as any).code;
      const isConflict =
        code === 'P2034' /* Prisma serialization */ || code === '40001';
      if (!isConflict) {
        // non‐retriable
        throw err;
      }

      if (attempt >= MAX_RETRIES) {
        throw new Error(
          `✖︎ tx${tag} id=${txId} failed after ${attempt} attempts: ${err.message}`
        );
      }

      // exponential backoff + full jitter
      const base = Math.min(1000, 100 * 2 ** (attempt - 1));
      const wait = Math.random() * base;
      console.warn(
        `⚠️  tx${tag} id=${txId} conflict; retrying in ${Math.round(
          wait
        )}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
      );
      await new Promise((r) => setTimeout(r, wait));
      // loop and retry
    }
  }
}
