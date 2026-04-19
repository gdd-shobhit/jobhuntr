import { useEffect, useMemo, useRef, useState } from 'react';
import { JobDetails } from './components/JobDetails';
import { JobForm } from './components/JobForm';
import { JobListItem } from './components/JobListItem';
import {
  StatusFilter,
  type StatusFilterValue,
} from './components/StatusFilter';
import { useJobs } from './hooks/useJobs';
import { coerceJob, type Job } from './types/job';
import './App.css';

type View =
  | { kind: 'empty' }
  | { kind: 'view'; id: string }
  | { kind: 'add' }
  | { kind: 'edit'; id: string };

function downloadBlob(filename: string, data: string) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function App() {
  const { jobs, addJob, updateJob, deleteJob, replaceAll } = useJobs();
  const [filter, setFilter] = useState<StatusFilterValue>('all');
  const [search, setSearch] = useState('');
  const [minFitScore, setMinFitScore] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'fit'>('recent');
  const [view, setView] = useState<View>({ kind: 'empty' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredJobs = useMemo(() => {
    const byStatus =
      filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);
    const byFit =
      minFitScore <= 0
        ? byStatus
        : byStatus.filter((j) => j.fitScore >= minFitScore);
    const q = search.trim().toLowerCase();
    const matched = q
      ? byFit.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q),
        )
      : byFit;
    const sorted = [...matched];
    if (sortBy === 'fit') {
      sorted.sort((a, b) => {
        if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    } else {
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return sorted;
  }, [jobs, filter, search, minFitScore, sortBy]);

  const selectedId =
    view.kind === 'view' || view.kind === 'edit' ? view.id : null;

  const selectedJob = useMemo(
    () => (selectedId ? jobs.find((j) => j.id === selectedId) ?? null : null),
    [jobs, selectedId],
  );

  useEffect(() => {
    if (selectedId && !selectedJob) {
      setView({ kind: 'empty' });
    }
  }, [selectedId, selectedJob]);

  const handleExport = () => {
    const payload = JSON.stringify(jobs, null, 2);
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(`job-hunt-tracker-${date}.json`, payload);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
      const valid = parsed
        .map(coerceJob)
        .filter((j): j is Job => j !== null);
      if (valid.length === 0) {
        alert('No valid jobs found in file.');
        return;
      }
      const mode = confirm(
        `Import ${valid.length} jobs.\n\nOK: replace current list.\nCancel: merge into current list.`,
      );
      if (mode) {
        replaceAll(valid);
      } else {
        const existingIds = new Set(jobs.map((j) => j.id));
        const merged = [
          ...jobs,
          ...valid.filter((j) => !existingIds.has(j.id)),
        ];
        replaceAll(merged);
      }
      setView({ kind: 'empty' });
    } catch (err) {
      alert(
        `Could not import file: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }
  };

  const renderRightPane = () => {
    if (view.kind === 'add') {
      return (
        <div className="pane-body">
          <div className="pane-header">
            <h2>Add a job</h2>
          </div>
          <JobForm
            submitLabel="Save job"
            onSubmit={(draft) => {
              const created = addJob(draft);
              setView({ kind: 'view', id: created.id });
            }}
            onCancel={() => setView({ kind: 'empty' })}
          />
        </div>
      );
    }

    if (view.kind === 'edit' && selectedJob) {
      return (
        <div className="pane-body">
          <div className="pane-header">
            <h2>Edit job</h2>
          </div>
          <JobForm
            initial={selectedJob}
            submitLabel="Save changes"
            onSubmit={(draft) => {
              updateJob(selectedJob.id, draft);
              setView({ kind: 'view', id: selectedJob.id });
            }}
            onCancel={() => setView({ kind: 'view', id: selectedJob.id })}
          />
        </div>
      );
    }

    if (view.kind === 'view' && selectedJob) {
      return (
        <div className="pane-body">
          <JobDetails
            job={selectedJob}
            onUpdate={updateJob}
            onDelete={(id) => {
              deleteJob(id);
              setView({ kind: 'empty' });
            }}
            onEdit={() => setView({ kind: 'edit', id: selectedJob.id })}
          />
        </div>
      );
    }

    return (
      <div className="pane-body pane-empty">
        <div className="empty-state-large">
          <h2>No job selected</h2>
          <p>
            {jobs.length === 0
              ? 'Add your first job posting to start tracking your applications.'
              : 'Select a job from the list on the left to view its details.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setView({ kind: 'add' })}
          >
            + Add a job
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <aside className="left-pane">
        <div className="left-pane-header">
          <div className="left-pane-title-row">
            <h1>Jobs</h1>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setView({ kind: 'add' })}
            >
              + Add
            </button>
          </div>
          <input
            type="search"
            className="search-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <StatusFilter value={filter} onChange={setFilter} jobs={jobs} />
          <div className="left-pane-filters-row">
            <label className="compact-field">
              <span className="compact-label">Min fit</span>
              <select
                value={minFitScore}
                onChange={(e) =>
                  setMinFitScore(Number.parseInt(e.target.value, 10))
                }
                aria-label="Minimum fit score"
              >
                <option value={0}>Any</option>
                {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </label>
            <label className="compact-field">
              <span className="compact-label">Sort</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'recent' | 'fit')
                }
                aria-label="Sort jobs"
              >
                <option value="recent">Recent</option>
                <option value="fit">Fit (high first)</option>
              </select>
            </label>
          </div>
        </div>

        <div className="left-pane-list">
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              {jobs.length === 0 ? (
                <>
                  <p>No jobs yet.</p>
                  <p className="empty-hint">Click "+ Add" to get started.</p>
                </>
              ) : (
                <p>No jobs match this filter.</p>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                active={selectedId === job.id}
                onSelect={(id) => setView({ kind: 'view', id })}
              />
            ))
          )}
        </div>

        <div className="left-pane-footer">
          <span className="count">
            {jobs.length} job{jobs.length === 1 ? '' : 's'}
          </span>
          <div className="footer-actions">
            <button
              type="button"
              className="btn-link"
              onClick={handleImportClick}
            >
              Import
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={handleExport}
              disabled={jobs.length === 0}
            >
              Export
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </aside>

      <main className="right-pane">{renderRightPane()}</main>
    </div>
  );
}

export default App;
