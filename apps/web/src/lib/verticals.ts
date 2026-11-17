/**
 * Mirrors `packages/database/prisma/schema.prisma`'s `Vertical` enum exactly -- do not add a
 * value here without a corresponding, approved schema change (see ADR-018).
 */
export const VERTICALS = ['BEAUTY_SALON', 'RESTAURANT', 'CAFE', 'LOCAL_SERVICE', 'RETAIL'] as const;

export type Vertical = (typeof VERTICALS)[number];
