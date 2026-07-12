/**
 * Authorization is implemented independently from authentication, per
 * docs/security/013-security-architecture.md §"Authorization": "Authentication answers:
 * 'Who is the user?' Authorization answers: 'What can the user do?'"
 *
 * Deliberately generic: Role is a plain string, not a hardcoded enum. Two source documents
 * currently disagree on the concrete role taxonomy --
 * docs/product/008-prd.md §6 ("Individual User / Team Member / Organization Owner /
 * Administrator") vs. docs/security/013-security-architecture.md §7 ("Platform Administrator /
 * Organization Owner / Organization Member / Viewer") -- see the tracked conflict in
 * .claude/memory/known-risks.md ("RBAC role-taxonomy conflict"). Committing to either list here
 * would silently resolve a conflict this project has explicitly flagged for a human decision.
 * Replace `Role = string` with a real union/enum once that decision is made.
 */
export type Role = string;

export interface Permission {
  resource: string;
  action: string;
}

export interface AuthorizationContext {
  userId: string;
  roles: Role[];
}

export interface AuthorizationProvider {
  can(context: AuthorizationContext, permission: Permission): Promise<boolean>;
}
