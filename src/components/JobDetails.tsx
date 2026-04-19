import {
  FIT_SCORE_MAX,
  FIT_SCORE_MIN,
  JOB_STATUSES,
  STATUS_LABELS,
  type Job,
  type JobDraft,
  type JobStatus,
} from '../types/job';

interface JobDetailsProps {
  job: Job;
  onUpdate: (id: string, changes: Partial<JobDraft>) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function JobDetails({
  job,
  onUpdate,
  onDelete,
  onEdit,
}: JobDetailsProps) {
  const description = job.description.trim();

  return (
    <article className="job-details">
      <header className="job-details-header">
        <div className="job-details-title-group">
          <h2 className="job-details-title">{job.title || 'Untitled'}</h2>
          {job.company && (
            <p className="job-details-company">{job.company}</p>
          )}
        </div>
        <div className="job-details-badges">
          <span className="fit-score-badge" title="Fit score">
            Fit {job.fitScore}/{FIT_SCORE_MAX}
          </span>
          <span className={`status-badge status-${job.status}`}>
            {STATUS_LABELS[job.status]}
          </span>
        </div>
      </header>

      <div className="job-details-meta">
        <a
          href={job.postingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="job-details-link"
        >
          {job.postingUrl}
        </a>
      </div>

      <div className="job-details-toolbar">
        <div className="toolbar-fields">
          <label className="inline-field">
            <span className="inline-label">Fit</span>
            <select
              value={job.fitScore}
              onChange={(e) =>
                onUpdate(job.id, {
                  fitScore: Number.parseInt(e.target.value, 10),
                })
              }
              aria-label="Fit score"
            >
              {Array.from(
                { length: FIT_SCORE_MAX - FIT_SCORE_MIN + 1 },
                (_, i) => FIT_SCORE_MIN + i,
              ).map((n) => (
                <option key={n} value={n}>
                  {n} — {n <= 2 ? 'low' : n >= 4 ? 'high' : 'mid'}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-field">
            <span className="inline-label">Status</span>
            <select
              value={job.status}
              onChange={(e) =>
                onUpdate(job.id, { status: e.target.value as JobStatus })
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
        <div className="job-details-actions">
          <button type="button" className="btn btn-ghost" onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`Delete "${job.title || 'this job'}"?`)) {
                onDelete(job.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <section className="job-details-section">
        <h3>Description</h3>
        {description ? (
          <p className="job-details-description">{description}</p>
        ) : (
          <p className="job-details-empty">No description added.</p>
        )}
      </section>

      <footer className="job-details-footer">
        <span>Added {formatDateTime(job.createdAt)}</span>
        <span>Updated {formatDateTime(job.updatedAt)}</span>
      </footer>
    </article>
  );
}
