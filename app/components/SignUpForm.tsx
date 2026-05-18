"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface SignUpFormProps {
  onSwitch: () => void;
}

const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character";
  return null;
};

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export default function SignUpForm({ onSwitch }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Check your email for a confirmation link.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#AAB4C3]">
          Full name or Username
        </label>
        <input
          type="text"
          placeholder="Name/Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0032A5] focus:border-transparent transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#AAB4C3]">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0032A5] focus:border-transparent transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#AAB4C3]">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0032A5] focus:border-transparent transition"
        />

        {password.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-2 text-xs ${rule.test(password) ? "text-green-600" : "text-red-500"}`}
              >
                <span className="text-xs">
                  {rule.test(password) ? "✓" : "✗"}
                </span>
                {rule.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {message && (
        <div className="px-4 py-2.5 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#007C91] hover:bg-[#0032A5] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-center text-[#AAB4C3]">
        Already have an account?{" "}
        <span
          onClick={onSwitch}
          className="text-[#007C91] hover:underline hover:text-[#0032A5] cursor-pointer font-medium"
        >
          Sign in
        </span>
      </p>
    </form>
  );
}
