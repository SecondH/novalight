import type { Vertical } from '@/lib/verticals';

export type BrandSetupField = 'tone' | 'audience' | 'visual' | 'offerings';

/**
 * Stable suggestion IDs, independent of display language -- translated labels live at
 * `onboarding.brandSetup.suggestions.labels.{field}.{id}` in messages/{fa,en}.json. Per ADR
 * decision (2026-07-14, "Suggestion chips augment free text"): these never replace the four
 * fields' free-text nature and are never sent to the backend as IDs -- clicking a chip inserts
 * its *localized label text* into the existing free-text answer, so `POST /brands/intake`'s
 * payload shape (`rawToneAnswer`, etc.) is completely unchanged.
 */
const GENERIC: Record<BrandSetupField, string[]> = {
  tone: ['warm', 'professional', 'playful', 'minimal', 'energetic'],
  audience: ['localCommunity', 'busyProfessionals', 'families', 'youngAdults', 'valueSeekers'],
  visual: ['brightAndClean', 'warmAndCozy', 'boldAndColorful', 'minimalAndModern', 'naturalLight'],
  offerings: ['walkInsWelcome', 'appointmentBased', 'onlineBooking'],
};

const BY_VERTICAL: Record<Vertical, Record<BrandSetupField, string[]>> = {
  BEAUTY_SALON: {
    tone: ['pampering', 'elegant'],
    audience: ['selfCareClients', 'bridesAndEvents'],
    visual: ['softPastels', 'elegantMonochrome'],
    offerings: ['haircuts', 'coloring', 'manicurePedicure', 'spaTreatments'],
  },
  CAFE: {
    tone: ['cozy', 'welcoming'],
    audience: ['remoteWorkers', 'students'],
    visual: ['rusticWarm', 'industrialChic'],
    offerings: ['specialtyCoffee', 'freshPastries', 'breakfastMenu', 'cozySeating'],
  },
  RESTAURANT: {
    tone: ['indulgent', 'refined'],
    audience: ['dateNight', 'groupsAndFamilies'],
    visual: ['moodyElegant', 'vibrantFresh'],
    offerings: ['signatureDishes', 'seasonalMenu', 'catering', 'dineInAndTakeaway'],
  },
  LOCAL_SERVICE: {
    tone: ['reliable', 'straightforward'],
    audience: ['homeowners', 'firstTimeCustomers'],
    visual: ['cleanProfessional', 'approachableCasual'],
    offerings: ['repairsAndMaintenance', 'consultations', 'emergencyService', 'homeVisits'],
  },
  RETAIL: {
    tone: ['trendy', 'curated'],
    audience: ['giftShoppers', 'repeatCustomers'],
    visual: ['curatedFlatlay', 'lifestyleImagery'],
    offerings: ['curatedProducts', 'giftWrapping', 'limitedEditions', 'onlineOrders'],
  },
};

/** Generic suggestions first, then the selected vertical's own -- vertical relevance is a bonus, not a filter. */
export function suggestionsFor(field: BrandSetupField, vertical: Vertical | null): string[] {
  const generic = GENERIC[field];
  const specific = vertical ? BY_VERTICAL[vertical][field] : [];
  return [...generic, ...specific];
}
