import { prisma, type Brand, type Vertical } from '@novalight/database';

export interface CreateBrandInput {
  vertical: Vertical;
  toneDescriptors: string;
  audienceDescription: string;
  visualStyleDescriptors: string;
  offeringsSummary: string;
}

/**
 * Every method takes accountId as a mandatory parameter and applies it as a WHERE filter --
 * per docs/architecture/social-ai-platform/028-m1-technical-design.md §2.2. No method may
 * omit it, even though Brand is 1:1 with Account (a future refactor must not "simplify" this
 * away by looking Brand up by id alone).
 */
export class BrandsRepository {
  findByAccountId(accountId: string): Promise<Brand | null> {
    return prisma.brand.findFirst({ where: { accountId } });
  }

  create(accountId: string, input: CreateBrandInput): Promise<Brand> {
    return prisma.brand.create({ data: { accountId, ...input } });
  }

  update(accountId: string, id: string, input: Partial<CreateBrandInput>): Promise<Brand> {
    // updateMany + re-fetch (not update-by-id) so the account_id filter is enforced by the
    // query itself, not by a check performed after the fact -- see the ownership-isolation
    // test requirement in docs/development/019-mvp-m1-test-strategy.md §3.
    return prisma.brand.update({ where: { id, accountId }, data: input });
  }
}
