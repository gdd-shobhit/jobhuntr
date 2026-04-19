export type JobStatus = 'not_applied' | 'applied' | 'rejected' | 'accepted';

export const JOB_STATUSES: JobStatus[] = [
  'not_applied',
  'applied',
  'rejected',
  'accepted',
];

export const STATUS_LABELS: Record<JobStatus, string> = {
  not_applied: 'Not applied',
  applied: 'Applied',
  rejected: 'Rejected',
  accepted: 'Accepted',
};

/** Subjective 1–5: how well you fit the role (for filtering / prioritizing). */
export const FIT_SCORE_MIN = 1;
export const FIT_SCORE_MAX = 5;
export const FIT_SCORE_DEFAULT = 3;

export function clampFitScore(value: number): number {
  const n = Math.round(value);
  return Math.min(FIT_SCORE_MAX, Math.max(FIT_SCORE_MIN, n));
}

export interface Job {
  id: string;
  title: string;
  company: string;
  postingUrl: string;
  description: string;
  status: JobStatus;
  fitScore: number;
  createdAt: string;
  updatedAt: string;
}

export type JobDraft = Pick<
  Job,
  | 'title'
  | 'company'
  | 'postingUrl'
  | 'description'
  | 'status'
  | 'fitScore'
>;

export function isJobStatus(value: unknown): value is JobStatus {
  return (
    typeof value === 'string' &&
    (JOB_STATUSES as string[]).includes(value)
  );
}

export function isJob(value: unknown): value is Job {
  if (!value || typeof value !== 'object') return false;
  const j = value as Record<string, unknown>;
  const fitOk =
    typeof j.fitScore === 'number' &&
    Number.isFinite(j.fitScore) &&
    j.fitScore >= FIT_SCORE_MIN &&
    j.fitScore <= FIT_SCORE_MAX;
  return (
    typeof j.id === 'string' &&
    typeof j.title === 'string' &&
    typeof j.company === 'string' &&
    typeof j.postingUrl === 'string' &&
    typeof j.description === 'string' &&
    isJobStatus(j.status) &&
    fitOk &&
    typeof j.createdAt === 'string' &&
    typeof j.updatedAt === 'string'
  );
}

/** Parse stored or imported JSON; fills default fitScore for legacy records. */
export function coerceJob(value: unknown): Job | null {
  if (!value || typeof value !== 'object') return null;
  const j = value as Record<string, unknown>;
  if (
    typeof j.id !== 'string' ||
    typeof j.title !== 'string' ||
    typeof j.company !== 'string' ||
    typeof j.postingUrl !== 'string' ||
    typeof j.description !== 'string' ||
    !isJobStatus(j.status) ||
    typeof j.createdAt !== 'string' ||
    typeof j.updatedAt !== 'string'
  ) {
    return null;
  }
  let fitScore = FIT_SCORE_DEFAULT;
  if (typeof j.fitScore === 'number' && Number.isFinite(j.fitScore)) {
    fitScore = clampFitScore(j.fitScore);
  }
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    postingUrl: j.postingUrl,
    description: j.description,
    status: j.status,
    fitScore,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  };
}
