import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clampFitScore,
  coerceJob,
  type Job,
  type JobDraft,
} from '../types/job';

const STORAGE_KEY = 'job-hunt-tracker:v1';

function loadJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(coerceJob)
      .filter((j): j is Job => j !== null);
  } catch {
    return [];
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface UseJobs {
  jobs: Job[];
  addJob: (draft: JobDraft) => Job;
  updateJob: (id: string, changes: Partial<JobDraft>) => void;
  deleteJob: (id: string) => void;
  replaceAll: (next: Job[]) => void;
}

export function useJobs(): UseJobs {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      // Silently ignore quota / serialization failures; UI state remains correct.
    }
  }, [jobs]);

  const addJob = useCallback((draft: JobDraft): Job => {
    const now = new Date().toISOString();
    const job: Job = {
      id: newId(),
      title: draft.title.trim(),
      company: draft.company.trim(),
      postingUrl: draft.postingUrl.trim(),
      description: draft.description,
      status: draft.status,
      fitScore: clampFitScore(draft.fitScore),
      coverLetterNeeded: draft.coverLetterNeeded,
      createdAt: now,
      updatedAt: now,
    };
    setJobs((prev) => [job, ...prev]);
    return job;
  }, []);

  const updateJob = useCallback(
    (id: string, changes: Partial<JobDraft>) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                ...changes,
                title: changes.title !== undefined ? changes.title.trim() : j.title,
                company:
                  changes.company !== undefined ? changes.company.trim() : j.company,
                postingUrl:
                  changes.postingUrl !== undefined
                    ? changes.postingUrl.trim()
                    : j.postingUrl,
                fitScore:
                  changes.fitScore !== undefined
                    ? clampFitScore(changes.fitScore)
                    : j.fitScore,
                coverLetterNeeded:
                  changes.coverLetterNeeded !== undefined
                    ? changes.coverLetterNeeded
                    : j.coverLetterNeeded,
                updatedAt: new Date().toISOString(),
              }
            : j,
        ),
      );
    },
    [],
  );

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const replaceAll = useCallback((next: Job[]) => {
    setJobs(next);
  }, []);

  return { jobs, addJob, updateJob, deleteJob, replaceAll };
}
