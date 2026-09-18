import type { Plan } from "./types.js";
export interface NexusAIProvider { createPlan(request: string): Promise<Plan>; }
