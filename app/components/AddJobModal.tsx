"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const payload = {
      ...form,
      appliedAt: new Date(form.appliedAt).toISOString(),
    };

    const url = isEditing ? `/api/jobs/${job!.id}` : "/api/jobs";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white/90 rounded-2xl backdrop-blur-sm shadow-lg border border-white/60 w-full max-w-md mx-4 p-6 flex flex-col gap-5">
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
            <label className="text-sm font-medium text-black">Company</label>
            <input
              name="company"
              type="text"
              placeholder="e.g. Google"
              value={form.company}
              onChange={handleChange}
              required
              className="text-black px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-[#AAB4C3] focus:outline-none focus:ring-2 focus:ring-[#0E2A47]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Role</label>
            <input
              name="role"
              type="text"
              placeholder="e.g. Software Engineer"
              value={form.role}
              onChange={handleChange}
              required
              className="text-black px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-[#AAB4C3] focus:outline-none focus:ring-2 focus:ring-[#0E2A47]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Source</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A47] text-gray-700"
            >
              <option value="LINKEDIN">LinkedIn</option>
              <option value="DIRECT">Direct</option>
              <option value="MYCAREERS_FUTURE">MyCareers Future</option>
              <option value="JOBSTREET">JobStreet</option>
              <option value="OTHERS">Others</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">
              Date applied
            </label>
            <input
              name="appliedAt"
              type="date"
              value={form.appliedAt}
              onChange={handleChange}
              required
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A47] text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Any notes about this application..."
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-black placeholder-[#AAB4C3] focus:outline-none focus:ring-2 focus:ring-[#0E2A47]"
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
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-black hover:bg-[#AAB4C3] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[#0032A5] hover:bg-[#0E2A47] text-[#F5F7FA] text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
