import { Router } from 'express';
import {
  generateIdeas,
  listIdeas,
  generateDraft,
  editDraft,
  approveDraft,
  discardDraft,
  scheduleDraft,
  listCalendar,
  rescheduleCalendarEntry,
  markCalendarEntryPosted,
  discardCalendarEntry,
} from './content.controller';
import { requireAuthentication } from '../../middlewares/authentication';
import { validateBody } from '../../middlewares/validate-body';
import { agentInvocationRateLimit } from '../../middlewares/rate-limit';
import { draftEditSchema, scheduleSchema, rescheduleSchema } from './content.validators';

export const contentRouter = Router();

contentRouter.post(
  '/content/ideas/generate',
  requireAuthentication,
  agentInvocationRateLimit,
  generateIdeas,
);
contentRouter.get('/content/ideas', requireAuthentication, listIdeas);
contentRouter.post(
  '/content/ideas/:ideaId/draft',
  requireAuthentication,
  agentInvocationRateLimit,
  generateDraft,
);

contentRouter.patch(
  '/content/drafts/:draftId',
  requireAuthentication,
  validateBody(draftEditSchema),
  editDraft,
);
contentRouter.post('/content/drafts/:draftId/approve', requireAuthentication, approveDraft);
contentRouter.post('/content/drafts/:draftId/discard', requireAuthentication, discardDraft);
contentRouter.post(
  '/content/drafts/:draftId/schedule',
  requireAuthentication,
  validateBody(scheduleSchema),
  scheduleDraft,
);

contentRouter.get('/content/calendar', requireAuthentication, listCalendar);
contentRouter.patch(
  '/content/calendar/:entryId/reschedule',
  requireAuthentication,
  validateBody(rescheduleSchema),
  rescheduleCalendarEntry,
);
contentRouter.post(
  '/content/calendar/:entryId/posted',
  requireAuthentication,
  markCalendarEntryPosted,
);
contentRouter.post(
  '/content/calendar/:entryId/discard',
  requireAuthentication,
  discardCalendarEntry,
);
