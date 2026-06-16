/**
 * AI Registry & Factory
 *
 * Single entry point for all AI/intelligence features.
 * Callers import from here — never directly from a provider file.
 *
 * To swap providers in production:
 *   Set NEXT_PUBLIC_AI_PROVIDER=claude (or any registered name)
 *   Add the provider to PROVIDERS below
 */

import type { AIProvider } from "./provider";
import { DeterministicProvider } from "./deterministic";

// Provider registry — add new providers here
const PROVIDERS: Record<string, AIProvider> = {
  deterministic: DeterministicProvider,
  // claude:  ClaudeProvider,   // future
  // openai:  OpenAIProvider,   // future
};

const ACTIVE_PROVIDER_NAME =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_AI_PROVIDER) ||
  "deterministic";

export function getProvider(): AIProvider {
  return PROVIDERS[ACTIVE_PROVIDER_NAME] ?? DeterministicProvider;
}

// Convenience direct exports — callers don't need to call getProvider()
export const ai = getProvider();

export type { AIProvider, AIInsight, InsightContext } from "./provider";
export { DeterministicProvider } from "./deterministic";
