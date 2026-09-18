import type { GoogleOAuthService } from "./google-oauth.js";
export interface AuthenticatedRequest { userId?: string; url: URL; method: string; }
/** Integrate this framework-neutral handler behind an authenticated NEXUS server session. */
export const handleGoogleConnection = async (request: AuthenticatedRequest, oauth: GoogleOAuthService): Promise<{ status: number; headers?: Record<string, string>; body?: string }> => {
  if (!request.userId) return { status: 401, body: "Authentication required." };
  if (request.url.pathname === "/api/connections/google" && (request.method === "POST" || request.method === "GET")) return { status: 302, headers: { location: await oauth.authorizationUrl(request.userId) } };
  if (request.url.pathname === "/api/connections/google/callback" && request.method === "GET") { const state = request.url.searchParams.get("state"); const code = request.url.searchParams.get("code"); if (!state || !code) return { status: 400, body: "Google authorization was incomplete." }; try { const owner = await oauth.complete(state, code); return owner === request.userId ? { status: 302, headers: { location: "/settings?google=connected" } } : { status: 403, body: "Connection user mismatch." }; } catch { return { status: 400, body: "Google authorization failed." }; } }
  if (request.url.pathname === "/api/connections/google" && request.method === "DELETE") { await oauth.disconnect(request.userId); return { status: 204 }; }
  return { status: 404, body: "Not found." };
};
