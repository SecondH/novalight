/**
 * Prompt management is named as a gap in the development-readiness assessment
 * (docs/readiness/development-documentation-gap-analysis.md, AI Architecture domain,
 * "Deferred by design"): no prompt-template strategy, versioning approach, or storage model
 * has been decided yet. This interface intentionally stays minimal -- do not add templating
 * logic, storage, or versioning until that decision is made.
 */
export interface PromptTemplate {
  id: string;
  render(variables: Record<string, string>): string;
}

export interface PromptManager {
  getTemplate(id: string): Promise<PromptTemplate>;
}
