import { api } from "./client";

export const openclawApi = {
  listAgents: () => api.get<{ agents: string[] }>("/openclaw/agents"),
};
