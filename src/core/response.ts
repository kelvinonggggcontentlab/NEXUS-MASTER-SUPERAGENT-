import type { AgentExecution } from "./types.js";
export class NexusResponseEngine {
  final(execution: AgentExecution): string {
    const completed = execution.tasks.filter((task) => task.status === "verified" || task.status === "completed").length;
    const failed = execution.tasks.filter((task) => task.status === "failed" || task.status === "blocked");
    const prefix = execution.mode === "simulation" ? "Simulation complete — no connected account was changed. " : "";
    if (failed.length) return `${prefix}I completed ${completed} of ${execution.tasks.length} actions. Blocked: ${failed.map((task) => task.label).join(", ")}.`;
    return `${prefix}Settled. I completed and verified ${completed} actions.`;
  }
}
