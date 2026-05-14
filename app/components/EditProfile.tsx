"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

const EditProfile = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setName(user.user_metadata?.name || "");
        setEmail(user.email || "");
        setNewEmail(user.email || "");
        setLoading(false);
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const updates: { data?: { name: string }; email?: string } = {};
    updates.data = { name };
    if (newEmail !== email) updates.email = newEmail;

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      setError(error.message);
    } else if (newEmail !== email) {
      setMessage(
        "Profile updated. Check your new email inbox for a confirmation link.",
      );
    } else {
      setMessage("Profile updated successfully.");
    }

    setSaving(false);
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-md w-full">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Full name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Email</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {newEmail !== email && (
          <p className="text-xs text-yellow-600">
            A confirmation link will be sent to this email before the change
            takes effect.
          </p>
        )}
      </div>

      {message && (
        <div className="px-4 py-2.5 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditProfile;
