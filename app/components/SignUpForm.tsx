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
      options: {
        data: { name },
      },
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
    <form
      onSubmit={handleSignUp}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {password.length > 0 && (
        <ul
          style={{
            fontSize: "12px",
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <li style={{ color: password.length >= 8 ? "green" : "red" }}>
            {password.length >= 8 ? "✓" : "✗"} At least 8 characters
          </li>
          <li style={{ color: /[A-Z]/.test(password) ? "green" : "red" }}>
            {/[A-Z]/.test(password) ? "✓" : "✗"} One uppercase letter
          </li>
          <li style={{ color: /[a-z]/.test(password) ? "green" : "red" }}>
            {/[a-z]/.test(password) ? "✓" : "✗"} One lowercase letter
          </li>
          <li style={{ color: /[0-9]/.test(password) ? "green" : "red" }}>
            {/[0-9]/.test(password) ? "✓" : "✗"} One number
          </li>
          <li
            style={{ color: /[^A-Za-z0-9]/.test(password) ? "green" : "red" }}
          >
            {/[^A-Za-z0-9]/.test(password) ? "✓" : "✗"} One special character
          </li>
        </ul>
      )}

      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
      {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Create account"}
      </button>

      <p style={{ fontSize: "14px", textAlign: "center" }}>
        Already have an account?{" "}
        <span
          onClick={onSwitch}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Sign in
        </span>
      </p>
    </form>
  );
}
