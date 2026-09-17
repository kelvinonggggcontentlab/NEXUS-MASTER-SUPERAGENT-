import type { NexusTool } from "./types.js";
export class NexusPermissionEngine {
  canExecute(tool: NexusTool, explicitlyRequested: boolean, confirmed: boolean): { allowed: boolean; reason?: string } {
    if (tool.permission === "read") return { allowed: true };
    if (!explicitlyRequested) return { allowed: false, reason: "This action was not explicitly requested." };
    if ((tool.riskLevel === "high" || tool.requiresConfirmation) && !confirmed) return { allowed: false, reason: "Confirmation is required immediately before this action." };
    return { allowed: true };
  }
}
