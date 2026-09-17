import type { NexusTool, ToolContext, ToolResult, VerificationResult } from "./types.js";
const objectInput = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const result = (toolName: string, context: ToolContext, data: unknown): ToolResult => ({ success: true, data, metadata: { toolName, executionId: context.executionId, timestamp: new Date().toISOString(), mode: context.mode } });
const verified = async (): Promise<VerificationResult> => ({ verified: true, detail: "Confirmed in the simulation adapter." });
const tool = (id: string, name: string, permission: "read" | "write", execute: (input: Record<string, unknown>, context: ToolContext) => unknown): NexusTool => ({ id, name, description: `Simulated ${name} adapter`, category: "Google", permission, riskLevel: permission === "write" ? "medium" : "low", enabled: true, requiresConfirmation: false, inputSchema: objectInput, execute: async (input, context) => result(name, context, execute(input, context)), verify: permission === "write" ? verified : undefined });
export const simulationTools: NexusTool[] = [
  tool("gmail.search", "Gmail search", "read", (input) => ({ messageId: "msg-invoice-sept", sender: String(input.company ?? "Company X"), subject: "Invoice September 2026", attachment: "invoice-september.pdf" })),
  tool("gmail.attachment", "Gmail attachment retrieval", "read", () => ({ attachmentId: "att-invoice-sept", filename: "invoice-september.pdf" })),
  tool("drive.search", "Google Drive search", "read", (input) => ({ fileId: "drive-tax-2026", filename: String(input.query ?? "Latest invoice"), folder: "Inbox" })),
  tool("drive.upload", "Google Drive upload", "write", (input) => ({ fileId: "drive-invoice-sept", filename: String(input.filename ?? "invoice-september.pdf") })),
  tool("drive.rename", "Google Drive rename", "write", (input) => ({ fileId: String(input.fileId ?? "drive-invoice-sept"), filename: String(input.name) })),
  tool("drive.move", "Google Drive move", "write", (input) => ({ fileId: String(input.fileId ?? "drive-invoice-sept"), folder: String(input.folder) })),
  tool("tasks.create", "Reminder creation", "write", (input) => ({ reminderId: "reminder-invoice-sept", title: String(input.title), when: String(input.when) }))
];
