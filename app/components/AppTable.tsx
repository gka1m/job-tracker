"use client";

import { useEffect, useState, useCallback } from "react";
import AddJobModal from "./AddJobModal";

interface Job {
  id: number;
  company: string;
  role: string;
  source: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

const STATUS_STYLES: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-600 border-blue-100",
  INTERVIEW_ASSESSMENT: "bg-yellow-50 text-yellow-600 border-yellow-100",
  OFFER: "bg-green-50 text-green-600 border-green-100",
  REJECTED: "bg-red-50 text-red-600 border-red-100",
};

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEW_ASSESSMENT: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const SOURCE_LABELS: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  DIRECT: "Direct",
  MYCAREERS_FUTURE: "MyCareers Future",
  JOBSTREET: "JobStreet",
  OTHERS: "Others",
};

const AppTable = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [undoTimer, setUndoTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchJobs = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("order", order);
    }

    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, [search, statusFilter, sourceFilter, sortBy, order]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Sort toggle
  const handleSort = (field: string) => {
    if (sortBy === field) setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return (
      <span className="text-blue-500 ml-1">{order === "asc" ? "↑" : "↓"}</span>
    );
  };

  // Selection
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === jobs.length ? [] : jobs.map((j) => j.id),
    );
  };

  // Delete with undo
  const handleDelete = () => {
    if (selected.length === 0) return;
    setPendingDelete(selected);
    setSelected([]);
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(async () => {
      await fetch("/api/jobs/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      setPendingDelete([]);
      fetchJobs();
    }, 5000);

    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (undoTimer) clearTimeout(undoTimer);
    setUndoTimer(null);
    setPendingDelete([]);
    setCountdown(0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const visibleJobs = jobs.filter((j) => !pendingDelete.includes(j.id));

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          <option value="">All statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW_ASSESSMENT">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          <option value="">All sources</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="DIRECT">Direct</option>
          <option value="MYCAREERS_FUTURE">MyCareers Future</option>
          <option value="JOBSTREET">JobStreet</option>
          <option value="OTHERS">Others</option>
        </select>

        <div className="ml-auto flex items-center gap-3">
          {selected.length > 0 && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
            >
              Delete {selected.length} selected
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)} // hook up add modal later
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            + Add application
          </button>
        </div>
      </div>

      {/* Undo toast */}
      {pendingDelete.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white text-sm rounded-lg">
          <span>
            Deleting {pendingDelete.length} application
            {pendingDelete.length > 1 ? "s" : ""}... ({countdown}s)
          </span>
          <button
            onClick={handleUndo}
            className="ml-4 text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading...
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            No applications found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === jobs.length && jobs.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded cursor-pointer"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-800"
                  onClick={() => handleSort("company")}
                >
                  Company <SortIcon field="company" />
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-800"
                  onClick={() => handleSort("role")}
                >
                  Role <SortIcon field="role" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Source
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-800"
                  onClick={() => handleSort("appliedAt")}
                >
                  Date <SortIcon field="appliedAt" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-gray-50 transition-colors ${selected.includes(job.id) ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(job.id)}
                      onChange={() => toggleSelect(job.id)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {job.company}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{job.role}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {SOURCE_LABELS[job.source] ?? job.source}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[job.status]}`}
                    >
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(job.appliedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {}} // hook up edit modal later
                        className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelected([job.id]);
                          handleDelete();
                        }}
                        className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Add modal */}
      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchJobs}
        />
      )}
    </div>
  );
};

export default AppTable;
