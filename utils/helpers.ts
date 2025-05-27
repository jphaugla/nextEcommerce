// utils/helpers.ts
export async function retryable<T>(
  fn: () => Promise<T>,
  retries = 5,
  delayMs = 100
): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      // Only retry on Cockroach write‐conflict errors (P2034)
      const code = err?.code;
      const msg  = err?.message ?? "";
      if (code !== "P2034" && !msg.includes("write conflict")) {
        throw err;
      }
      // exponential backoff
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw lastErr;
}

