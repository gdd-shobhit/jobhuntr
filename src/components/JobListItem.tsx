import { FIT_SCORE_MAX, STATUS_LABELS, type Job } from '../types/job';

interface JobListItemProps {
  job: Job;
  active: boolean;
  onSelect: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function JobListItem({ job, active, onSelect }: JobListItemProps) {
  return (
    <button
      type="button"
      className={`job-list-item${active ? ' active' : ''}`}
      onClick={() => onSelect(job.id)}
      aria-current={active ? 'true' : undefined}
    >
      <div className="job-list-item-row">
        <span className="job-list-item-title">{job.title || 'Untitled'}</span>
        <span className={`status-dot status-${job.status}`} aria-hidden="true" />
      </div>
      <div className="job-list-item-row secondary">
        <span className="job-list-item-company">
          {job.company || 'No company'}
        </span>
        <span className="job-list-item-meta">
          <span className="job-list-item-fit" title="Fit score">
            {job.fitScore}/{FIT_SCORE_MAX}
          </span>
          <span className="job-list-item-date">{formatDate(job.updatedAt)}</span>
        </span>
      </div>
      <span className="sr-only">
        Fit score {job.fitScore} out of {FIT_SCORE_MAX}. Status:{' '}
        {STATUS_LABELS[job.status]}
      </span>
    </button>
  );
}
