export type ExecutionStatus = "planning" | "executing" | "waiting" | "verifying" | "completed" | "failed";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "blocked" | "verified";
export type Permission = "read" | "write" | "admin" | "destructive";
export type RiskLevel = "low" | "medium" | "high";
export type Mode = "simulation" | "real";

export interface ToolError { code: string; message: string; retryable: boolean; }
export interface ToolResult<T = unknown> { success: boolean; data?: T; error?: ToolError; metadata: { toolName: string; executionId: string; timestamp: string; mode: Mode; idempotencyKey?: string }; uncertain?: boolean; }
export interface VerificationResult { verified: boolean; detail: string; }
export interface ToolContext { executionId: string; idempotencyKey: string; mode: Mode; signal?: AbortSignal; }
export interface NexusTool<I = Record<string, unknown>> { id: string; name: string; description: string; category: string; capability: string; permission: Permission; riskLevel: RiskLevel; authentication: "none" | "user_oauth" | "service"; enabled: boolean; requiresConfirmation: boolean; inputSchema: (input: unknown) => input is I; execute(input: I, context: ToolContext): Promise<ToolResult>; verify?(input: I, result: ToolResult, context: ToolContext): Promise<VerificationResult>; }
export interface AgentTask { id: string; label: string; toolId: string; input: Record<string, unknown>; dependsOn: string[]; status: TaskStatus; condition?: (results: Record<string, ToolResult>) => boolean; attempts: number; }
export interface AgentExecution { executionId: string; userRequest: string; goal: string; status: ExecutionStatus; tasks: AgentTask[]; toolResults: Record<string, ToolResult>; executionHistory: { taskId: string; toolId: string; at: string; result: ToolResult }[]; errors: ToolError[]; startedAt: string; completedAt?: string; cancelledAt?: string; mode: Mode; }
export interface Plan { goal: string; tasks: AgentTask[]; }
export interface AgentEvent { type: "status" | "confirmation" | "complete" | "failed"; message: string; execution: AgentExecution; }
