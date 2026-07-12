import type { Request, Response } from 'express';
import { ContentService } from './content.service';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../middlewares/error-handler';

const contentService = new ContentService();

function requireUser(req: Request): string {
  if (!req.userId) throw new ApiError('authentication', 401, 'Missing authenticated user');
  return req.userId;
}

export const generateIdeas = asyncHandler(async (req: Request, res: Response) => {
  const ideas = await contentService.generateIdeas(requireUser(req));
  res.status(201).json({ success: true, data: ideas });
});

export const listIdeas = asyncHandler(async (req: Request, res: Response) => {
  const ideas = await contentService.listIdeas(requireUser(req));
  res.status(200).json({ success: true, data: ideas });
});

export const generateDraft = asyncHandler(async (req: Request, res: Response) => {
  const draft = await contentService.generateDraftForIdea(
    requireUser(req),
    req.params.ideaId as string,
  );
  res.status(201).json({ success: true, data: draft });
});

export const editDraft = asyncHandler(async (req: Request, res: Response) => {
  const draft = await contentService.editDraft(
    requireUser(req),
    req.params.draftId as string,
    req.body,
  );
  res.status(200).json({ success: true, data: draft });
});

export const approveDraft = asyncHandler(async (req: Request, res: Response) => {
  const draft = await contentService.approveDraft(requireUser(req), req.params.draftId as string);
  res.status(200).json({ success: true, data: draft });
});

export const discardDraft = asyncHandler(async (req: Request, res: Response) => {
  const draft = await contentService.discardDraft(requireUser(req), req.params.draftId as string);
  res.status(200).json({ success: true, data: draft });
});

export const scheduleDraft = asyncHandler(async (req: Request, res: Response) => {
  const entry = await contentService.scheduleDraft(
    requireUser(req),
    req.params.draftId as string,
    req.body.scheduledDate,
  );
  res.status(201).json({ success: true, data: entry });
});

export const listCalendar = asyncHandler(async (req: Request, res: Response) => {
  const entries = await contentService.listCalendar(requireUser(req));
  res.status(200).json({ success: true, data: entries });
});

export const rescheduleCalendarEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await contentService.rescheduleCalendarEntry(
    requireUser(req),
    req.params.entryId as string,
    req.body.scheduledDate,
  );
  res.status(200).json({ success: true, data: entry });
});

export const markCalendarEntryPosted = asyncHandler(async (req: Request, res: Response) => {
  const entry = await contentService.markPosted(requireUser(req), req.params.entryId as string);
  res.status(200).json({ success: true, data: entry });
});

export const discardCalendarEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await contentService.discardCalendarEntry(
    requireUser(req),
    req.params.entryId as string,
  );
  res.status(200).json({ success: true, data: entry });
});
