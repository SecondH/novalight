import { prisma } from '../src/client';

/**
 * Local development seed only -- never run against staging/production (no production seed
 * data is defined anywhere, and this script does not guard against being pointed at a real
 * environment beyond relying on DATABASE_URL being a local instance, per
 * docs/operations/025-m1.6-operational-activation-report.md's dev-environment-activation
 * decision). Creates one realistic Stage 1 account end-to-end (User -> Account -> Brand ->
 * ContentIdea -> ContentDraft -> CalendarEntry) so a developer has real data to work against
 * without needing to drive the full onboarding flow by hand every time.
 */
async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: 'dev-owner@novalight.local' },
    update: {},
    create: { email: 'dev-owner@novalight.local' },
  });

  const account = await prisma.account.upsert({
    where: { ownerUserId: user.id },
    update: {},
    create: { ownerUserId: user.id, vertical: 'CAFE' },
  });

  const brand = await prisma.brand.upsert({
    where: { accountId: account.id },
    update: {},
    create: {
      accountId: account.id,
      vertical: 'CAFE',
      toneDescriptors: 'warm and friendly',
      audienceDescription: 'local remote workers and students',
      visualStyleDescriptors: 'bright, minimal, plant-filled',
      offeringsSummary: 'specialty coffee, pastries, light lunch',
    },
  });

  const idea = await prisma.contentIdea.create({
    data: {
      accountId: account.id,
      brandId: brand.id,
      topic: 'New seasonal oat milk latte',
      intendedFormat: 'photo-post',
      targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const draft = await prisma.contentDraft.create({
    data: {
      accountId: account.id,
      contentIdeaId: idea.id,
      captionText: 'New seasonal oat milk latte — written in a warm and friendly tone. (seed data)',
      visualPromptText:
        'A photo depicting: New seasonal oat milk latte. Visual style: bright, minimal, plant-filled. (seed data)',
      approvalState: 'APPROVED',
    },
  });

  await prisma.calendarEntry.create({
    data: {
      accountId: account.id,
      contentDraftId: draft.id,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      postedState: 'SCHEDULED',
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded: user=${user.email} account=${account.id} (${account.vertical})`);
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
