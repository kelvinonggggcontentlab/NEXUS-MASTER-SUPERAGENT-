import type { AgentTask, Plan } from "./types.js";
const task = (id: string, label: string, toolId: string, input: Record<string, unknown>, dependsOn: string[] = []): AgentTask => ({ id, label, toolId, input, dependsOn, status: "pending", attempts: 0 });
export class HeuristicNexusProvider {
  async createPlan(request: string): Promise<Plan> {
    const lower = request.toLowerCase(); const company = request.match(/(?:from|file)\s+([\w ]+?)(?:,|\.| save| rename| move| and)/i)?.[1]?.trim() || "Company X";
    const renamed = request.match(/rename (?:it|.*?)(?: to)?\s+([^,]+?)(?:,| and move| move| and remind|$)/i)?.[1]?.trim() || "CompanyX Invoice September 2026";
    const folder = request.match(/(?:to|folder)\s+(Finance|[\w ]+ folder)/i)?.[1]?.trim() || "Finance";
    const tasks: AgentTask[] = [];
    if (lower.includes("gmail") || lower.includes("attachment") || lower.includes("invoice")) {
      tasks.push(task("search-mail", "Checking Gmail for the invoice", "gmail.search", { company }));
      tasks.push(task("get-attachment", "Retrieving the attachment", "gmail.attachment", {}, ["search-mail"]));
      tasks.push(task("upload-file", "Saving the attachment to Drive", "drive.upload", { filename: "invoice-september.pdf" }, ["get-attachment"]));
    } else tasks.push(task("search-drive", "Checking Google Drive", "drive.search", { query: company }));
    const fileDependency = tasks.at(-1)?.id;
    if (lower.includes("rename")) tasks.push(task("rename-file", "Renaming the file", "drive.rename", { fileId: "drive-invoice-sept", name: renamed }, fileDependency ? [fileDependency] : []));
    const moveDependency = tasks.at(-1)?.id;
    if (lower.includes("move") || lower.includes("finance")) tasks.push(task("move-file", "Moving it to Finance", "drive.move", { fileId: "drive-invoice-sept", folder }, moveDependency ? [moveDependency] : []));
    if (lower.includes("remind") || lower.includes("reminder")) tasks.push(task("create-reminder", "Creating your reminder", "tasks.create", { title: `Review ${renamed}`, when: lower.includes("10") ? "tomorrow at 10:00" : "tomorrow" }));
    return { goal: request, tasks };
  }
}
