import type { CreateConfigValues } from "@paperclipai/adapter-utils";

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function buildOpenClawGatewayConfig(v: CreateConfigValues): Record<string, unknown> {
  const ac: Record<string, unknown> = {};
  ac.url = v.url || "ws://localhost:18789";
  ac.timeoutSec = 600;
  ac.waitTimeoutMs = 600000;
  ac.sessionKeyStrategy = "issue";
  ac.role = "operator";
  ac.scopes = ["operator.admin"];
  if (v.openclawAgentId) {
    ac.agentId = v.openclawAgentId;
    if (v.openclawAgentScope === "shared" && v.openclawCompanySlug) {
      ac.sessionKey = `agent:${v.openclawAgentId}:${v.openclawCompanySlug}`;
    } else {
      ac.sessionKey = `agent:${v.openclawAgentId}:paperclip`;
    }
  }
  const payloadTemplate = parseJsonObject(v.payloadTemplateJson ?? "");
  if (payloadTemplate) ac.payloadTemplate = payloadTemplate;
  const runtimeServices = parseJsonObject(v.runtimeServicesJson ?? "");
  if (runtimeServices && Array.isArray(runtimeServices.services)) {
    ac.workspaceRuntime = runtimeServices;
  }
  return ac;
}
