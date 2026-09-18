import type { ToolResult } from "./types.js";

/** Server implementations should persist these records by user and key. */
export interface IdempotencyStore { get(key: string): Promise<ToolResult | undefined>; put(key: string, result: ToolResult): Promise<void>; }
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly entries = new Map<string, ToolResult>();
  async get(key: string): Promise<ToolResult | undefined> { return this.entries.get(key); }
  async put(key: string, result: ToolResult): Promise<void> { this.entries.set(key, result); }
}
