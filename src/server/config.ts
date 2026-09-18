/** This module is server-only. Do not import it from `src/ui`. */
export interface ServerConfig { supabaseUrl: string; supabaseServiceRoleKey: string; googleClientId: string; googleClientSecret: string; googleRedirectUri: string; geminiApiKey?: string; }
const required = (name: string): string => { const value = process.env[name]; if (!value) throw new Error(`Missing required server configuration: ${name}`); return value; };
export const loadServerConfig = (): ServerConfig => ({ supabaseUrl: required("SUPABASE_URL"), supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"), googleClientId: required("GOOGLE_CLIENT_ID"), googleClientSecret: required("GOOGLE_CLIENT_SECRET"), googleRedirectUri: required("GOOGLE_REDIRECT_URI"), geminiApiKey: process.env.GEMINI_API_KEY });
