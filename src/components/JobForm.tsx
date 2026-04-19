import { useEffect, useState, type FormEvent } from 'react';
import {
  FIT_SCORE_DEFAULT,
  FIT_SCORE_MAX,
  FIT_SCORE_MIN,
  JOB_STATUSES,
  STATUS_LABELS,
  type Job,
  type JobDraft,
  type JobStatus,
} from '../types/job';

interface JobFormProps {
  initial?: Job;
  submitLabel?: string;
  onSubmit: (draft: JobDraft) => void;
  onCancel?: () => void;
}

const emptyDraft: JobDraft = {
  title: '',
  company: '',
  postingUrl: '',
  description: '',
  status: 'not_applied',
  fitScore: FIT_SCORE_DEFAULT,
  coverLetterNeeded: false,
};

function fromJob(job: Job): JobDraft {
  return {
    title: job.title,
    company: job.company,
    postingUrl: job.postingUrl,
    description: job.description,
    status: job.status,
    fitScore: job.fitScore,
    coverLetterNeeded: job.coverLetterNeeded,
  };
}

export function JobForm({
  initial,
  submitLabel = 'Add job',
  onSubmit,
  onCancel,
}: JobFormProps) {
  const [draft, setDraft] = useState<JobDraft>(() =>
    initial ? fromJob(initial) : emptyDraft,
  );

  useEffect(() => {
    setDraft(initial ? fromJob(initial) : emptyDraft);
  }, [initial]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.postingUrl.trim()) return;
    onSubmit(draft);
    if (!initial) setDraft(emptyDraft);
  };

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Title *</span>
          <input
            type="text"
            required
            placeholder="Senior Frontend Engineer"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field-label">Company</span>
          <input
            type="text"
            placeholder="Acme Inc."
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          />
        </label>
      </div>

      <div className="field-row">
        <label className="field field-grow">
          <span className="field-label">Posting URL *</span>
          <input
            type="url"
            required
            placeholder="https://www.linkedin.com/jobs/view/..."
            value={draft.postingUrl}
            onChange={(e) =>
              setDraft({ ...draft, postingUrl: e.target.value })
            }
          />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value as JobStatus })
            }
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="fit-score-field">
        <div className="fit-score-header">
          <span className="field-label">Fit score</span>
          <span className="fit-score-value" aria-live="polite">
            {draft.fitScore}/{FIT_SCORE_MAX}
          </span>
        </div>
        <p className="fit-score-hint">
          How well you match this role ({FIT_SCORE_MIN} = poor fit,{' '}
          {FIT_SCORE_MAX} = strong fit). Use this to filter and sort later.
        </p>
        <input
          type="range"
          className="fit-score-range"
          min={FIT_SCORE_MIN}
          max={FIT_SCORE_MAX}
          step={1}
          value={draft.fitScore}
          onChange={(e) =>
            setDraft({
              ...draft,
              fitScore: Number.parseInt(e.target.value, 10),
            })
          }
          aria-valuemin={FIT_SCORE_MIN}
          aria-valuemax={FIT_SCORE_MAX}
          aria-valuenow={draft.fitScore}
          aria-label="Fit score"
        />
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={draft.coverLetterNeeded}
          onChange={(e) =>
            setDraft({ ...draft, coverLetterNeeded: e.target.checked })
          }
        />
        <span>Cover letter needed</span>
      </label>

      <label className="field">
        <span className="field-label">Description</span>
        <textarea
          rows={8}
          placeholder="Paste the full job description from LinkedIn, Indeed, Greenhouse..."
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </label>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
