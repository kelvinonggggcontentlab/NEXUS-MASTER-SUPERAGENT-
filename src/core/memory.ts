export interface NexusMemory { remember(key: string, value: unknown): void; recall<T>(key: string): T | undefined; }
export class SessionMemory implements NexusMemory { private readonly entries = new Map<string, unknown>(); remember(key: string, value: unknown): void { this.entries.set(key, value); } recall<T>(key: string): T | undefined { return this.entries.get(key) as T | undefined; } }
