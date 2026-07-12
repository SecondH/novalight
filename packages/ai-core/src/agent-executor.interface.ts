/**
 * Placeholder for future AI agent execution (e.g. Phase 5 "AI Social Operating System" per
 * docs/product/009-roadmap.md). Deliberately unopinionated -- no execution engine, tool-use
 * model, or agent framework has been chosen. Do not implement agent logic against this
 * interface until an approved requirement exists; doing so now would be exactly the kind of
 * speculative business logic this Phase 0 implementation is instructed not to build.
 */
export interface AgentTask {
  id: string;
  input: string;
}

export interface AgentResult {
  taskId: string;
  output: string;
}

export interface AgentExecutor {
  run(task: AgentTask): Promise<AgentResult>;
}
