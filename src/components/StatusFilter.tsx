import {
  JOB_STATUSES,
  STATUS_LABELS,
  type Job,
  type JobStatus,
} from '../types/job';

export type StatusFilterValue = JobStatus | 'all';

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  jobs: Job[];
}

export function StatusFilter({ value, onChange, jobs }: StatusFilterProps) {
  const counts = jobs.reduce<Record<string, number>>(
    (acc, job) => {
      acc.all += 1;
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    },
    { all: 0 },
  );

  const options: { key: StatusFilterValue; label: string }[] = [
    { key: 'all', label: 'All' },
    ...JOB_STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s] })),
  ];

  return (
    <div className="status-filter" role="tablist" aria-label="Filter by status">
      {options.map((opt) => {
        const active = value === opt.key;
        const count = counts[opt.key] ?? 0;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`filter-tab${active ? ' active' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
            <span className="filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
