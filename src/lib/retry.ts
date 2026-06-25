/**
 * Simple exponential-backoff retry for fetch/external calls.
 * Retries on network errors and 5xx responses.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number; label?: string } = {},
): Promise<T> {
  const { attempts = 3, baseDelayMs = 300, label = 'withRetry' } = options;

  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        const delay = baseDelayMs * 2 ** i;
        console.warn(`[${label}] attempt ${i + 1} failed, retrying in ${delay}ms`, err);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.error(`[${label}] all ${attempts} attempts failed`);
  throw lastError;
}
