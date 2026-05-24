"use client";
import { useEffect, useState, useCallback } from "react";
import AddJobModal from "./AddJobModal";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Job {
  id: number;
  company: string;
  role: string;
  source: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

interface AppTableProps {
  page: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
}

const STATUS_STYLES: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-600 border-blue-100",
  INTERVIEW_ASSESSMENT: "bg-yellow-50 text-yellow-600 border-yellow-100",
  OFFER: "bg-green-50 text-green-600 border-green-100",
  REJECTED: "bg-red-50 text-red-600 border-red-100",
};

// const STATUS_LABELS: Record<string, string> = {
//   APPLIED: "Applied",
//   INTERVIEW_ASSESSMENT: "Interview",
//   OFFER: "Offer",
//   REJECTED: "Rejected",
// };

const SOURCE_LABELS: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  DIRECT: "Direct",
  MYCAREERS_FUTURE: "MyCareers Future",
  JOBSTREET: "JobStreet",
  OTHERS: "Others",
};

const AppTable = ({ page, setTotalPages }: AppTableProps) => {
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
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("order", order);
    }
    params.set("page", String(page)); // ← use page prop
    params.set("limit", "10");

    const res = await fetch(`/api/jobs?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setTotalPages(data.totalPages ?? 1); // ← tell parent totalPages
    setLoading(false);
  }, [search, statusFilter, sourceFilter, sortBy, order, page]); // ← page in deps

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
  const handleDelete = (idsToDelete: number[]) => {
    if (idsToDelete.length === 0) return;
    setPendingDelete(idsToDelete);
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
        body: JSON.stringify({ ids: idsToDelete }),
      });
      setPendingDelete([]);
      fetchJobs();
      window.dispatchEvent(new Event("jobs-updated")); // ← add this
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
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-[#F5F7FA] placeholder-[#AAB4C3] text-black focus:outline-none focus:ring-2 focus:ring-[#0E2A47] w-64"
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
              onClick={() => handleDelete(selected)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
            >
              Delete {selected.length} selected
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)} // hook up add modal later
            className="px-4 py-2 text-sm font-medium text-white bg-[#007C91] hover:bg-[#0E2A47] rounded-lg transition-colors cursor-pointer"
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
      <div className="bg-white/10 rounded-xl border border-white/30 overflow-hidden">
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
            <thead className="bg-white/20 border-b border-white/20">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#F5F7FA] cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selected.length === jobs.length && jobs.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded cursor-pointer"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-[#F5F7FA] cursor-pointer hover:text-gray-800"
                  onClick={() => handleSort("company")}
                >
                  Company <SortIcon field="company" />
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-[#F5F7FA] cursor-pointer hover:text-gray-800"
                  onClick={() => handleSort("role")}
                >
                  Role <SortIcon field="role" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#F5F7FA]">
                  Source
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#F5F7FA]">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-[#F5F7FA] cursor-pointer hover:text-gray-800"
                  onClick={() => handleSort("appliedAt")}
                >
                  Date <SortIcon field="appliedAt" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#F5F7FA]">
                  Remarks
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#F5F7FA]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`group border-b border-white/20 hover:bg-white/20 transition-colors ${selected.includes(job.id) ? "bg-white/20" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(job.id)}
                      onChange={() => toggleSelect(job.id)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-[#F5F7FA]">
                    {job.company}
                  </td>
                  <td className="px-4 py-3 text-[#F5F7FA]">{job.role}</td>
                  <td className="px-4 py-3 text-[#F5F7FA]">
                    {SOURCE_LABELS[job.source] ?? job.source}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={job.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;

                        // optimistic update
                        setJobs((prev) =>
                          prev.map((j) =>
                            j.id === job.id ? { ...j, status: newStatus } : j,
                          ),
                        );

                        const {
                          data: { session },
                        } = await supabase.auth.getSession();
                        const token = session?.access_token;

                        await fetch(`/api/jobs/${job.id}`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`, // ← add this
                          },
                          body: JSON.stringify({ status: newStatus }),
                        });

                        window.dispatchEvent(new Event("jobs-updated"));
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none ${STATUS_STYLES[job.status]}`}
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW_ASSESSMENT">
                        Interview/Assessment
                      </option>
                      <option value="OFFER">Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#AAB4C3]">
                    {formatDate(job.appliedAt)}
                  </td>
                  <td className="px-4 py-3 text-[#AAB4C3] max-w-xs truncate">
                    {job.notes || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingJob(job)}
                        className="p-1.5 rounded-lg text-[#007C91] hover:text-[#0E2A47] hover:bg-[#AAB4C3] transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete([job.id])}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
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
          onSuccess={async () => {
            await fetchJobs();
            window.dispatchEvent(new Event("jobs-updated"));
          }}
        />
      )}
      {editingJob && (
        <AddJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={async () => {
            await fetchJobs();
            setEditingJob(null);
            window.dispatchEvent(new Event("jobs-updated"));
          }}
        />
      )}
    </div>
  );
};

export default AppTable;
