/**
 * Placeholder for future AI output evaluation. Per
 * docs/security/013-security-architecture.md §18, AI output validation and monitoring are
 * required future capabilities; no evaluation methodology has been chosen yet. Interface
 * only -- no scoring logic.
 */
export interface EvaluationResult {
  score: number;
  passed: boolean;
}

export interface Evaluator {
  evaluate(output: string): Promise<EvaluationResult>;
}
