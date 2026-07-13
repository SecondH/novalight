import { prisma, type User } from '@novalight/database';

export interface ClerkIdentityInput {
  clerkUserId: string;
  email: string;
}

/**
 * User is the login-identity aggregate (distinct from Account, the ownership root -- ADR-018
 * v1.2). Every method here operates on the verified Clerk identity supplied by the caller
 * (ClerkAuthProvider or the Clerk webhook handler), never on client-supplied data -- per
 * ADR-029 (docs/architecture/029-clerk-identity-mapping-and-provisioning.md).
 */
export class UsersRepository {
  findByClerkUserId(clerkUserId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { clerkUserId } });
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  createFromClerkIdentity(input: ClerkIdentityInput): Promise<User> {
    return prisma.user.create({ data: input });
  }

  linkClerkUserId(email: string, clerkUserId: string): Promise<User> {
    return prisma.user.update({ where: { email }, data: { clerkUserId } });
  }

  updateEmail(clerkUserId: string, email: string): Promise<User> {
    return prisma.user.update({ where: { clerkUserId }, data: { email } });
  }

  deactivateByClerkUserId(clerkUserId: string): Promise<User> {
    return prisma.user.update({ where: { clerkUserId }, data: { deactivatedAt: new Date() } });
  }
}
