import { NexusPermissionEngine } from "./permissions.js";
import { NexusToolRegistry } from "./registry.js";
import { NexusResponseEngine } from "./response.js";
import { InMemoryIdempotencyStore } from "./idempotency.js";
import type { IdempotencyStore } from "./idempotency.js";
import type { AgentEvent, AgentExecution, AgentTask, Mode, ToolResult } from "./types.js";
import type { NexusAIProvider } from "./provider.js";
const MAX_RETRIES = 3;
export class NexusCore {
  constructor(private readonly provider: NexusAIProvider, private readonly registry: NexusToolRegistry, private readonly permissions = new NexusPermissionEngine(), private readonly responses = new NexusResponseEngine(), private readonly maxIterations = 20, private readonly idempotency: IdempotencyStore = new InMemoryIdempotencyStore()) {}
  async run(request: string, mode: Mode, onEvent: (event: AgentEvent) => void, confirmed = true, signal?: AbortSignal): Promise<{ execution: AgentExecution; response: string }> {
    const plan = await this.provider.createPlan(request); const execution: AgentExecution = { executionId: crypto.randomUUID(), userRequest: request, goal: plan.goal, status: "planning", tasks: plan.tasks, toolResults: {}, executionHistory: [], errors: [], startedAt: new Date().toISOString(), mode };
    const emit = (type: AgentEvent["type"], message: string) => onEvent({ type, message, execution });
    execution.status = "executing"; emit("status", "I have the objective. Executing now.");
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      if (signal?.aborted) { execution.status = "failed"; execution.cancelledAt = new Date().toISOString(); execution.errors.push({ code: "CANCELLED", message: "Execution was cancelled before completion.", retryable: false }); break; }
      const ready = execution.tasks.filter((item) => item.status === "pending" && (!item.condition || item.condition(execution.toolResults)) && item.dependsOn.every((dependency) => ["completed", "verified"].includes(execution.tasks.find((candidate) => candidate.id === dependency)?.status ?? "")));
      if (!ready.length) break;
      await Promise.all(ready.map((item) => this.executeTask(item, execution, request, confirmed, emit, signal)));
    }
    for (const item of execution.tasks.filter((candidate) => candidate.status === "pending")) item.status = "blocked";
    execution.status = execution.tasks.some((item) => item.status === "failed" || item.status === "blocked") ? "failed" : "completed"; execution.completedAt = new Date().toISOString(); emit(execution.status === "completed" ? "complete" : "failed", this.responses.final(execution));
    return { execution, response: this.responses.final(execution) };
  }
  private async executeTask(task: AgentTask, execution: AgentExecution, request: string, confirmed: boolean, emit: (type: AgentEvent["type"], message: string) => void, signal?: AbortSignal): Promise<void> {
    const tool = this.registry.get(task.toolId); if (!tool || !tool.inputSchema(task.input)) { task.status = "failed"; execution.errors.push({ code: "INVALID_TOOL_INPUT", message: `Could not validate ${task.label}.`, retryable: false }); return; }
    const decision = this.permissions.canExecute(tool, request.toLowerCase().includes("remind") || request.toLowerCase().includes("move") || request.toLowerCase().includes("rename") || request.toLowerCase().includes("save"), confirmed);
    if (!decision.allowed) { task.status = "blocked"; emit("confirmation", decision.reason ?? "Action blocked."); return; }
    task.status = "running"; emit("status", `${task.label}…`); const idempotencyKey = `${execution.executionId}:${task.id}`; let output = await this.idempotency.get(idempotencyKey);
    while (!output && task.attempts < MAX_RETRIES) { if (signal?.aborted) { task.status = "blocked"; return; } task.attempts++; output = await tool.execute(task.input, { executionId: execution.executionId, idempotencyKey, mode: execution.mode, signal }); if (output.success) { await this.idempotency.put(idempotencyKey, output); break; } if (output.uncertain && tool.verify) { const recovery = await tool.verify(task.input, output, { executionId: execution.executionId, idempotencyKey, mode: execution.mode, signal }); if (recovery.verified) { output = { ...output, success: true, error: undefined }; await this.idempotency.put(idempotencyKey, output); break; } } if (!output.error?.retryable) break; output = undefined; await new Promise((resolve) => setTimeout(resolve, 20 * 2 ** task.attempts)); }
    if (!output?.success) { task.status = "failed"; if (output?.error) execution.errors.push(output.error); return; }
    execution.toolResults[task.id] = output; execution.executionHistory.push({ taskId: task.id, toolId: tool.id, at: new Date().toISOString(), result: output });
    if (tool.verify) { execution.status = "verifying"; const check = await tool.verify(task.input, output, { executionId: execution.executionId, idempotencyKey: `${execution.executionId}:${task.id}`, mode: execution.mode }); task.status = check.verified ? "verified" : "failed"; execution.status = "executing"; } else task.status = "completed";
  }
}
