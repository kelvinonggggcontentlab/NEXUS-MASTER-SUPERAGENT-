import type { NexusTool } from "./types.js";
export class NexusToolRegistry {
  private readonly tools = new Map<string, NexusTool>();
  register(tool: NexusTool): void { if (this.tools.has(tool.id)) throw new Error(`Tool already registered: ${tool.id}`); this.tools.set(tool.id, tool); }
  get(id: string): NexusTool | undefined { return this.tools.get(id); }
  list(): NexusTool[] { return [...this.tools.values()].filter((tool) => tool.enabled); }
}
