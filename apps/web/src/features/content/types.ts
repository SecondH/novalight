export type ApprovalState = 'DRAFT' | 'EDITED' | 'APPROVED' | 'DISCARDED';
export type PostedState = 'SCHEDULED' | 'POSTED' | 'DISCARDED';

export interface ContentIdea {
  id: string;
  topic: string;
  intendedFormat: string;
  targetDate: string;
}

export interface ContentDraft {
  id: string;
  contentIdeaId: string;
  captionText: string | null;
  visualPromptText: string | null;
  approvalState: ApprovalState;
}

export interface CalendarEntry {
  id: string;
  contentDraftId: string;
  scheduledDate: string;
  postedState: PostedState;
}
