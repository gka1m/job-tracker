"use client";

import { useState } from "react";

interface Job {
  id: number;
  company: string;
  role: string;
  source: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

interface AddJobModalProps {
  job?: Job; // if passed, edit mode. if not, add mode
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddJobModal({
  job,
  onClose,
  onSuccess,
}: AddJobModalProps) {
  const isEditing = !!job;

  const [form, setForm] = useState({
    company: job?.company || "",
    role: job?.role || "",
    status: job?.status || "APPLIED",
    source: job?.source || "OTHERS",
    appliedAt: job?.appliedAt
      ? new Date(job.appliedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: job?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      appliedAt: new Date(form.appliedAt).toISOString(),
    };

    const url = isEditing ? `/api/jobs/${job.id}` : "/api/jobs";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError(
        `Failed to ${isEditing ? "update" : "add"} application. Please try again.`,
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit application" : "Add application"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Company</label>
            <input
              name="company"
              type="text"
              placeholder="e.g. Google"
              value={form.company}
              onChange={handleChange}
              required
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Role</label>
            <input
              name="role"
              type="text"
              placeholder="e.g. Software Engineer"
              value={form.role}
              onChange={handleChange}
              required
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW_ASSESSMENT">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Source
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="LINKEDIN">LinkedIn</option>
                <option value="DIRECT">Direct</option>
                <option value="MYCAREERS_FUTURE">MyCareers Future</option>
                <option value="JOBSTREET">JobStreet</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Date applied
            </label>
            <input
              name="appliedAt"
              type="date"
              value={form.appliedAt}
              onChange={handleChange}
              required
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Any notes about this application..."
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
