import { z } from 'zod';

export const draftEditSchema = z.object({
  captionText: z.string().min(1).max(2000).optional(),
  visualPromptText: z.string().min(1).max(2000).optional(),
});

export const scheduleSchema = z.object({
  scheduledDate: z.coerce.date(),
});

export const rescheduleSchema = z.object({
  scheduledDate: z.coerce.date(),
});

export type DraftEditBody = z.infer<typeof draftEditSchema>;
export type ScheduleBody = z.infer<typeof scheduleSchema>;
export type RescheduleBody = z.infer<typeof rescheduleSchema>;
